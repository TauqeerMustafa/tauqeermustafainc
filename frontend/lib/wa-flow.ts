/**
 * wa-flow.ts
 * TMI WhatsApp Lead Triage — Conversation State Machine
 * Flow: Welcome -> Service Menu -> Sub-scope -> Timeline -> Contact Details -> Human Handoff
 */

import { getKV } from "@/lib/kv";
import { getSession, setSession, clearSession, appendMessage, type Session, type FlowStage, type ServiceKey, type WAMessage } from "@/lib/wa-store";
import { primaryNumberId, waNumbers, resolveNumberId, getChannelDepartment, DEFAULT_PK_ID } from "@/lib/wa-numbers";
import { accountAt } from "@/lib/wa-accounts";
import { notify } from "@/lib/wa-notify";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

// ---------- Constants & Company Info ----------

const COMPANY_NAME = "Tauqeer Mustafa Inc";
const WEBSITE = "https://tauqeermustafa.com";
const HOURS = "Monday to Saturday, 09:00 to 18:00 (PKT)";
const HOTLINE = "+92 335 6701199";
const REP_QUEUE_CHANNEL = process.env.REP_QUEUE_CHANNEL ?? "#leads-inbound";

// ---------- Service catalogue (mirrors tauqeermustafa.com/services) ----------

export const SERVICES: Record<
  Exclude<ServiceKey, "client_services" | "careers" | "human">,
  { label: string; desc: string; subOptions: { id: string; label: string }[] }
> = {
  web: {
    label: "Web & Platforms",
    desc: "Modern web platforms, portals, apps & APIs",
    subOptions: [
      { id: "web_new", label: "New Project / MVP" },
      { id: "web_migration", label: "Rebuild / Upgrade" },
      { id: "web_perf", label: "Speed & Performance" },
    ],
  },
  cybersecurity: {
    label: "Cybersecurity",
    desc: "Defense, audits, posture & crisis response",
    subOptions: [
      { id: "sec_audit", label: "Security Review" },
      { id: "sec_incident", label: "Incident Response" },
      { id: "sec_access", label: "Access & Identity" },
    ],
  },
  ai: {
    label: "AI & Automation",
    desc: "Workflows, copilots & custom integrations",
    subOptions: [
      { id: "ai_automation", label: "Workflow Automation" },
      { id: "ai_copilot", label: "Custom AI Copilot" },
      { id: "ai_rag", label: "Knowledge Search / RAG" },
    ],
  },
  cloud: {
    label: "Cloud & DevOps",
    desc: "Cloud architecture, CI/CD & scaling",
    subOptions: [
      { id: "cloud_arch", label: "Cloud Architecture" },
      { id: "cloud_cicd", label: "CI/CD & DevOps" },
      { id: "cloud_iac", label: "Terraform & IaC" },
    ],
  },
  uiux: {
    label: "UI/UX & Product",
    desc: "Product design, user flows & systems",
    subOptions: [
      { id: "ux_research", label: "User Research" },
      { id: "ux_design", label: "UI & Design System" },
    ],
  },
};

// ---------- Meta Graph API Sending Helpers ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getSenderCredentials(channelId?: string) {
  const resolved = resolveNumberId(channelId);
  const actualPhoneId = resolved.ok ? resolved.id : (primaryNumberId() || DEFAULT_PK_ID);
  const numberDef = waNumbers().find((n) => n.id === actualPhoneId || n.id === channelId);
  const slot = numberDef?.slot ?? 1;
  const account = accountAt(slot);
  const token = account.token || accountAt(1).token;
  return { actualPhoneId, token: token ?? "", slot };
}

/** Mark incoming message as read */
async function sendTypingAndDelay(to: string, msgId?: string, channelId?: string) {
  const { actualPhoneId, token } = await getSenderCredentials(channelId);
  if (!token) return;

  try {
    if (msgId) {
      await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: msgId,
        }),
      }).catch(() => {});
    }
  } catch {}
}

