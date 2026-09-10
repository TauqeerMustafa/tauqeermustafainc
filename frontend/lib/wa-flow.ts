/**
 * The scripted WhatsApp conversation for a new lead.
 *
 * WHAT IT IS
 * ──────────
 * A tree of steps. The first message a stranger gets is an interactive LIST — one
 * tap tells us which of the three service lines they are here about, instead of
 * asking them to type "services" and hoping. Everything after that is interactive
 * REPLY BUTTONS (Meta caps those at three, which is why the list carries the wide
 * first choice and the buttons carry the narrow follow-ups).
 *
 * THREE RULES THE COPY FOLLOWS
 * ────────────────────────────
 * 1. No emojis. Decorative characters read as noise on a business number and
 *    several of them still render as boxes on older Androids.
 * 2. No prices. What the work costs depends on scope, and a number sent by an
 *    automation is one a human then has to argue their way out of.
 * 3. No promise a person has to keep. "Answered within a few hours", "called
 *    within a week", "ahead of everything else in this inbox" — an automation
 *    cannot know any of that, and a missed promise costs more than a vague one
 *    was ever worth. Stating the working hours is a fact; stating a reply time
 *    is a guess. Same for superlatives: describe the work, do not rank it.
 *
 * Bold (*asterisks*) renders in message bodies, so it is used to label the lines
 * of a list where that makes a wall of text scannable. It does NOT render in
 * button titles, list row titles or row descriptions — those stay plain.
 *
 * WHY IT NEEDS NO STORED STATE
 * ────────────────────────────
 * Each choice carries the id of the step it leads to, and the webhook receives
 * that id back in `interactive.list_reply.id` / `button_reply.id`. So "where are
 * we in the flow" is answered by the tap itself — there is no per-contact cursor
 * in KV to go stale, and a contact who scrolls up and taps an old button gets the
 * answer that button always gave.
 *
 * Titles are display copy and are trimmed to Meta's limits at build time: list
 * row title 24 chars, row description 72, button title 20, header/footer 60.
 * Ids are NOT copy — renaming a title must never change an id, or taps arriving
 * from messages already on people's phones stop resolving.
 */

import { getKV, KEYS } from "@/lib/kv";

export type FlowChoice = {
  /** Stable id sent to Meta and returned on tap. Never reword these. */
  id: string;
  title: string;
  description?: string;
  /** Step this tap leads to. */
  next: string;
};

export type FlowStep =
  | {
      kind: "list";
      id: string;
      header?: string;
      body: string;
      footer?: string;
      /** Label on the button that opens the list, e.g. "Choose a service". */
      button: string;
      sections: { title: string; rows: FlowChoice[] }[];
    }
  | {
      kind: "buttons";
      id: string;
      header?: string;
      body: string;
      footer?: string;
      /** Meta accepts at most three. */
      buttons: FlowChoice[];
    }
  | { kind: "text"; id: string; body: string };

/** Where a brand-new conversation starts. */
export const FLOW_ENTRY = "start";

const HOURS = "Monday to Saturday, 09:00 to 18:00 Pakistan time";

/**
 * Asking for company, person and outcome in one message is deliberate: those are
 * the three fields a lead row cannot be opened without (see the lead-generation
 * playbook, "Intake"), so one reply is enough to put the enquiry in the pipeline.
 * Bold labels rather than bare numbers because this arrives as the second message
 * in a row and needs to be skimmable, not read.
 */
const DETAILS_ASK =
  "Three lines, one message:\n\n" +
  "1. *Company* — name and website\n" +
  "2. *You* — name and role\n" +
  "3. *Outcome* — what you want to be different\n\n" +
  "A voice note is fine if that is quicker.";

