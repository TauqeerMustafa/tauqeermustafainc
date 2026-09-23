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
    label: "Web Development",
    desc: "Secure web platforms, portals, dashboards, product systems",
    subOptions: [
      { id: "web_new", label: "New Platform / Portal Build" },
      { id: "web_migration", label: "Rebuild or Migration" },
      { id: "web_perf", label: "Performance / Core Web Vitals" },
    ],
  },
  cybersecurity: {
    label: "Cybersecurity",
    desc: "Security reviews, hardening, governance, incident response",
    subOptions: [
      { id: "sec_audit", label: "Security Posture Review / Audit" },
      { id: "sec_incident", label: "Active Incident / Breach Response" },
      { id: "sec_access", label: "Access Control & Identity Governance" },
    ],
  },
  ai: {
    label: "AI Solutions",
    desc: "Copilots, automation workflows, data-enabled tools",
    subOptions: [
      { id: "ai_automation", label: "Workflow Automation" },
      { id: "ai_copilot", label: "Internal Assistant / Copilot" },
      { id: "ai_rag", label: "Document Search / RAG System" },
    ],
  },
  cloud: {
    label: "Cloud Engineering",
    desc: "Cloud infrastructure, CI/CD, deployment systems",
    subOptions: [
      { id: "cloud_arch", label: "Cloud Architecture (AWS/Azure/GCP)" },
      { id: "cloud_cicd", label: "CI/CD Pipeline Setup" },
      { id: "cloud_iac", label: "Infrastructure as Code" },
    ],
  },
  uiux: {
    label: "UI/UX & Product Design",
    desc: "Research-informed interface and product design",
    subOptions: [
      { id: "ux_research", label: "User Research & Journey Mapping" },
      { id: "ux_design", label: "Interface Design / Design System" },
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
    `Hello, and thank you for contacting *${COMPANY_NAME}*.\n\n` +
      `We're a security-first engineering team delivering web platforms, ` +
      `cybersecurity, AI automation, cloud infrastructure, and product design.\n\n` +
      `Reply with anything to see how we can help.`,
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
        `Please tell us which area your enquiry concerns:\n\n` +
        Object.values(SERVICES)
          .map((s) => `• ${s.label} — ${s.desc}`)
          .join("\n") +
        `\n• Client Services — active accounts, billing, portal access\n` +
        `• Careers — open roles\n` +
        `• Speak with a Human — general enquiry`,
      footer: `${HOURS}`,
      buttonText: "Choose a service",
      rows: [
        ...Object.entries(SERVICES).map(([key, s]) => ({
          id: key,
          title: s.label,
          description: s.desc,
        })),
        { id: "client_services", title: "Client Services", description: "Accounts, retainers, billing" },
        { id: "careers", title: "Careers & Hiring", description: "Open roles" },
        { id: "human", title: "Speak to Human", description: "General enquiry or confidential briefing" },
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
    return escalateToHuman(to, session, "General enquiry (requested human directly)", channelId, msgId);
  }

  if (key === "client_services" || key === "cat_cli") {
    await sendMessage(
      to,
      `Client Services desk.\nFor account status, invoicing, or retainer changes, ` +
        `a representative will confirm your account details shortly.`,
      channelId,
      msgId
    );
    return escalateToHuman(to, session, "Client Services enquiry", channelId, msgId);
  }

  if (key === "careers" || key === "cat_gen") {
    await sendMessage(
      to,
      `Careers at ${COMPANY_NAME}.\nOpen roles and applications are handled at:\n${WEBSITE}/careers`,
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
  await sendMessage(to, `Please choose an option from the menu below.`, channelId, msgId);
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
      `⚠️ If this is an *active breach or production outage*, reply *incident* now ` +
        `to be connected immediately, or call our hotline directly: ${HOTLINE}.`,
      channelId,
      msgId
    );
  }

  await sendButtonMessage(
    to,
    {
      body: `${service.label} practice.\nSelect the type of work you require:`,
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

  if (normalized === "incident" && session.service === "cybersecurity") {
    return escalateToHuman(to, session, "Active security incident — critical priority", channelId, msgId);
  }

  const service = SERVICES[session.service as keyof typeof SERVICES];
  const match = service?.subOptions.find(
    (o) => o.id === normalized || o.label.toLowerCase() === normalized || normalized.includes(o.id)
  );

  if (!match) {
    await sendMessage(to, `Please select one of the options shown above.`, channelId, msgId);
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
      body:
        `Understood. What is the scope and timeline for this engagement?\n\n` +
        `• Immediate (Under 2 weeks) — urgent kick-off or critical need\n` +
        `• Planned (1–3 months) — structured engagement\n` +
        `• Exploration — requirements gathering, feasibility`,
      buttons: [
        { id: "immediate", title: "Immediate (< 2 wks)" },
        { id: "planned", title: "Planned (1–3 mos)" },
        { id: "exploration", title: "Exploration" },
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
    exploration: "Exploration",
  };
  const normalized = selection.toLowerCase().trim();
  const timeline = map[normalized] || (normalized.includes("2") ? map.immediate : normalized.includes("plan") ? map.planned : map.exploration);

  session.timeline = timeline;
  session.stage = "intake";
  await setSession(to, session);

  await sendMessage(
    to,
    `Thank you. One last thing before we connect you with our team — please send, ` +
      `in a single message:\n\n` +
      `1. *Company* — name and website\n` +
      `2. *You* — your name and role\n` +
      `3. *Outcome* — what you want to accomplish\n\n` +
      `A voice note is also welcome if that's quicker.`,
    channelId,
    msgId
  );
}

// ---------- Step 4: Intake -> Handoff ----------

async function handleIntake(to: string, session: Session, text: string, channelId?: string, msgId?: string) {
  if (!text || text.trim().length < 5) {
    await sendMessage(
      to,
      `Just need a short summary (company, your name/role, and desired outcome) ` +
        `before we bring in the team.`,
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
    `Thank you — your enquiry has been reviewed and handed to our team. ` +
      `A representative will follow up shortly during business hours (${HOURS}).\n\n` +
      `Reference: ${to.slice(-6)}-${Date.now().toString().slice(-4)}`,
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
      "You have reached Tauqeer Mustafa Inc.\n" +
      "Tell us which practice area your enquiry is for:\n\n" +
      "• Web Development — platforms, portals, dashboards\n" +
      "• Cybersecurity — security posture, incident response\n" +
      "• AI Solutions — workflow automation, copilots\n" +
      "• Cloud Engineering — AWS/Azure/GCP, CI/CD\n" +
      "• UI/UX & Design — user research, interface systems\n" +
      "• Client Services — active accounts, billing\n" +
      "• Careers — open roles\n" +
      "• Speak with a Human — general enquiry",
    footer: "Monday to Saturday, 09:00 to 18:00 (PKT)",
    button: "Choose a service",
    sections: [
      {
        title: "Practice Areas",
        rows: [
          { id: "web", title: "Web Development", description: "Platforms, portals, dashboards", next: "scope_web" },
          { id: "cybersecurity", title: "Cybersecurity", description: "Posture audits, incident response", next: "scope_security" },
          { id: "ai", title: "AI Solutions", description: "Automation, assistants, RAG", next: "scope_ai" },
          { id: "cloud", title: "Cloud Engineering", description: "Architecture, CI/CD, IaC", next: "scope_cloud" },
          { id: "uiux", title: "UI/UX Design", description: "Research, interface design", next: "scope_uiux" },
          { id: "client_services", title: "Client Services", description: "Accounts, retainers, billing", next: "scope_client" },
          { id: "careers", title: "Careers & Hiring", description: "Open roles", next: "scope_careers" },
          { id: "human", title: "Speak to Human", description: "General enquiry or briefing", next: "human" },
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