export async function sendMessage(to: string, bodyText: string, channelId?: string, msgId?: string) {
  const { actualPhoneId, token, slot } = await getSenderCredentials(channelId);
  if (!token) {
    console.error(`[wa-flow] Missing token for sender ${actualPhoneId} (slot ${slot})`);
    return;
  }

  await sendTypingAndDelay(to, msgId, channelId);

  const res = await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: bodyText, preview_url: false },
    }),
  }).catch((e) => {
    console.error("[wa-flow] sendMessage network error:", e);
    return null;
  });

  const json = res ? await res.json().catch(() => null) : null;
  const sentId = json?.messages?.[0]?.id || `bot_${Date.now()}`;

  if (!res || !res.ok) {
    console.error(`[wa-flow] Meta sendMessage FAILED (${res?.status}):`, JSON.stringify(json));
  } else {
    console.log(`[wa-flow] Meta sendMessage SUCCESS (${res.status}): to ${to}, sentId = ${sentId}`);
  }

  // Log outbound message to store for dashboard visibility
  await appendMessage({
    id: sentId,
    from: actualPhoneId,
    to,
    jid: `${to}@s.whatsapp.net`,
    channel: channelId || actualPhoneId,
    department: getChannelDepartment(actualPhoneId),
    type: "text",
    body: bodyText,
    timestamp: new Date().toISOString(),
    direction: "outbound",
    status: res?.ok ? "sent" : "failed",
  }).catch(() => {});
}

export async function sendListMessage(
  to: string,
  payload: {
    header?: string;
    body: string;
    footer?: string;
    buttonText: string;
    rows?: { id: string; title: string; description?: string }[];
    sections?: { title: string; rows: { id: string; title: string; description?: string }[] }[];
  },
  channelId?: string,
  msgId?: string
) {
  const { actualPhoneId, token, slot } = await getSenderCredentials(channelId);
  if (!token) {
    console.error(`[wa-flow] Missing token for sender ${actualPhoneId} (slot ${slot})`);
    return;
  }

  await sendTypingAndDelay(to, msgId, channelId);

  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

  const sections = payload.sections
    ? payload.sections.map((sec) => ({
        title: cut(sec.title, 24),
        rows: sec.rows.map((r) => ({
          id: r.id,
          title: cut(r.title, 24),
          ...(r.description ? { description: cut(r.description, 72) } : {}),
        })),
      }))
    : [
        {
          title: "Capabilities",
          rows: (payload.rows || []).slice(0, 10).map((r) => ({
            id: r.id,
            title: cut(r.title, 24),
            ...(r.description ? { description: cut(r.description, 72) } : {}),
          })),
        },
      ];

  const listPayload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: cut(payload.body, 1024) },
      action: {
        button: cut(payload.buttonText, 20),
        sections,
      },
    },
  };

  if (payload.header && payload.header.trim()) {
    listPayload.interactive.header = { type: "text", text: cut(payload.header.trim(), 60) };
  }
  if (payload.footer && payload.footer.trim()) {
    listPayload.interactive.footer = { text: cut(payload.footer.trim(), 60) };
  }

  const res = await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(listPayload),
  }).catch((e) => {
    console.error("[wa-flow] sendListMessage error:", e);
    return null;
  });

  const json = res ? await res.json().catch(() => null) : null;
  const sentId = json?.messages?.[0]?.id || `bot_list_${Date.now()}`;

  if (!res || !res.ok) {
    console.error(`[wa-flow] Meta sendListMessage FAILED (${res?.status}):`, JSON.stringify(json), "Falling back to plain text send");
    // Reliable fallback: send as plain text with options listed
    const optionsText = sections.flatMap((s) => s.rows.map((r) => `• *${r.title}*${r.description ? ` - ${r.description}` : ""}`)).join("\n");
    const fallbackText = `${payload.body}\n\n${optionsText}`;
    await sendMessage(to, fallbackText, channelId, msgId);
    return;
  } else {
    console.log(`[wa-flow] Meta sendListMessage SUCCESS (${res.status}): to ${to}, sentId = ${sentId}`);
  }

  await appendMessage({
    id: sentId,
    from: actualPhoneId,
    to,
    jid: `${to}@s.whatsapp.net`,
    channel: channelId || actualPhoneId,
    department: getChannelDepartment(actualPhoneId),
    type: "interactive",
    body: `📋 ${payload.body}`,
    timestamp: new Date().toISOString(),
    direction: "outbound",
    status: "sent",
  }).catch(() => {});
}