export const DEFAULT_STEPS: FlowStep[] = [
  // ── 1. Message 1 (List): Inquiry Category ──────────────────────────────────
  {
    kind: "list",
    id: "start",
    header: "Tauqeer Mustafa Inc",
    body:
      "Thank you for contacting Tauqeer Mustafa Inc.\n\n" +
      "Select your inquiry category below to direct your request to the appropriate practice lead.",
    footer: "Mon to Sat, 09:00 to 18:00 Pakistan time",
    button: "Select Category",
    sections: [
      {
        title: "Advisory Practices",
        rows: [
          {
            id: "cat_sec",
            title: "Cybersecurity",
            description: "Security assessment, compliance & defense",
            next: "scope_security",
          },
          {
            id: "cat_fin",
            title: "Financial Compliance",
            description: "Internal controls & audit readiness",
            next: "scope_compliance",
          },
          {
            id: "cat_seo",
            title: "SEO & Digital Strategy",
            description: "Organic growth & AdSense monetization",
            next: "scope_seo",
          },
        ],
      },
      {
        title: "Client & Corporate",
        rows: [
          {
            id: "cat_cli",
            title: "Client Services",
            description: "Active engagement delivery & billing",
            next: "scope_client",
          },
          {
            id: "cat_gen",
            title: "Careers & Executive",
            description: "Applications & direct consultation",
            next: "scope_general",
          },
        ],
      },
    ],
  },

  // ── 2. Message 2 (List): Practice Scope ────────────────────────────────────
  {
    kind: "list",
    id: "scope_security",
    header: "Cybersecurity Scope",
    body: "Select the primary scope for your security requirement:",
    footer: "Step 2 of 5: Scope",
    button: "Select Scope",
    sections: [
      {
        title: "Security Practice",
        rows: [
          {
            id: "sec_review",
            title: "Security Assessment",
            description: "Network, cloud & data vulnerability audit",
            next: "step3_scale",
          },
          {
            id: "sec_incident",
            title: "Incident Response",
            description: "Active breach containment & mitigation",
            next: "step3_scale",
          },
          {
            id: "sec_defense",
            title: "System Hardening",
            description: "Controls architecture & defense design",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_compliance",
    header: "Compliance Scope",
    body: "Select your financial compliance requirement:",
    footer: "Step 2 of 5: Scope",
    button: "Select Scope",
    sections: [
      {
        title: "Compliance Practice",
        rows: [
          {
            id: "fin_controls",
            title: "Internal Controls",
            description: "Process controls & risk framework",
            next: "step3_scale",
          },
          {
            id: "fin_audit",
            title: "Audit Readiness",
            description: "Pre-audit records & statutory review",
            next: "step3_scale",
          },
          {
            id: "fin_governance",
            title: "Corporate Governance",
            description: "Policy formulation & reporting standards",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_seo",
    header: "Digital Strategy Scope",
    body: "Select your primary growth objective:",
    footer: "Step 2 of 5: Scope",
    button: "Select Scope",
    sections: [
      {
        title: "Growth Practice",
        rows: [
          {
            id: "seo_growth",
            title: "Search Optimization",
            description: "Organic rankings & technical SEO",
            next: "step3_scale",
          },
          {
            id: "seo_adsense",
            title: "AdSense Optimization",
            description: "Ad revenue yield & placement strategy",
            next: "step3_scale",
          },
          {
            id: "seo_funnel",
            title: "Conversion Strategy",
            description: "Traffic conversion & lead generation",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_client",
    header: "Client Operations",
    body: "Select the area of assistance required for your account:",
    footer: "Step 2 of 5: Scope",
    button: "Select Request",
    sections: [
      {
        title: "Client Services",
        rows: [
          {
            id: "cli_milestone",
            title: "Engagement Milestone",
            description: "Current project deliverables & status",
            next: "step3_scale",
          },
          {
            id: "cli_invoice",
            title: "Invoicing & Billing",
            description: "Retainer statements & payment records",
            next: "step3_scale",
          },
          {
            id: "cli_technical",
            title: "Technical Query",
            description: "Priority technical support on deliverables",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_general",
    header: "Careers & Executive",
    body: "Select your inquiry area:",
    footer: "Step 2 of 5: Scope",
    button: "Select Option",
    sections: [
      {
        title: "Executive Office",
        rows: [
          {
            id: "gen_careers",
            title: "Careers & Roles",
            description: "Full-time professional positions",
            next: "step3_scale",
          },
          {
            id: "gen_intern",
            title: "Paid Internship",
            description: "Structured trial evaluation program",
            next: "step3_scale",
          },
          {
            id: "gen_exec",
            title: "Executive Advisory",
            description: "Direct strategic management consultation",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  // ── 3. Message 3 (List): Scale & Timeline ──────────────────────────────────
  {
    kind: "list",
    id: "step3_scale",
    header: "Engagement Profile",
    body: "Select your organization scale and project timeline:",
    footer: "Step 3 of 5: Profile",
    button: "Select Profile",
    sections: [
      {
        title: "Scale & Readiness",
        rows: [
          {
            id: "scale_ent",
            title: "Enterprise (100+ Staff)",
            description: "Corporate or multi-entity requirement",
            next: "step4_format",
          },
          {
            id: "scale_sme",
            title: "Mid-Market / SME",
            description: "Dedicated agile project engagement",
            next: "step4_format",
          },
          {
            id: "scale_urgent",
            title: "Immediate (1-7 Days)",
            description: "High priority rapid deployment",
            next: "step4_format",
          },
          {
            id: "scale_quarter",
            title: "Strategic (1-3 Months)",
            description: "Planned quarterly roadmap",
            next: "step4_format",
          },
        ],
      },
    ],
  },

  // ── 4. Message 4 (Buttons): Consultation Preference ────────────────────────
  {
    kind: "buttons",
    id: "step4_format",
    header: "Consultation Mode",
    body: "How would you prefer our advisory team to coordinate with you?",
    footer: "Step 4 of 5: Consultation",
    buttons: [
      { id: "btn_call", title: "Schedule Call", next: "step5_action" },
      { id: "btn_brief", title: "Written Proposal", next: "step5_action" },
      { id: "btn_direct", title: "Direct Advisor", next: "step5_action" },
    ],
  },

  // ── 5. Message 5 (Buttons): Confirmation & Action ──────────────────────────
  {
    kind: "buttons",
    id: "step5_action",
    header: "Confirmation",
    body: "Confirm your next action to proceed with priority review:",
    footer: "Step 5 of 5: Confirmation",
    buttons: [
      { id: "act_details", title: "Submit Details", next: "details" },
      { id: "act_deck", title: "Request Briefing", next: "briefing" },
      { id: "act_agent", title: "Speak with Lead", next: "human" },
    ],
  },

  // ── 6. Continue Steps: Intake & Protocols ──────────────────────────────────
  {
    kind: "text",
    id: "details",
    body: `Noted. Your request is registered with priority.\n\n${DETAILS_ASK}`,
  },

  {
    kind: "text",
    id: "briefing",
    body:
      "Your request for a briefing document has been registered.\n\n" +
      "Please reply with your corporate email address and organization website. A practice lead will transmit the materials shortly.\n\n" +
      `Business hours: ${HOURS}.`,
  },

  {
    kind: "text",
    id: "urgent",
    body:
      "Flagged for urgent escalation.\n\n" +
      "Please provide:\n\n" +
      "1. *Issue description* — what occurred and when\n" +
      "2. *Affected systems* — endpoints or data impact\n" +
      "3. *Direct phone number* for immediate coordination\n\n" +
      "On-call advisory lead will respond promptly.",
  },

  {
    kind: "text",
    id: "apply",
    body:
      "Please send your CV as a PDF, mentioning the role and your location. A portfolio or writing sample is welcome.\n\n" +
      "Every application is reviewed by our hiring team.",
  },

  {
    kind: "text",
    id: "human",
    body:
      `A practice lead has been assigned to your channel.\n\n` +
      `Please share any preliminary notes, files, or questions. An advisor will respond directly during business hours (${HOURS}).`,
  },
];

export const STEPS: FlowStep[] = DEFAULT_STEPS;

const BY_ID = new Map(STEPS.map((s) => [s.id, s]));

/**
 * Every step, in the order written above. Exported so the admin composer can
 * offer the flow as a list of steps to send by hand, rather than repeating the
 * ids as string literals somewhere else and letting the two drift.
 */
export const FLOW_STEPS: readonly FlowStep[] = STEPS;

/** All choices, flattened, so a tap can be resolved without knowing its step. */
const CHOICES = new Map<string, FlowChoice>();
for (const step of STEPS) {
  const choices = step.kind === "list" ? step.sections.flatMap((s) => s.rows) : step.kind === "buttons" ? step.buttons : [];
  for (const c of choices) CHOICES.set(c.id, c);
}

export function flowStep(id?: string | null): FlowStep | null {
  return id ? BY_ID.get(id) ?? null : null;
}

/**
 * The step a tap leads to, or null if the id is not ours — an id from an older
 * revision of the flow, or a button sent by hand from the composer.
 */
export function resolveChoice(choiceId?: string | null): FlowStep | null {
  if (!choiceId) return null;
  const choice = CHOICES.get(choiceId);
  return choice ? flowStep(choice.next) : null;
}

/** True when this id belongs to the flow at all (used to skip keyword rules). */
export function isFlowChoice(choiceId?: string | null): boolean {
  return !!choiceId && CHOICES.has(choiceId);
}

// ─── Dynamic / Editable Flow (Backed by Upstash KV) ──────────────────────────

/**
 * Fetches current flow steps: returns customized steps if saved in KV,
 * or falls back to built-in DEFAULT_STEPS.
 */
export const DEFAULT_SUPPORT_STEPS: FlowStep[] = [
  // ── 1. Message 1 (List): Support Category ──────────────────────────────────
  {
    kind: "list",
    id: "start",
    header: "Technical Support Desk",
    body:
      "Tauqeer Mustafa Inc 24/7 Technical Incident & Support Desk.\n\n" +
      "Select your issue category below to route to the on-call systems team:",
    footer: "P1 Critical Outage: 15-60 min SLA",
    button: "Support Options",
    sections: [
      {
        title: "Triage Category",
        rows: [
          {
            id: "supp_p1",
            title: "P1 Critical Incident",
            description: "System outage, security breach, or data loss",
            next: "supp_scope",
          },
          {
            id: "supp_bug",
            title: "Service Issue / Bug",
            description: "Application bug or degraded performance",
            next: "supp_scope",
          },
          {
            id: "supp_ticket",
            title: "Check Ticket Status",
            description: "Query resolution progress and technician notes",
            next: "check_ticket",
          },
          {
            id: "supp_lead",
            title: "Duty Lead Escalation",
            description: "Direct escalation to on-call duty lead",
            next: "supp_scope",
          },
        ],
      },
    ],
  },

  // ── 2. Message 2 (List): Affected System ───────────────────────────────────
  {
    kind: "list",
    id: "supp_scope",
    header: "Infrastructure Scope",
    body: "Select the primary infrastructure or component affected:",
    footer: "Step 2 of 5: Scope",
    button: "Select Component",
    sections: [
      {
        title: "System Architecture",
        rows: [
          {
            id: "comp_prod",
            title: "Production Servers",
            description: "Core servers, cluster, or cloud compute",
            next: "supp_impact",
          },
          {
            id: "comp_api",
            title: "API & Integrations",
            description: "Backend endpoints, webhooks, or database",
            next: "supp_impact",
          },
          {
            id: "comp_client",
            title: "Client Portal / Web",
            description: "Frontend interface, mobile, or DNS",
            next: "supp_impact",
          },
        ],
      },
    ],
  },

  // ── 3. Message 3 (List): Severity & Environment ────────────────────────────
  {
    kind: "list",
    id: "supp_impact",
    header: "Severity & Environment",
    body: "Select the impact level and deployment environment:",
    footer: "Step 3 of 5: Impact",
    button: "Select Severity",
    sections: [
      {
        title: "Severity Matrix",
        rows: [
          {
            id: "sev_crit",
            title: "Critical Outage (P1)",
            description: "Total production disruption, customers blocked",
            next: "supp_channel",
          },
          {
            id: "sev_high",
            title: "High Degradation (P2)",
            description: "Core service impaired with workaround",
            next: "supp_channel",
          },
          {
            id: "sev_norm",
            title: "Standard Issue (P3)",
            description: "Non-critical bug or configuration query",
            next: "supp_channel",
          },
        ],
      },
    ],
  },

  // ── 4. Message 4 (Buttons): Dispatch Channel ───────────────────────────────
  {
    kind: "buttons",
    id: "supp_channel",
    header: "Coordination Channel",
    body: "How should our incident response team coordinate with you?",
    footer: "Step 4 of 5: Channel",
    buttons: [
      { id: "p1_call_btn", title: "Emergency Hotline", next: "supp_confirm" },
      { id: "p1_status_btn", title: "Live Status Hub", next: "supp_confirm" },
      { id: "bug_sla_btn", title: "SLA Response", next: "supp_confirm" },
    ],
  },

  // ── 5. Message 5 (Buttons): Confirmation & Readiness ───────────────────────
  {
    kind: "buttons",
    id: "supp_confirm",
    header: "Incident Dispatch",
    body: "Confirm your dispatch preference to notify the engineering lead:",
    footer: "Step 5 of 5: Dispatch",
    buttons: [
      { id: "conf_ticket", title: "Log Ticket Now", next: "supp_ticket_intake" },
      { id: "conf_lead", title: "Page Duty Lead", next: "speak_lead" },
      { id: "conf_hotline", title: "Direct Hotline", next: "hotline_info" },
    ],
  },

  // ── 6. Continue Steps: Protocols & Hotlines ────────────────────────────────
  {
    kind: "text",
    id: "supp_ticket_intake",
    body:
      "*Incident Ticket Registration*\n\n" +
      "Please reply directly with:\n" +
      "1. *Affected URL / host*\n" +
      "2. *Timestamp issue began*\n" +
      "3. *HTTP status or error codes*\n\n" +
      "Your ticket ID will be generated and assigned according to SLA.",
  },
  {
    kind: "text",
    id: "check_ticket",
    body:
      "*Ticket Status Tracker*\n\n" +
      "Reply directly with your Ticket Reference ID (e.g. *TMI-SUP-88214*).\n\n" +
      "You can also monitor live SLA countdown on https://support.tauqeermustafa.tech/ticket.",
  },
  {
    kind: "text",
    id: "speak_lead",
    body:
      "*Duty Incident Commander Paged*\n\n" +
      "Engineering duty lead has received your notification.\n\n" +
      "This channel is actively monitored 24/7 for high-severity incidents, and 08:00 to 22:00 PKT for standard requests.\n\n" +
      "Send your logs, screenshot, or audio note.",
  },
  {
    kind: "text",
    id: "hotline_info",
    body:
      "*24/7 Emergency Dispatch Desk:*\n" +
      "Phone: *+92 333 56701199*\n" +
      "Email: support@tauqeermustafa.tech\n\n" +
      "Available 24/7/365 for active retainer accounts with critical outages.",
  },
  {
    kind: "text",
    id: "status_hub",
    body:
      "*System Status & Telemetry:*\n" +
      "Real-time uptime, API latency, and operational health metrics are live at:\n" +
      "https://support.tauqeermustafa.tech/status",
  },
  {
    kind: "text",
    id: "sla_info",
    body:
      "*Guaranteed SLA Response Windows:*\n" +
      "• *P1 (Critical Outage):* 15-60 min response\n" +
      "• *P2 (High Severity):* < 4 hours response\n" +
      "• *P3 (Standard Issue):* < 24 hours turnaround\n" +
      "• *P4 (General Request):* < 48 hours",
  },
];

export function getFlowKey(department?: "general" | "support"): string {
  return department === "support" ? `${KEYS.flow}:support` : KEYS.flow;
}

export function getDefaultSteps(department?: "general" | "support"): FlowStep[] {
  return department === "support" ? DEFAULT_SUPPORT_STEPS : DEFAULT_STEPS;
}

/** Fetches flow steps honoring department sandbox and KV custom copy. */
export async function getFlowSteps(department?: "general" | "support"): Promise<FlowStep[]> {
  const kv = getKV();
  const key = getFlowKey(department);
  if (kv) {
    try {
      const custom = await kv.get<FlowStep[]>(key);
      if (Array.isArray(custom) && custom.length > 0) {
        return custom;
      }
    } catch (e) {
      console.error(`[wa-flow] Failed to load custom flow from KV (${key}):`, e);
    }
  }
  return [...getDefaultSteps(department)];
}

/** Saves customized flow steps into Upstash KV under departmental key. */
export async function saveFlowSteps(steps: FlowStep[], department?: "general" | "support"): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  const key = getFlowKey(department);
  try {
    await kv.set(key, steps);
    return true;
  } catch (e) {
    console.error(`[wa-flow] Failed to save custom flow to KV (${key}):`, e);
    return false;
  }
}

/** Resets custom flow in Upstash KV back to departmental built-in defaults. */
export async function resetFlowSteps(department?: "general" | "support"): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  const key = getFlowKey(department);
  try {
    await kv.del(key);
    return true;
  } catch (e) {
    console.error(`[wa-flow] Failed to reset flow in KV (${key}):`, e);
    return false;
  }
}

/** Fetches a single step by ID, honoring departmental defaults and KV copy. */
export async function getEffectiveFlowStep(id?: string | null, department?: "general" | "support"): Promise<FlowStep | null> {
  if (!id) return null;
  const steps = await getFlowSteps(department);
  return steps.find((s) => s.id === id) ?? (department === "support" ? DEFAULT_SUPPORT_STEPS.find((s) => s.id === id) : flowStep(id)) ?? null;
}

/** Helper to locate a choice within an array of flow steps */
function findChoiceTarget(steps: FlowStep[], choiceId: string): FlowStep | null {
  for (const step of steps) {
    const choices =
      step.kind === "list"
        ? step.sections.flatMap((s) => s.rows)
        : step.kind === "buttons"
        ? step.buttons
        : [];
    const choice = choices.find((c) => c.id === choiceId);
    if (choice) {
      return steps.find((s) => s.id === choice.next) ?? null;
    }
  }
  return null;
}

/** Resolves the step a choice tap leads to, honoring departmental sandbox with cross-fallback. */
export async function resolveEffectiveChoice(
  choiceId?: string | null,
  department?: "general" | "support"
): Promise<FlowStep | null> {
  if (!choiceId) return null;

  const primaryDept = department || "general";
  const secondaryDept = primaryDept === "support" ? "general" : "support";

  // 1. Check primary department custom / KV steps
  const primarySteps = await getFlowSteps(primaryDept);
  let matched = findChoiceTarget(primarySteps, choiceId);
  if (matched) return matched;

  // 2. Check primary department built-in defaults
  matched = findChoiceTarget(getDefaultSteps(primaryDept), choiceId);
  if (matched) return matched;

  // 3. Cross-fallback: check secondary department custom steps
  const secondarySteps = await getFlowSteps(secondaryDept);
  matched = findChoiceTarget(secondarySteps, choiceId);
  if (matched) return matched;

  // 4. Cross-fallback: check secondary department built-in defaults
  matched = findChoiceTarget(getDefaultSteps(secondaryDept), choiceId);
  if (matched) return matched;

  // 5. Legacy mappings for backwards compatibility
  const legacyMap: Record<string, string> = {
    svc_security: "scope_security",
    svc_compliance: "scope_compliance",
    svc_seo: "scope_seo",
    svc_client: "scope_client",
    svc_careers: "scope_general",
    svc_human: "human",
    security: "scope_security",
    compliance: "scope_compliance",
    seo: "scope_seo",
    client: "scope_client",
    careers: "scope_general",
    sec_review: "step3_scale",
    sec_incident: "urgent",
    sec_talk: "human",
    fin_controls: "step3_scale",
    fin_audit: "step3_scale",
    fin_talk: "human",
    seo_traffic: "step3_scale",
    seo_ads: "step3_scale",
    seo_talk: "human",
    cli_status: "step3_scale",
    cli_billing: "step3_scale",
    cli_talk: "human",
    job_apply: "apply",
    job_status: "details",
    job_talk: "human",
    supp_p1: "supp_scope",
    supp_bug: "supp_scope",
    supp_ticket: "check_ticket",
    supp_lead: "supp_scope",
    comp_prod: "supp_impact",
    comp_api: "supp_impact",
    comp_client: "supp_impact",
    sev_crit: "supp_channel",
    sev_high: "supp_channel",
    sev_norm: "supp_channel",
    p1_call_btn: "supp_confirm",
    p1_status_btn: "supp_confirm",
    bug_sla_btn: "supp_confirm",
    conf_ticket: "supp_ticket_intake",
    conf_lead: "speak_lead",
    conf_hotline: "hotline_info",
  };

  const fallbackStepId = legacyMap[choiceId];
  if (fallbackStepId) {
    return (
      (await getEffectiveFlowStep(fallbackStepId, primaryDept)) ??
      (await getEffectiveFlowStep(fallbackStepId, secondaryDept))
    );
  }

  return null;
}

/** Resolves a plain text reply (e.g. typing a choice title) to the matching next step. */
export async function resolveChoiceFromText(
  text: string,
  department?: "general" | "support"
): Promise<FlowStep | null> {
  const clean = (text || "").trim().toLowerCase();
  if (!clean) return null;

  const steps = await getFlowSteps(department);
  for (const step of steps) {
    const choices =
      step.kind === "list"
        ? step.sections.flatMap((s) => s.rows)
        : step.kind === "buttons"
        ? step.buttons
        : [];

    for (const choice of choices) {
      const title = choice.title.trim().toLowerCase();
      if (
        clean === title ||
        (clean.length > 3 && title.includes(clean)) ||
        (title.length > 3 && clean.includes(title))
      ) {
        return (
          steps.find((s) => s.id === choice.next) ??
          (await getEffectiveFlowStep(choice.next, department))
        );
      }
    }
  }
  return null;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

/**
 * Graph payload for one step. Meta rejects the whole message on any overlong
 * field, so every limit is enforced here rather than trusted to the copy above.
 */
export function stepPayload(step: FlowStep, to: string): Record<string, unknown> {
  const base = { messaging_product: "whatsapp", to, recipient_type: "individual" };

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

  // A list may hold ten rows in total, across at most ten sections.
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

/**
 * What the step looks like in the admin inbox. The interactive part of a message
 * is not readable back from Meta, so the choices are spelled out here — otherwise
 * an admin reading the thread sees a question with no visible options and cannot
 * tell what the customer was offered.
 */
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
