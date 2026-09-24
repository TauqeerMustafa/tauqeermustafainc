/**
 * wa-flow.ts
 * TMI WhatsApp Lead Triage — Conversation State Machine
 * Flow: Welcome -> Service Menu -> Sub-scope -> Timeline -> Contact Details -> Human Handoff
 */

import { getKV } from "@/lib/kv";
import { getSession, setSession, clearSession, type Session, type FlowStage, type ServiceKey } from "@/lib/wa-store";
import { primaryNumberId, waNumbers } from "@/lib/wa-numbers";
import { accountAt } from "@/lib/wa-accounts";
import { notify } from "@/lib/wa-notify";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

// ---------- Constants & Company Info ----------

const COMPANY_NAME = "Tauqeer Mustafa Inc";
const WEBSITE = "https://tauqeermustafa.tech";
const HOURS = "Monday to Saturday, 09:00 to 18:00 (PKT)";
const HOTLINE = "+92 335 6701199";
const REP_QUEUE_CHANNEL = process.env.REP_QUEUE_CHANNEL ?? "#leads-inbound";

// ---------- Service catalogue (mirrors tauqeermustafa.tech/services) ----------

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

function resolveSendingId(id: string): string {
  let actual = id;
  if (actual === "1363415125370805") return "1239592269240963";
  if (actual === "1485319076722009") return "1245811661959729";
  if (actual === "2663451950739498") return "1401823986336958";
  if (actual === "1739099617324219") return "1339948289200329";
  if (actual === "1083562997861778") return "1385974501255442";
  if (actual === "1034864159583818") return "1291624014041103";
  return actual;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getSenderCredentials(channelId?: string) {
  const phoneId = channelId || primaryNumberId() || "1239592269240963";
  const actualPhoneId = resolveSendingId(phoneId);
  const numberDef = waNumbers().find((n) => n.id === phoneId || n.id === actualPhoneId);
  const account = accountAt(numberDef?.slot ?? 1);
  const token = account.token || accountAt(1).token;
  return { actualPhoneId, token: token ?? "" };
}

/** Show official Meta typing indicator on recipient's screen and pause for 5 seconds */
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
          typing_indicator: { type: "text" },
        }),
      }).catch(() => {});
    }
  } catch {}

  await sleep(5000);
}

export async function sendMessage(to: string, bodyText: string, channelId?: string, msgId?: string) {
  const { actualPhoneId, token } = await getSenderCredentials(channelId);
  if (!token) return;

  await sendTypingAndDelay(to, msgId, channelId);

  await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: bodyText, preview_url: false },
    }),
  }).catch((e) => console.error("[wa-flow] sendMessage error:", e));
}