export async function sendButtonMessage(
  to: string,
  payload: {
    body: string;
    buttons: { id: string; title: string }[];
    header?: string;
    footer?: string;
  },
  channelId?: string,
  msgId?: string
) {
  const { actualPhoneId, token, slot } = await getSenderCredentials(channelId);
  if (!token) {
    console.error(`[wa-flow] Missing token for sender ${actualPhoneId} (slot ${slot})`);
    return;
  }

  await sendTypingAndDelay(to, msgId, channelId);

  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

  const buttonPayload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: cut(payload.body, 1024) },
      action: {
        buttons: payload.buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id, title: cut(b.title, 20) },
        })),
      },
    },
  };

  if (payload.header && payload.header.trim()) {
    buttonPayload.interactive.header = { type: "text", text: cut(payload.header.trim(), 60) };
  }
  if (payload.footer && payload.footer.trim()) {
    buttonPayload.interactive.footer = { text: cut(payload.footer.trim(), 60) };
  }

  const res = await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(buttonPayload),
  }).catch((e) => {
    console.error("[wa-flow] sendButtonMessage error:", e);
    return null;
  });

  const json = res ? await res.json().catch(() => null) : null;
  const sentId = json?.messages?.[0]?.id || `bot_btn_${Date.now()}`;

  if (!res || !res.ok) {
    console.error(`[wa-flow] Meta sendButtonMessage FAILED (${res?.status}):`, JSON.stringify(json), "Falling back to plain text send");
    const btnsText = payload.buttons.map((b) => `👉 *${b.title}*`).join("\n");
    await sendMessage(to, `${payload.body}\n\n${btnsText}`, channelId, msgId);
    return;
  } else {
    console.log(`[wa-flow] Meta sendButtonMessage SUCCESS (${res.status}): to ${to}, sentId = ${sentId}`);
  }

  await appendMessage({
    id: sentId,
    from: actualPhoneId,
    to,
    jid: `${to}@s.whatsapp.net`,
    channel: channelId || actualPhoneId,
    department: getChannelDepartment(actualPhoneId),
    type: "interactive",
    body: `🔘 ${payload.body}`,
    timestamp: new Date().toISOString(),
    direction: "outbound",
    status: "sent",
  }).catch(() => {});
}

// ---------- Entry point: called on inbound WhatsApp message ----------

export async function handleInboundMessage(
  from: string,
  text: string,
  interactiveReplyId?: string,
  channelId?: string,
  msgId?: string
) {
  const clean = (text || "").toLowerCase().trim();

  // Fast-path 1: Instant Emergency / Incident Response
  if (
    /^(urgent|incident|emergency|breach|outage|down|hacked|critical)/i.test(clean) ||
    clean.includes("breach") ||
    clean.includes("server down")
  ) {
    await setSession(from, { stage: "handoff", service: "cybersecurity", startedAt: Date.now() });
    return escalateToEmergency(from, channelId, msgId);
  }

  // Reset trigger: allow restarting lead triage flow at any time
  if (/^(menu|reset|restart|start|help)$/i.test(clean)) {
    session = { stage: "welcome", startedAt: Date.now() };
    await setSession(from, session);
    return sendWelcome(from, channelId, msgId);
  }

  let session = await getSession(from);

  if (!session) {
    // Fast-path 2: Direct Careers
    if (/^(careers|hiring|jobs|join|apply|resume)/i.test(clean)) {
      await setSession(from, { stage: "handoff", service: "careers", startedAt: Date.now() });
      await sendMessage(
        from,
        `We're actively hiring engineers and interns! 🚀\n\n` +
          `Check open roles and apply here:\n` +
          `👉 *${WEBSITE}/careers*\n\n` +
          `Our technical team reviews all applications directly.`,
        channelId,
        msgId
      );
      return;
    }

    // Fast-path 3: Direct Client Services
    if (/^(client|portal|billing|invoice|retainer|account)/i.test(clean)) {
      session = { stage: "handoff", service: "client_services", startedAt: Date.now() };
      await setSession(from, session);
      await sendMessage(
        from,
        `Welcome to our Client Desk!\n\n` +
          `Drop your company name or project details here, and a team lead will help you with your retainer, invoice, or portal access right away.\n\n` +
          `• *Hotline:* ${HOTLINE}`,
        channelId,
        msgId
      );
      return escalateToHuman(from, session, "Client Services Desk request", channelId, msgId);
    }

    session = { stage: "welcome", startedAt: Date.now() };
    await setSession(from, session);
    return sendWelcome(from, channelId, msgId);
  }

  switch (session.stage) {
    case "welcome":
      return sendServiceMenu(from, session, channelId, msgId);
    case "menu":
      return handleMenuSelection(from, session, interactiveReplyId ?? text, channelId, msgId);
    case "scope":
      return handleScopeSelection(from, session, interactiveReplyId ?? text, channelId, msgId);
    case "timeline":
      return handleTimelineSelection(from, session, interactiveReplyId ?? text, channelId, msgId);
    case "intake":
      return handleIntake(from, session, text, channelId, msgId);
    case "handoff":
      // If user greets again after 12 hours, start a fresh triage
      if (Date.now() - session.startedAt > 12 * 3600 * 1000 && /^(hi|hello|hey|salam|hola)/i.test(clean)) {
        session = { stage: "welcome", startedAt: Date.now() };
        await setSession(from, session);
        return sendWelcome(from, channelId, msgId);
      }
      return;
  }
}

