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
    rows: { id: string; title: string; description?: string }[];
  },
  channelId?: string,
  msgId?: string
) {
  const { actualPhoneId, token } = await getSenderCredentials(channelId);
  if (!token) return;

  await sendTypingAndDelay(to, msgId, channelId);

  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

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
        sections: [
          {
            title: "Practice Areas",
            rows: payload.rows.slice(0, 10).map((r) => ({
              id: r.id,
              title: cut(r.title, 24),
              ...(r.description ? { description: cut(r.description, 72) } : {}),
            })),
          },
        ],
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
  let session = await getSession(from);

  if (!session) {
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
    `Welcome to *${COMPANY_NAME}*.\n\n` +
      `We build high-performance software, cloud infrastructure, AI systems, and cybersecurity defenses.\n\n` +
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
        `How can our team help you today?\nSelect what you're looking to explore or build:`,
      footer: `${HOURS}`,
      buttonText: "Explore areas",
      rows: [
        ...Object.entries(SERVICES).map(([key, s]) => ({
          id: key,
          title: s.label,
          description: s.desc,
        })),
        { id: "client_services", title: "Client Desk", description: "Active projects, billing & support" },
        { id: "careers", title: "Careers", description: "Open roles & joining our team" },
        { id: "human", title: "Talk to Specialist", description: "Direct consultation with a lead engineer" },
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

  if (key === "human" || key === "cat_human") {
    return escalateToHuman(to, session, "Direct specialist consultation requested", channelId, msgId);
  }

  if (key === "client_services" || key === "cat_cli") {
    await sendMessage(
      to,
      `You're connected with our Client Desk.\n\n` +
        `A dedicated team member will assist you with your active project, invoice, or portal access shortly.`,
      channelId,
      msgId
    );
    return escalateToHuman(to, session, "Client Services enquiry", channelId, msgId);
  }

  if (key === "careers" || key === "cat_gen") {
    await sendMessage(
      to,
      `We're always looking for exceptional talent.\n\n` +
        `Explore our open engineering and design roles at:\n` +
        `${WEBSITE}/careers\n\n` +
        `Our hiring team reviews every application directly.`,
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

  // Critical incident fast-path
  if (session.service === "cybersecurity") {
    await sendMessage(
      to,
      `🚨 *Critical Outage or Breach?*\n` +
        `Reply *urgent* immediately to bypass the queue, or call our 24/7 hotline: ${HOTLINE}.`,
      channelId,
      msgId
    );
  }

  await sendButtonMessage(
    to,
    {
      body: `${service.label}\nSelect your primary objective:`,
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
    return escalateToHuman(to, session, "Active security incident / critical emergency", channelId, msgId);
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
      body: `Got it. What timeline are you aiming for on this?`,
      buttons: [
        { id: "immediate", title: "ASAP (< 2 weeks)" },
        { id: "planned", title: "Next 1–3 months" },
        { id: "exploration", title: "Just exploring" },
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
    planned: "Planned (1–3 months)",
    exploration: "Exploration / Discovery",
  };
  const normalized = selection.toLowerCase().trim();
  const timeline = map[normalized] || (normalized.includes("2") || normalized.includes("asap") ? map.immediate : normalized.includes("plan") || normalized.includes("month") ? map.planned : map.exploration);

  session.timeline = timeline;
  session.stage = "intake";
  await setSession(to, session);

  await sendMessage(
    to,
    `Perfect. To pair you with the best lead specialist, please reply with a quick message sharing:\n\n` +
      `• Your name & company\n` +
      `• A brief overview of what you want to build or achieve\n\n` +
      `(A short voice note is also great!)`,
    channelId,
    msgId
  );
}

// ---------- Step 4: Intake -> Handoff ----------

async function handleIntake(to: string, session: Session, text: string, channelId?: string, msgId?: string) {
  if (!text || text.trim().length < 5) {
    await sendMessage(
      to,
      `Please drop a quick line with your name, company, and goals so our team has the right context to assist you.`,
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
    `Thank you! Your briefing is in our direct queue.\n\n` +
      `A lead engineer will review your notes and respond here shortly during business hours (${HOURS}).`,
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
      "Welcome to Tauqeer Mustafa Inc.\n" +
      "Select what you're looking to explore or build:",
    footer: "Monday to Saturday, 09:00 to 18:00 (PKT)",
    button: "Explore areas",
    sections: [
      {
        title: "Capabilities & Support",
        rows: [
          { id: "web", title: "Web & Platforms", description: "Platforms, portals, apps & APIs", next: "scope_web" },
          { id: "cybersecurity", title: "Cybersecurity", description: "Defense, audits & crisis response", next: "scope_security" },
          { id: "ai", title: "AI & Automation", description: "Agents, custom models & workflows", next: "scope_ai" },
          { id: "cloud", title: "Cloud & DevOps", description: "Architecture, CI/CD & scaling", next: "scope_cloud" },
          { id: "uiux", title: "UI/UX & Product", description: "Product design & interface systems", next: "scope_uiux" },
          { id: "client_services", title: "Client Desk", description: "Active projects, billing & support", next: "scope_client" },
          { id: "careers", title: "Careers", description: "Open engineering & design roles", next: "scope_careers" },
          { id: "human", title: "Talk to Specialist", description: "Direct consultation with a lead", next: "human" },
        ],
      },
    ],
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