export async function sendListMessage(
  to: string,
  payload: {
    header: string;
    body: string;
    footer?: string;
    buttonText: string;
    rows?: { id: string; title: string; description?: string }[];
    sections?: { title: string; rows: { id: string; title: string; description?: string }[] }[];
  },
  channelId?: string,
  msgId?: string
) {
  const { actualPhoneId, token } = await getSenderCredentials(channelId);
  if (!token) return;

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

  const listPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: cut(payload.header, 60) },
      body: { text: cut(payload.body, 1024) },
      ...(payload.footer ? { footer: { text: cut(payload.footer, 60) } } : {}),
      action: {
        button: cut(payload.buttonText, 20),
        sections,
      },
    },
  };

  await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(listPayload),
  }).catch((e) => console.error("[wa-flow] sendListMessage error:", e));
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
  const { actualPhoneId, token } = await getSenderCredentials(channelId);
  if (!token) return;

  await sendTypingAndDelay(to, msgId, channelId);

  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

  const buttonPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      ...(payload.header ? { header: { type: "text", text: cut(payload.header, 60) } } : {}),
      body: { text: cut(payload.body, 1024) },
      ...(payload.footer ? { footer: { text: cut(payload.footer, 60) } } : {}),
      action: {
        buttons: payload.buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id, title: cut(b.title, 20) },
        })),
      },
    },
  };

  await fetch(`${GRAPH_URL}/${actualPhoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(buttonPayload),
  }).catch((e) => console.error("[wa-flow] sendButtonMessage error:", e));
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

  let session = await getSession(from);

  if (!session) {
    // Fast-path 2: Direct Careers
    if (/^(careers|hiring|jobs|join|apply|resume)/i.test(clean)) {
      await setSession(from, { stage: "handoff", service: "careers", startedAt: Date.now() });
      await sendMessage(
        from,
        `*Careers at ${COMPANY_NAME}*\n\n` +
          `We are actively recruiting exceptional software engineers, security researchers, and product designers.\n\n` +
          `Explore our open positions and submit your profile directly at:\n` +
          `${WEBSITE}/careers\n\n` +
          `Our technical leadership reviews all submissions directly.`,
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
        `*Client Account Services*\n\n` +
          `You are connected with our dedicated Client Desk. A team representative will assist you with your active retainer, invoicing, or portal access shortly.`,
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
      // Already handed off — bot stays silent, representative owns thread
      return;
  }
}

// ---------- Step 0: Welcome ----------

async function sendWelcome(to: string, channelId?: string, msgId?: string) {
  await sendMessage(
    to,
    `*${COMPANY_NAME}*\n` +
      `Software Engineering · Cloud Systems · Cybersecurity\n\n` +
      `Welcome. We engineer mission-critical web platforms, AI workflows, cloud architecture, and security defenses for modern enterprises.\n\n` +
      `Let’s connect you with the right engineering team.`,
    channelId,
    msgId
  );
  await setSession(to, { stage: "menu", startedAt: Date.now() });
  return sendServiceMenu(to, { stage: "menu", startedAt: Date.now() }, channelId, msgId);
}

// ---------- Step 1: Service Menu ----------

async function sendServiceMenu(to: string, session: Session, channelId?: string, msgId?: string) {
  await sendListMessage(
    to,
    {
      header: COMPANY_NAME,
      body:
        `*Tauqeer Mustafa Inc.* — Engineering & Advisory\n\n` +
        `Select a focus area below to route your request to the appropriate engineering desk:`,
      footer: `${HOURS}`,
      buttonText: "Explore Solutions",
      sections: [
        {
          title: "Engineering & Architecture",
          rows: [
            { id: "web", title: "Web & Platforms", description: "Cloud-native portals, SaaS apps & APIs" },
            { id: "ai", title: "AI & Automation", description: "Intelligent agents, RAG & custom copilots" },
            { id: "cloud", title: "Cloud & DevOps", description: "Multi-cloud architecture, K8s & IaC" },
          ],
        },
        {
          title: "Security & Defense",
          rows: [
            { id: "cybersecurity", title: "Cybersecurity & Audits", description: "Threat defense, audits & zero-trust" },
            { id: "incident_fast", title: "Emergency Incident", description: "Rapid response for active outages / breaches" },
          ],
        },
        {
          title: "Product & Advisory",
          rows: [
            { id: "uiux", title: "UI/UX & Product Design", description: "Research, design systems & product UX" },
            { id: "client_services", title: "Client Account Desk", description: "Existing contracts, invoices & support" },
            { id: "careers", title: "Careers & Hiring", description: "Open engineering & design roles" },
            { id: "human", title: "Talk to a Principal", description: "Direct consultation with a lead engineer" },
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
      `*Client Account Services*\n\n` +
        `You are connected with our dedicated Client Desk. A team representative will assist you with your active retainer, invoicing, or portal access shortly.`,
      channelId,
      msgId
    );
    return escalateToHuman(to, session, "Client Services enquiry", channelId, msgId);
  }

  if (key === "careers" || key === "cat_gen") {
    await sendMessage(
      to,
      `*Careers at ${COMPANY_NAME}*\n\n` +
        `We are actively seeking top-tier software engineers, security researchers, and product designers.\n\n` +
        `View open positions and submit your profile at:\n` +
        `${WEBSITE}/careers\n\n` +
        `Our engineering leadership reviews all candidates directly.`,
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
        `Reply *urgent* immediately to bypass the queue, or call our 24/7 hotline directly: ${HOTLINE}.`,
      channelId,
      msgId
    );
  }

  await sendButtonMessage(
    to,
    {
      body: `*${service.label} Practice*\nSelect your primary objective or milestone:`,
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
      body: `Understood. What target delivery timeline are you aiming for?`,
      buttons: [
        { id: "immediate", title: "Immediate (< 2 wks)" },
        { id: "planned", title: "Quarterly (1–3 mos)" },
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
    immediate: "Immediate (< 2 weeks)",
    planned: "Quarterly (1–3 months)",
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
    `Excellent. To prepare an accurate technical assessment, please share a brief note covering:\n\n` +
      `1. *Organization* — Company name & website\n` +
      `2. *Contact* — Your name & role\n` +
      `3. *Objective* — What you want to build or solve\n\n` +
      `💡 _You may also share a voice brief or paste an existing scope document/link._`,
    channelId,
    msgId
  );
}

// ---------- Step 4: Intake -> Handoff ----------

async function handleIntake(to: string, session: Session, text: string, channelId?: string, msgId?: string) {
  if (!text || text.trim().length < 5) {
    await sendMessage(
      to,
      `Please provide a short summary (organization, your name/role, and core objective) so our engineering leads have the context needed to assist you.`,
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
    `Contact details:\n${text}`;

  return escalateToHuman(to, session, summary, channelId, msgId);
}

// ---------- Handoff ----------

async function escalateToEmergency(to: string, channelId?: string, msgId?: string) {
  await sendMessage(
    to,
    `🚨 *CRITICAL INCIDENT ALERT*\n\n` +
      `Your emergency alert has been flagged with highest priority to our on-call Incident Response unit.\n\n` +
      `• *Direct Hotline:* ${HOTLINE}\n` +
      `• *Incident Commander:* Standing by for briefing\n\n` +
      `Please reply with your affected system domain, IP ranges, or outage symptoms.`,
    channelId,
    msgId
  );

  await notifyRepresentative({
    customer: to,
    reason: "CRITICAL OUTAGE / SECURITY INCIDENT ALERT",
    service: "cybersecurity",
    scope: "Active Incident Response",
    timeline: "Immediate (< 2 weeks)",
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
    `*Briefing Received & Assigned*\n\n` +
      `Thank you. Your project requirements have been routed to our Technical Advisory Desk. ` +
      `A principal engineer or partner will review your specifications and reply directly in this thread.\n\n` +
      `• *Operating Hours:* ${HOURS}\n` +
      `• *Direct Hotline:* ${HOTLINE}\n\n` +
      `We look forward to collaborating with you.`,
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
      "*Tauqeer Mustafa Inc.* — Engineering & Advisory\n\n" +
      "Select a focus area below to route your request to the appropriate engineering desk:",
    footer: "Monday to Saturday, 09:00 to 18:00 (PKT)",
    button: "Explore Solutions",
    sections: [
      {
        title: "Engineering & Architecture",
        rows: [
          { id: "web", title: "Web & Platforms", description: "Cloud-native portals, SaaS apps & APIs", next: "scope_web" },
          { id: "ai", title: "AI & Automation", description: "Intelligent agents, RAG & custom copilots", next: "scope_ai" },
          { id: "cloud", title: "Cloud & DevOps", description: "Multi-cloud architecture, K8s & IaC", next: "scope_cloud" },
        ],
      },
      {
        title: "Security & Defense",
        rows: [
          { id: "cybersecurity", title: "Cybersecurity & Audits", description: "Threat defense, audits & zero-trust", next: "scope_security" },
          { id: "incident_fast", title: "Emergency Incident", description: "Rapid response for active outages / breaches", next: "incident" },
        ],
      },
      {
        title: "Product & Advisory",
        rows: [
          { id: "uiux", title: "UI/UX & Product Design", description: "Research, design systems & product UX", next: "scope_uiux" },
          { id: "client_services", title: "Client Account Desk", description: "Existing contracts, invoices & support", next: "client_services" },
          { id: "careers", title: "Careers & Hiring", description: "Open engineering & design roles", next: "careers" },
          { id: "human", title: "Talk to a Principal", description: "Direct consultation with a lead engineer", next: "human" },
        ],
      },
    ],
  },
  {
    kind: "buttons",
    id: "scope_web",
    header: "Web & Platforms Practice",
    body:
      "*Web & Cloud Platforms*\n\n" +
      "We engineer resilient, high-availability web applications, enterprise SaaS portals, and scalable API microservices.\n\n" +
      "Select your primary project milestone:",
    footer: "Next: Target Timeline",
    buttons: [
      { id: "web_new", title: "New Project / MVP", next: "timeline" },
      { id: "web_rebuild", title: "Rebuild / Upgrade", next: "timeline" },
      { id: "web_perf", title: "Performance & Scale", next: "timeline" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_ai",
    header: "AI & Automation Practice",
    body:
      "*AI & Workflow Automation*\n\n" +
      "We design autonomous AI agents, enterprise RAG knowledge search, and custom copilots that connect to your production systems.\n\n" +
      "Select your primary AI focus:",
    footer: "Next: Target Timeline",
    buttons: [
      { id: "ai_workflow", title: "Workflow Automation", next: "timeline" },
      { id: "ai_copilot", title: "Custom AI Copilot", next: "timeline" },
      { id: "ai_rag", title: "RAG Knowledge Base", next: "timeline" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_cloud",
    header: "Cloud & DevOps Practice",
    body:
      "*Cloud Architecture & DevOps*\n\n" +
      "We design scalable multi-cloud infrastructure across AWS, GCP, and Azure with Kubernetes orchestration and automated CI/CD.\n\n" +
      "Select your infrastructure goal:",
    footer: "Next: Target Timeline",
    buttons: [
      { id: "cloud_arch", title: "Multi-Cloud Design", next: "timeline" },
      { id: "cloud_k8s", title: "Kubernetes & CI/CD", next: "timeline" },
      { id: "cloud_iac", title: "Terraform & IaC", next: "timeline" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_security",
    header: "Cybersecurity Practice",
    body:
      "*Cybersecurity & Threat Defense*\n\n" +
      "We deliver comprehensive perimeter audits, threat modeling, zero-trust infrastructure, and rapid incident response.\n\n" +
      "Select your security requirement:",
    footer: "Next: Target Timeline",
    buttons: [
      { id: "sec_audit", title: "Security Review", next: "timeline" },
      { id: "sec_pentest", title: "Penetration Testing", next: "timeline" },
      { id: "sec_hardening", title: "Posture Hardening", next: "timeline" },
    ],
  },
  {
    kind: "buttons",
    id: "incident",
    header: "Emergency Incident Alert",
    body:
      "🚨 *EMERGENCY OUTAGE / BREACH ALERT*\n\n" +
      "Your alert has been escalated to our on-call Incident Response team.\n\n" +
      "• *Direct 24/7 Hotline:* +92 335 6701199\n" +
      "• *Incident Commander:* Standing by for briefing\n\n" +
      "Please reply with affected endpoints or symptoms.",
    footer: "24/7 Emergency Dispatch",
    buttons: [
      { id: "inc_outage", title: "Service Down", next: "intake" },
      { id: "inc_breach", title: "Data Breach", next: "intake" },
      { id: "inc_call", title: "Request Phone Call", next: "intake" },
    ],
  },
  {
    kind: "buttons",
    id: "scope_uiux",
    header: "UI/UX & Product Design",
    body:
      "*Product Design & Design Systems*\n\n" +
      "We craft high-conversion user interfaces, scalable design systems, and rapid interactive prototypes for enterprise platforms.\n\n" +
      "Select your primary objective:",
    footer: "Next: Target Timeline",
    buttons: [
      { id: "ux_research", title: "User Research & Flow", next: "timeline" },
      { id: "ux_design", title: "UI & Design System", next: "timeline" },
      { id: "ux_proto", title: "Interactive Proto", next: "timeline" },
    ],
  },
  {
    kind: "buttons",
    id: "client_services",
    header: "Client Account Desk",
    body:
      "*Active Client & Account Services*\n\n" +
      "You are connected with our dedicated Client Services Desk. A representative will assist you with active retainers, deliverables, invoices, or portal access.",
    footer: "Mon to Sat, 09:00 to 18:00 PKT",
    buttons: [
      { id: "cli_retainer", title: "Retainer Support", next: "intake" },
      { id: "cli_billing", title: "Invoice & Billing", next: "intake" },
      { id: "cli_lead", title: "Speak with Lead", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "careers",
    header: "Engineering Careers at TMI",
    body:
      "*Careers & Recruitment*\n\n" +
      "We actively recruit top-tier software engineers, security researchers, and systems architects.\n\n" +
      "Explore our open positions and submit your profile at:\n" +
      "https://tauqeermustafa.tech/careers\n\n" +
      "Our technical leadership reviews all submissions directly.",
    footer: "tauqeermustafa.tech/careers",
    buttons: [
      { id: "car_apply", title: "Submit Resume", next: "intake" },
      { id: "car_roles", title: "View Open Roles", next: "start" },
      { id: "car_lead", title: "Speak with Lead", next: "human" },
    ],
  },
  {
    kind: "buttons",
    id: "human",
    header: "Principal Consultation",
    body:
      "*Direct Principal Consultation*\n\n" +
      "You have requested direct consultation with a lead engineer or practice partner.\n\n" +
      "Please share your project summary and availability, or connect directly via our hotline:\n" +
      "• +92 335 6701199",
    footer: "Engineering Leadership",
    buttons: [
      { id: "hum_brief", title: "Share Brief Now", next: "intake" },
      { id: "hum_call", title: "Schedule Call", next: "intake" },
      { id: "hum_back", title: "Back to Menu", next: "start" },
    ],
  },
  {
    kind: "buttons",
    id: "timeline",
    header: "Target Delivery Timeline",
    body:
      "*Delivery Schedule*\n\n" +
      "What target delivery timeframe or milestone are you aiming for?",
    footer: "Step 2 of 3",
    buttons: [
      { id: "time_immediate", title: "Immediate (< 2 wks)", next: "intake" },
      { id: "time_quarterly", title: "Quarterly (1–3 mos)", next: "intake" },
      { id: "time_advisory", title: "Advisory / Scoping", next: "intake" },
    ],
  },
  {
    kind: "text",
    id: "intake",
    body:
      "*Technical Assessment Intake*\n\n" +
      "To prepare an accurate scope assessment and proposal, please reply with:\n\n" +
      "1. *Organization* — Company name and website\n" +
      "2. *Contact* — Your full name and role\n" +
      "3. *Objective* — What you want to build or solve\n\n" +
      "💡 _You may also share a voice brief or paste an existing scope document/link._",
  },
  {
    kind: "text",
    id: "handoff",
    body:
      "*Briefing Received & Assigned*\n\n" +
      "Thank you. Your requirements have been routed to our Technical Advisory Desk. A principal engineer will review your specifications and reply directly in this thread.\n\n" +
      "• *Operating Hours:* Monday to Saturday, 09:00 to 18:00 (PKT)\n" +
      "• *Direct Hotline:* +92 335 6701199",
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