// ---------- Step 0: Welcome ----------

async function sendWelcome(to: string, channelId?: string, msgId?: string) {
  const session: Session = { stage: "menu", startedAt: Date.now() };
  await setSession(to, session);
  return sendServiceMenu(to, session, channelId, msgId);
}

// ---------- Step 1: Service Menu ----------

async function sendServiceMenu(to: string, session: Session, channelId?: string, msgId?: string) {
  await sendListMessage(
    to,
    {
      header: COMPANY_NAME,
      body:
        `Hi! Welcome to *Tauqeer Mustafa Inc*.\n\n` +
        `We build high-performance software, custom AI systems, and cloud architecture.\n\n` +
        `What can we help you build today?`,
      footer: `${HOURS}`,
      buttonText: "Explore Options",
      sections: [
        {
          title: "Engineering & Architecture",
          rows: [
            { id: "web", title: "Web & Platforms", description: "Web apps, SaaS portals & APIs" },
            { id: "ai", title: "AI & Automation", description: "Copilots, agents & workflows" },
            { id: "cloud", title: "Cloud & DevOps", description: "Cloud infrastructure, scaling & CI/CD" },
          ],
        },
        {
          title: "Security & Defense",
          rows: [
            { id: "cybersecurity", title: "Cybersecurity", description: "Audits, posture & defense" },
            { id: "incident_fast", title: "Emergency Incident", description: "Rapid response for active outages / breaches" },
          ],
        },
        {
          title: "Product & Advisory",
          rows: [
            { id: "uiux", title: "UI/UX & Product", description: "Product design & design systems" },
            { id: "client_services", title: "Client Desk", description: "Retainers, billing & support" },
            { id: "careers", title: "Careers & Internships", description: "Open roles & engineering positions" },
            { id: "human", title: "Speak to Principal", description: "Direct consultation with lead engineer" },
          ],
        },
      ],
    },
    channelId,
    msgId
  );
  session.stage = "menu";
  await setSession(to, session);
}

async function handleMenuSelection(
  to: string,
  session: Session,
  selection: string,
  channelId?: string,
  msgId?: string
) {
  const key = normalizeSelection(selection);

  if (key === "incident_fast" || key === "incident" || key === "urgent") {
    return escalateToEmergency(to, channelId, msgId);
  }

  if (key === "human" || key === "cat_human") {
    return escalateToHuman(to, session, "Direct principal consultation requested", channelId, msgId);
  }

  if (key === "client_services" || key === "cat_cli") {
    await sendMessage(
      to,
      `Welcome to our Client Desk!\n\n` +
        `Drop your company name or project details here, and a team lead will help you with your retainer, invoice, or portal access right away.\n\n` +
        `• *Hotline:* ${HOTLINE}`,
      channelId,
      msgId
    );
    return escalateToHuman(to, session, "Client Services enquiry", channelId, msgId);
  }

  if (key === "careers" || key === "cat_gen") {
    await sendMessage(
      to,
      `We're actively hiring engineers and interns! 🚀\n\n` +
        `Check open roles and apply here:\n` +
        `👉 *${WEBSITE}/careers*\n\n` +
        `Our technical team reviews all applications directly.`,
      channelId,
      msgId
    );
    return; // Self-serve
  }

  const matchedKey = (
    key === "cat_sec" ? "cybersecurity" : key === "cat_fin" ? "cybersecurity" : key === "cat_seo" ? "web" : key
  ) as ServiceKey;

  if (matchedKey in SERVICES) {
    session.service = matchedKey;
    session.stage = "scope";
    await setSession(to, session);
    return sendScopeOptions(to, session, channelId, msgId);
  }

  // Unrecognized input — re-show menu
  await sendMessage(to, `Please pick an option from the menu below to get started.`, channelId, msgId);
  return sendServiceMenu(to, session, channelId, msgId);
}

// ---------- Step 2: Sub-scope within chosen service ----------

async function sendScopeOptions(to: string, session: Session, channelId?: string, msgId?: string) {
  const service = SERVICES[session.service as keyof typeof SERVICES];
  if (!service) return sendServiceMenu(to, session, channelId, msgId);

  // Critical incident fast-path for cybersecurity
  if (session.service === "cybersecurity") {
    await sendMessage(
      to,
      `🚨 *Active Threat or Outage?*\n` +
        `Reply *urgent* immediately or call our 24/7 hotline directly: ${HOTLINE}.`,
      channelId,
      msgId
    );
  }

  await sendButtonMessage(
    to,
    {
      body: `*${service.label}*\nSelect your primary objective:`,
      buttons: service.subOptions.map((o) => ({ id: o.id, title: o.label })),
    },
    channelId,
    msgId
  );
}

async function handleScopeSelection(
  to: string,
  session: Session,
  selection: string,
  channelId?: string,
  msgId?: string
) {
  const normalized = selection.toLowerCase().trim();

  if ((normalized === "incident" || normalized === "urgent") && session.service === "cybersecurity") {
    return escalateToEmergency(to, channelId, msgId);
  }

  const service = SERVICES[session.service as keyof typeof SERVICES];
  const match = service?.subOptions.find(
    (o) => o.id === normalized || o.label.toLowerCase() === normalized || normalized.includes(o.id)
  );

  if (!match) {
    await sendMessage(to, `Please tap one of the options above so we can guide you accurately.`, channelId, msgId);
    return sendScopeOptions(to, session, channelId, msgId);
  }

  session.scope = match.label;
  session.stage = "timeline";
  await setSession(to, session);
  return sendTimelineOptions(to, channelId, msgId);
}

// ---------- Step 3: Timeline ----------

async function sendTimelineOptions(to: string, channelId?: string, msgId?: string) {
  await sendButtonMessage(
    to,
    {
      body: `When are you planning to kick off?`,
      buttons: [
        { id: "immediate", title: "< 2 Weeks" },
        { id: "planned", title: "1–3 Months" },
        { id: "exploration", title: "Advisory / Scoping" },
      ],
    },
    channelId,
    msgId
  );
}

async function handleTimelineSelection(
  to: string,
  session: Session,
  selection: string,
  channelId?: string,
  msgId?: string
) {
  const map: Record<string, string> = {
    immediate: "< 2 Weeks",
    planned: "1–3 Months",
    exploration: "Advisory / Scoping",
  };
  const normalized = selection.toLowerCase().trim();
  const timeline =
    map[normalized] ||
    (normalized.includes("2") || normalized.includes("asap") || normalized.includes("immed")
      ? map.immediate
      : normalized.includes("plan") || normalized.includes("month") || normalized.includes("quarter")
      ? map.planned
      : map.exploration);

  session.timeline = timeline;
  session.stage = "intake";
  await setSession(to, session);

  await sendMessage(
    to,
    `Got it! To help us prepare your proposal, please share:\n\n` +
      `1. *Company / Project Name*\n` +
      `2. *What you need built or solved*\n\n` +
      `Our Lead Engineer will review and reply in this thread!`,
    channelId,
    msgId
  );
}

// ---------- Step 4: Intake -> Handoff ----------

async function handleIntake(to: string, session: Session, text: string, channelId?: string, msgId?: string) {
  if (!text || text.trim().length < 3) {
    await sendMessage(
      to,
      `Please share a brief note (company name and what you need built or solved) so our lead engineer can review and reply.`,
      channelId,
      msgId
    );
    return;
  }

  const service = session.service ? SERVICES[session.service as keyof typeof SERVICES]?.label : "General";
  const summary =
    `New qualified lead\n` +
    `Service: ${service}\n` +
    `Scope: ${session.scope ?? "—"}\n` +
    `Timeline: ${session.timeline ?? "—"}\n` +
    `Details:\n${text}`;

  return escalateToHuman(to, session, summary, channelId, msgId);
}

// ---------- Handoff ----------

async function escalateToEmergency(to: string, channelId?: string, msgId?: string) {
  await sendMessage(
    to,
    `🚨 *Emergency Alert*\n\n` +
      `Our on-call incident team has been alerted.\n\n` +
      `• *Direct 24/7 Hotline:* ${HOTLINE}\n\n` +
      `Please share your affected website/IP and symptoms below:`,
    channelId,
    msgId
  );

  await notifyRepresentative({
    customer: to,
    reason: "CRITICAL OUTAGE / SECURITY INCIDENT ALERT",
    service: "cybersecurity",
    scope: "Active Incident Response",
    timeline: "< 2 Weeks",
    channel: REP_QUEUE_CHANNEL,
  });
}

async function escalateToHuman(
  to: string,
  session: Session,
  reason: string,
  channelId?: string,
  msgId?: string
) {
  session.stage = "handoff";
  await setSession(to, session);

  await sendMessage(
    to,
    `You're connected with our Technical Advisory Desk.\n\n` +
      `A lead engineer will review your note and reply directly in this thread shortly.\n\n` +
      `• *Operating Hours:* ${HOURS}\n` +
      `• *Direct Phone:* ${HOTLINE}`,
    channelId,
    msgId
  );

  await notifyRepresentative({
    customer: to,
    reason,
    service: session.service,
    scope: session.scope,
    timeline: session.timeline,
    channel: REP_QUEUE_CHANNEL,
  });
}

async function notifyRepresentative(payload: {
  customer: string;
  reason: string;
  service?: ServiceKey;
  scope?: string;
  timeline?: string;
  channel: string;
}) {
  await notify(payload.channel, {
    title: "New WhatsApp lead — human handoff",
    ...payload,
  });
}

function normalizeSelection(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, "_");
}

// ---------- Backwards Compatibility Helpers for FlowStep API ----------

export type FlowChoice = {
  id: string;
  title: string;
  description?: string;
  next: string;
};

export type FlowStep =
  | {
      kind: "list";
      id: string;
      header?: string;
      body: string;
      footer?: string;
      button: string;
      sections: { title: string; rows: FlowChoice[] }[];
    }
  | {
      kind: "buttons";
      id: string;
      header?: string;
      body: string;
      footer?: string;
      buttons: FlowChoice[];
    }
  | { kind: "text"; id: string; body: string };

export const FLOW_ENTRY = "start";

export function stepTranscript(step: FlowStep): string {
  if (step.kind === "text") return step.body;
  const choices =
    step.kind === "buttons"
      ? step.buttons.map((b) => `- ${b.title}`)
      : step.sections.flatMap((s) => s.rows.map((r) => `- ${r.title}`));
  return [step.header, step.body, step.footer, `[${step.kind === "list" ? step.button : "Buttons"}]`, ...choices]
    .filter(Boolean)
    .join("\n");
}

export function stepPayload(step: FlowStep, to: string): Record<string, unknown> {
  const base = { messaging_product: "whatsapp", to, recipient_type: "individual" };
  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

  if (step.kind === "text") {
    return { ...base, type: "text", text: { body: cut(step.body, 4096), preview_url: false } };
  }

  const shell = {
    ...(step.header && step.header.trim() ? { header: { type: "text", text: cut(step.header, 60) } } : {}),
    body: { text: cut(step.body || "Please choose an option:", 1024) },
    ...(step.footer && step.footer.trim() ? { footer: { text: cut(step.footer, 60) } } : {}),
  };

  if (step.kind === "buttons") {
    return {
      ...base,
      type: "interactive",
      interactive: {
        type: "button",
        ...shell,
        action: {
          buttons: step.buttons.slice(0, 3).map((b) => ({
            type: "reply",
            reply: { id: b.id, title: cut(b.title || "Button", 20) },
          })),
        },
      },
    };
  }

  let budget = 10;
  const sections = step.sections
    .map((sec) => {
      const rows = sec.rows.slice(0, Math.max(0, budget)).map((r) => ({
        id: r.id,
        title: cut(r.title || "Option", 24),
        ...(r.description && r.description.trim() ? { description: cut(r.description, 72) } : {}),
      }));
      budget -= rows.length;
      return { title: cut(sec.title || "Options", 24), rows };
    })
    .filter((s) => s.rows.length > 0);

  return {
    ...base,
    type: "interactive",
    interactive: {
      type: "list",
      ...shell,
      action: { button: cut(step.button || "Choose an option", 20), sections },
    },
  };
}

export const DEFAULT_STEPS: FlowStep[] = [
  {
    kind: "list",
    id: "start",
    header: "Tauqeer Mustafa Inc",
    body:
      "Hi! Welcome to *Tauqeer Mustafa Inc*.\n\n" +
      "We build high-performance software, custom AI systems, and cloud architecture.\n\n" +
      "What can we help you build today?",
    footer: "Mon–Sat, 09:00–18:00 PKT",
    button: "Explore Options",
    sections: [
      {
        title: "Engineering & Architecture",
        rows: [
          { id: "web", title: "Web & Platforms", description: "Web apps, SaaS portals & APIs", next: "scope_web" },
          { id: "ai", title: "AI & Automation", description: "Copilots, agents & workflows", next: "scope_ai" },
          { id: "cloud", title: "Cloud & DevOps", description: "Cloud infrastructure, scaling & CI/CD", next: "scope_cloud" },
        ],
      },
      {
        title: "Security & Defense",
        rows: [
          { id: "cybersecurity", title: "Cybersecurity", description: "Audits, posture & defense", next: "scope_security" },
          { id: "incident_fast", title: "Emergency Incident", description: "Rapid response for active outages / breaches", next: "incident" },
        ],
      },
      {
        title: "Product & Advisory",
        rows: [
          { id: "uiux", title: "UI/UX & Product", description: "Product design & design systems", next: "scope_uiux" },
          { id: "client_services", title: "Client Desk", description: "Retainers, billing & support", next: "client_services" },
          { id: "careers", title: "Careers & Internships", description: "Open roles & engineering positions", next: "careers" },
          { id: "human", title: "Speak to Principal", description: "Direct consultation with lead engineer", next: "human" },
        ],
      },
    ],
  },
  {
    kind: "buttons",
    id: "scope_web",
    header: "Web & Platforms Practice",
    body:
      "We build modern web apps, SaaS platforms, and APIs.\n\n" +
      "When are you planning to kick off?",
    buttons: [
      { id: "time_immediate", title: "< 2 Weeks", next: "intake" },
      { id: "time_quarterly", title: "1–3 Months", next: "intake" },
      { id: "human", title: "Talk to Engineer", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_ai",
    header: "AI & Automation Practice",
    body:
      "We build custom AI copilots, autonomous agents, and enterprise search workflows.\n\n" +
      "What delivery timeline are you looking at?",
    buttons: [
      { id: "time_immediate", title: "< 2 Weeks", next: "intake" },
      { id: "time_quarterly", title: "1–3 Months", next: "intake" },
      { id: "human", title: "Talk to Engineer", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_cloud",
    header: "Cloud & DevOps Practice",
    body:
      "We design AWS/GCP cloud infrastructure, CI/CD pipelines, and Terraform setups.\n\n" +
      "When do you need to start?",
    buttons: [
      { id: "time_immediate", title: "Right Away", next: "intake" },
      { id: "time_quarterly", title: "1–3 Months", next: "intake" },
      { id: "human", title: "Talk to Architect", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_security",
    header: "Cybersecurity Practice",
    body:
      "We handle penetration testing, security posture reviews, and incident defense.\n\n" +
      "How urgent is your security review?",
    buttons: [
      { id: "time_immediate", title: "Urgent Review", next: "intake" },
      { id: "time_quarterly", title: "1–3 Months", next: "intake" },
      { id: "human", title: "Talk to Sec Lead", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "incident",
    header: "Emergency Incident Alert",
    body:
      "🚨 *Emergency Alert Received*\n\n" +
      "Our on-call incident team has been alerted.\n\n" +
      "• *Direct 24/7 Hotline:* +92 335 6701199\n\n" +
      "Please share your affected website/IP and symptoms below:",
    buttons: [
      { id: "inc_call", title: "Call Hotline", next: "human" },
      { id: "hum_back", title: "Main Menu", next: "start" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_uiux",
    header: "UI/UX & Product Design",
    body:
      "We design intuitive user interfaces, design systems, and clickable prototypes.\n\n" +
      "What timeline do you have in mind?",
    buttons: [
      { id: "time_immediate", title: "< 2 Weeks", next: "intake" },
      { id: "time_quarterly", title: "1–3 Months", next: "intake" },
      { id: "human", title: "Talk to Designer", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "client_services",
    header: "Client Account Desk",
    body:
      "Welcome to our Client Desk! We assist with active retainers, deliverables, and invoices.\n\n" +
      "• *Hotline:* +92 335 6701199\n\n" +
      "Drop your company name or project details here and we'll help you right away.",
    buttons: [
      { id: "human", title: "Speak to Manager", next: "human" },
      { id: "hum_back", title: "Main Menu", next: "start" },
    ],
  },
  {
    kind: "buttons",
    id: "careers",
    header: "Careers at TMI",
    body:
      "We're actively hiring engineers and interns! 🚀\n\n" +
      "Check open roles and apply here:\n" +
      "👉 *https://tauqeermustafa.com/careers*\n\n" +
      "Our technical team reviews all applications directly.",
    buttons: [
      { id: "human", title: "Message HR", next: "human" },
      { id: "hum_back", title: "Main Menu", next: "start" },
    ],
  },
  {
    kind: "buttons",
    id: "human",
    header: "Lead Engineering Desk",
    body:
      "You're connected with our Lead Engineering desk.\n\n" +
      "• *Direct Phone:* +92 335 6701199 (Mon–Sat, 09:00–18:00 PKT)\n\n" +
      "Drop your project summary or question here, and our Principal will reply directly in this chat!",
    buttons: [
      { id: "hum_back", title: "Main Menu", next: "start" },
    ],
  },
  {
    kind: "buttons",
    id: "timeline",
    header: "Target Delivery Timeline",
    body:
      "When are you planning to kick off?",
    buttons: [
      { id: "time_immediate", title: "< 2 Weeks", next: "intake" },
      { id: "time_quarterly", title: "1–3 Months", next: "intake" },
      { id: "time_advisory", title: "Advisory / Scoping", next: "intake" },
    ],
  },
  {
    kind: "text",
    id: "intake",
    body:
      "Got it! To help us prepare your proposal, please share:\n\n" +
      "1. *Company / Project Name*\n" +
      "2. *What you need built or solved*\n\n" +
      "Our Lead Engineer will review and reply in this thread!",
  },
  {
    kind: "text",
    id: "handoff",
    body:
      "You're connected with our Technical Advisory Desk.\n\n" +
      "A lead engineer will review your note and reply directly in this thread shortly.\n\n" +
      "• *Operating Hours:* Monday to Saturday, 09:00 to 18:00 (PKT)\n" +
      "• *Direct Phone:* +92 335 6701199",
  },
];

export function getFlowKey(department?: string): string {
  if (department === "support") return "whatsapp:flow:support";
  if (department === "direct") return "whatsapp:flow:direct";
  return "whatsapp:flow";
}

export function getDefaultSteps(department?: string): FlowStep[] {
  return DEFAULT_STEPS;
}

export async function getFlowSteps(department?: string): Promise<FlowStep[]> {
  const kv = getKV();
  if (!kv) return getDefaultSteps(department);
  try {
    const key = getFlowKey(department);
    const steps = await kv.get<FlowStep[]>(key);
    return Array.isArray(steps) && steps.length > 0 ? steps : getDefaultSteps(department);
  } catch {
    return getDefaultSteps(department);
  }
}

export async function saveFlowSteps(steps: FlowStep[], department?: string): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  try {
    const key = getFlowKey(department);
    await kv.set(key, steps);
    return true;
  } catch (err) {
    console.error("[wa-flow] Error saving flow steps:", err);
    return false;
  }
}

export async function resetFlowSteps(department?: string): Promise<FlowStep[]> {
  const kv = getKV();
  const defaults = getDefaultSteps(department);
  if (kv) {
    try {
      const key = getFlowKey(department);
      await kv.del(key);
    } catch {}
  }
  return defaults;
}

export function flowStep(id: string, department?: string): FlowStep | null {
  const defaults = getDefaultSteps(department);
  return defaults.find((s) => s.id === id) ?? null;
}

export async function getEffectiveFlowStep(stepId: string, department?: string): Promise<FlowStep | null> {
  const steps = await getFlowSteps(department);
  return steps.find((s) => s.id === stepId) ?? null;
}

export async function resolveEffectiveChoice(choiceId: string, department?: string): Promise<FlowStep | null> {
  const steps = await getFlowSteps(department);
  for (const s of steps) {
    if (s.kind === "list") {
      for (const sec of s.sections) {
        const found = sec.rows.find((r) => r.id === choiceId);
        if (found) return steps.find((step) => step.id === found.next) ?? null;
      }
    } else if (s.kind === "buttons") {
      const found = s.buttons.find((b) => b.id === choiceId);
      if (found) return steps.find((step) => step.id === found.next) ?? null;
    }
  }
  return null;
}

export async function resolveChoiceFromText(text: string, department?: string): Promise<FlowStep | null> {
  return null;
}
