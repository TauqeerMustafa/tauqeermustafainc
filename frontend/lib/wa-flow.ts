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
      "Welcome to Tauqeer Mustafa Inc — Enterprise Technology, AI & Advisory Solutions.\n\n" +
      "Select your objective below to immediately route your request to our dedicated practice lead:",
    footer: "Mon–Sat · 09:00–18:00 PKT | Global SLA",
    button: "Select Category",
    sections: [
      {
        title: "Technology & Advisory",
        rows: [
          {
            id: "cat_sec",
            title: "Cybersecurity & Defense",
            description: "Pen testing, threat mitigation & infrastructure audit",
            next: "scope_security",
          },
          {
            id: "cat_fin",
            title: "Governance & Compliance",
            description: "Statutory audit readiness, risk controls & policy",
            next: "scope_compliance",
          },
          {
            id: "cat_seo",
            title: "AI, Web & Growth",
            description: "Custom AI models, enterprise web & performance SEO",
            next: "scope_seo",
          },
        ],
      },
      {
        title: "Accounts & Leadership",
        rows: [
          {
            id: "cat_cli",
            title: "Client Retainer Desk",
            description: "Active deliverable tracking, SLA & billing inquiries",
            next: "scope_client",
          },
          {
            id: "cat_gen",
            title: "Executive & Careers",
            description: "Strategic partnerships, executive briefing & hiring",
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
    header: "Cybersecurity Advisory",
    body:
      "Our offensive & defensive security specialists protect critical infrastructure across EMEA & US.\n\n" +
      "Please designate your primary security objective:",
    footer: "Step 2 of 5: Engagement Scope",
    button: "Choose Scope",
    sections: [
      {
        title: "Security Capabilities",
        rows: [
          {
            id: "sec_review",
            title: "Vulnerability Audit",
            description: "Full stack pen-testing, cloud & network risk assessment",
            next: "step3_scale",
          },
          {
            id: "sec_incident",
            title: "Incident Response",
            description: "Active threat containment, forensic analysis & triage",
            next: "step3_scale",
          },
          {
            id: "sec_defense",
            title: "Zero-Trust Architecture",
            description: "System hardening, IAM & perimeter defense controls",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_compliance",
    header: "Compliance & Governance",
    body:
      "Ensure regulatory alignment, mitigate operational vulnerabilities, and pass statutory inspections.\n\n" +
      "Select your compliance requirement:",
    footer: "Step 2 of 5: Compliance Scope",
    button: "Choose Scope",
    sections: [
      {
        title: "Regulatory Practice",
        rows: [
          {
            id: "fin_controls",
            title: "Internal Risk Controls",
            description: "Framework development, operational SOPs & fraud checks",
            next: "step3_scale",
          },
          {
            id: "fin_audit",
            title: "Pre-Audit Readiness",
            description: "Mock audits, gap mitigation & compliance certification",
            next: "step3_scale",
          },
          {
            id: "fin_governance",
            title: "Corporate Governance",
            description: "Board advisory, reporting policies & risk management",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_seo",
    header: "AI, Web & Digital Growth",
    body:
      "We design resilient web ecosystems, custom AI workflows, and high-conversion digital assets.\n\n" +
      "Select your core deliverable:",
    footer: "Step 2 of 5: Growth Scope",
    button: "Choose Objective",
    sections: [
      {
        title: "Growth & Architecture",
        rows: [
          {
            id: "seo_growth",
            title: "Enterprise Web & SEO",
            description: "High-performance architecture & top-tier ranking engine",
            next: "step3_scale",
          },
          {
            id: "seo_adsense",
            title: "Monetization & Yield",
            description: "Ad revenue maximization, CPM optimization & analytics",
            next: "step3_scale",
          },
          {
            id: "seo_funnel",
            title: "AI Workflows & Funnels",
            description: "Automated agent funnels & client acquisition systems",
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
    body:
      "Direct account coordination for active contracts and retained engagements.\n\n" +
      "Select your inquiry area:",
    footer: "Step 2 of 5: Account Services",
    button: "Select Request",
    sections: [
      {
        title: "Client Portal",
        rows: [
          {
            id: "cli_milestone",
            title: "Milestone Deliverables",
            description: "Review current release cycle, test logs & sprint signoff",
            next: "step3_scale",
          },
          {
            id: "cli_invoice",
            title: "Retainer & Invoicing",
            description: "Statements of work, invoice records & payment gateway",
            next: "step3_scale",
          },
          {
            id: "cli_technical",
            title: "Priority Tech Support",
            description: "Direct escalation on deployed client infrastructure",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_general",
    header: "Executive & Careers",
    body:
      "Explore executive advisory consultations or apply to join our global engineering team.\n\n" +
      "Select an option to proceed:",
    footer: "Step 2 of 5: Executive Desk",
    button: "Select Option",
    sections: [
      {
        title: "Consultation & Careers",
        rows: [
          {
            id: "gen_careers",
            title: "Engineering Positions",
            description: "Full-time technical roles across AI, cloud & security",
            next: "step3_scale",
          },
          {
            id: "gen_intern",
            title: "Talent Incubator",
            description: "Structured paid internship & engineering evaluations",
            next: "step3_scale",
          },
          {
            id: "gen_exec",
            title: "Strategic Advisory",
            description: "Direct consultation with executive leadership",
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
    body:
      "To allocate senior resources and tailor delivery roadmaps, please specify your organization scale and timeline:",
    footer: "Step 3 of 5: Engagement Scale",
    button: "Select Profile",
    sections: [
      {
        title: "Organizational Size",
        rows: [
          {
            id: "scale_ent",
            title: "Enterprise / Institution",
            description: "100+ team members, multi-departmental or corporate",
            next: "step4_format",
          },
          {
            id: "scale_sme",
            title: "High-Growth Venture",
            description: "Fast-moving SME, funded startup or boutique agency",
            next: "step4_format",
          },
        ],
      },
      {
        title: "Deployment Timeline",
        rows: [
          {
            id: "scale_urgent",
            title: "Immediate Deployment",
            description: "High-priority kickoff required within 1–7 business days",
            next: "step4_format",
          },
          {
            id: "scale_quarter",
            title: "Quarterly Roadmap",
            description: "Planned strategic initiative for the upcoming quarter",
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
    body:
      "We respect your time. How would you prefer our practice leadership to coordinate your engagement?",
    footer: "Step 4 of 5: Consultation Mode",
    buttons: [
      { id: "btn_call", title: "Schedule Call", next: "step5_action" },
      { id: "btn_brief", title: "Detailed Scope Doc", next: "step5_action" },
      { id: "btn_direct", title: "Dedicated Lead", next: "step5_action" },
    ],
  },

  // ── 5. Message 5 (Buttons): Confirmation & Action ──────────────────────────
  {
    kind: "buttons",
    id: "step5_action",
    header: "Confirmation",
    body:
      "Your specifications have been classified.\n\n" +
      "Select your preferred next step to finalize routing:",
    footer: "Step 5 of 5: Final Confirmation",
    buttons: [
      { id: "act_details", title: "Submit Brief", next: "details" },
      { id: "act_deck", title: "Request Deck", next: "briefing" },
      { id: "act_agent", title: "Connect Advisor", next: "human" },
    ],
  },

  // ── 6. Continue Steps: Intake & Protocols ──────────────────────────────────
  {
    kind: "text",
    id: "details",
    body:
      "*Brief Intake Confirmed*\n\n" +
      "Your project ticket has been flagged with senior priority.\n\n" +
      "Please provide the following details in a single reply:\n" +
      "1. *Company / Entity Name & Website*\n" +
      "2. *Your Name & Title*\n" +
      "3. *Core Objective or Problem Statement*\n\n" +
      "💡 *Tip:* Voice notes or document attachments are fully supported.",
  },

  {
    kind: "text",
    id: "briefing",
    body:
      "*Corporate Briefing Request Logged*\n\n" +
      "Please reply with your work email and organization website.\n\n" +
      "Our practice team will transmit our credentials deck, engagement frameworks, and case studies to your inbox promptly.\n\n" +
      `Official Advisory Hours: ${HOURS}.`,
  },

  {
    kind: "text",
    id: "urgent",
    body:
      "🚨 *Priority Escalation Activated*\n\n" +
      "Your incident has been routed to our on-call leadership.\n\n" +
      "Please reply immediately with:\n" +
      "1. *Incident Description* — nature of outage or threat\n" +
      "2. *Affected Assets* — domains, servers, or endpoints\n" +
      "3. *Direct Phone Number* for voice conference\n\n" +
      "Standby for engineer dispatch.",
  },

  {
    kind: "text",
    id: "apply",
    body:
      "*Talent Acquisition Desk*\n\n" +
      "Please send your CV or resume as a PDF attachment.\n\n" +
      "Kindly mention your target specialization, technical stack, and current timezone. Our hiring board reviews all submissions directly.",
  },

  {
    kind: "text",
    id: "human",
    body:
      "👨‍💼 *Practice Lead Assigned*\n\n" +
      "A dedicated advisor has been connected to this secure WhatsApp session.\n\n" +
      "Please feel free to send any project notes, architectural diagrams, or initial questions. We will reply during active advisory hours.\n\n" +
      `Business Hours: ${HOURS}`,
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
    header: "Technical Incident Command",
    body:
      "Tauqeer Mustafa Inc — 24/7 Global Technical Incident & Support Operations.\n\n" +
      "Select your issue classification below for immediate triage and engineer dispatch:",
    footer: "P1 Outage: 15–30 Min Response SLA",
    button: "Select Triage",
    sections: [
      {
        title: "Incident Triage",
        rows: [
          {
            id: "supp_p1",
            title: "P1 Mission-Critical",
            description: "System offline, security compromise, or critical data loss",
            next: "supp_scope",
          },
          {
            id: "supp_bug",
            title: "P2/P3 Performance Issue",
            description: "Degraded functionality, recurrent errors or API timeouts",
            next: "supp_scope",
          },
          {
            id: "supp_ticket",
            title: "Track Open Ticket",
            description: "Query real-time resolution state by reference ID",
            next: "check_ticket",
          },
          {
            id: "supp_lead",
            title: "Escalate to Duty Lead",
            description: "Direct paging of senior infrastructure incident commander",
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
    header: "Impacted Environment",
    body: "Specify the primary architectural tier experiencing anomalies:",
    footer: "Step 2 of 5: System Tier",
    button: "Choose Component",
    sections: [
      {
        title: "Infrastructure Layer",
        rows: [
          {
            id: "comp_prod",
            title: "Cloud & Compute Hosts",
            description: "Production clusters, Kubernetes pods, VMs or database servers",
            next: "supp_impact",
          },
          {
            id: "comp_api",
            title: "APIs & Core Backend",
            description: "REST/GraphQL endpoints, integration webhooks or queue workers",
            next: "supp_impact",
          },
          {
            id: "comp_client",
            title: "Web Portal & Edge CDN",
            description: "User portal interface, DNS records, mobile app or CDN caching",
            next: "supp_impact",
          },
        ],
      },
    ],
  },

  // ── 3. Message 3 (List): Severity & Environment ────────────────────
  {
    kind: "list",
    id: "supp_impact",
    header: "Severity & Environment",
    body: "Designate the operational severity level and client environment affected:",
    footer: "Step 3 of 5: Severity Matrix",
    button: "Select Severity",
    sections: [
      {
        title: "Severity Classification",
        rows: [
          {
            id: "sev_crit",
            title: "Critical Outage (P1)",
            description: "Complete loss of service; customer-facing operations blocked",
            next: "supp_channel",
          },
          {
            id: "sev_high",
            title: "High Severity (P2)",
            description: "Key features impaired; operational workaround in effect",
            next: "supp_channel",
          },
          {
            id: "sev_norm",
            title: "Standard Issue (P3)",
            description: "Non-critical defect, telemetry notice or configuration request",
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
    header: "Dispatch Protocol",
    body: "How should our on-call engineers establish coordination with your team?",
    footer: "Step 4 of 5: Dispatch Channel",
    buttons: [
      { id: "p1_call_btn", title: "Emergency Hotline", next: "supp_confirm" },
      { id: "p1_status_btn", title: "Live Status Hub", next: "supp_confirm" },
      { id: "bug_sla_btn", title: "SLA Response Queue", next: "supp_confirm" },
    ],
  },

  // ── 5. Message 5 (Buttons): Confirmation & Readiness ───────────────────────
  {
    kind: "buttons",
    id: "supp_confirm",
    header: "Confirm Incident Logging",
    body: "Acknowledge selection to instantly notify the engineering team:",
    footer: "Step 5 of 5: Final Dispatch",
    buttons: [
      { id: "conf_ticket", title: "Register Incident", next: "supp_ticket_intake" },
      { id: "conf_lead", title: "Page Duty Lead", next: "speak_lead" },
      { id: "conf_hotline", title: "View Hotline", next: "hotline_info" },
    ],
  },

  // ── 6. Continue Steps: Protocols & Hotlines ────────────────────────────────
  {
    kind: "text",
    id: "supp_ticket_intake",
    body:
      "🛠️ *Incident Intake Protocol*\n\n" +
      "Please provide the incident profile in a single message:\n\n" +
      "1. *Target Domain / Host / Endpoint*\n" +
      "2. *Timestamp of Occurrence* (with timezone)\n" +
      "3. *HTTP Status Codes / Log Output*\n\n" +
      "Your incident reference ID will be generated upon message arrival.",
  },
  {
    kind: "text",
    id: "check_ticket",
    body:
      "🔍 *Incident Telemetry Tracker*\n\n" +
      "Reply with your Ticket Reference ID (e.g., *TMI-SUP-88214*).\n\n" +
      "You can also monitor live diagnostics and SLAs at:\n" +
      "👉 https://support.tauqeermustafa.tech/ticket",
  },
  {
    kind: "text",
    id: "speak_lead",
    body:
      "🚨 *Incident Commander Paged*\n\n" +
      "The engineering duty lead has received your emergency alert.\n\n" +
      "This channel is actively monitored 24/7/365 for high-severity issues. Please send relevant stack traces, terminal logs, or error screenshots now.",
  },
  {
    kind: "text",
    id: "hotline_info",
    body:
      "📞 *Emergency Incident Hotline*\n\n" +
      "Direct Line: *+92 335 6701199*\n" +
      "Central Dispatch: support@tauqeermustafa.tech\n\n" +
      "Priority telephone response is live 24/7 for contracted SLA accounts.",
  },
  {
    kind: "text",
    id: "status_hub",
    body:
      "📊 *Global Telemetry & Status Hub*\n\n" +
      "Review operational uptime, API latency, and regional health indicators live at:\n" +
      "👉 https://support.tauqeermustafa.tech/status",
  },
  {
    kind: "text",
    id: "sla_info",
    body:
      "⏱️ *Contracted SLA Windows*\n\n" +
      "• *P1 (Critical Outage):* 15–30 min immediate engagement\n" +
      "• *P2 (High Severity):* < 2 hours response time\n" +
      "• *P3 (Standard Issue):* < 24 hours turnaround\n" +
      "• *P4 (General Request):* < 48 hours resolution",
  },
];

export function getFlowKey(department?: "general" | "support" | "direct"): string {
  if (department === "direct") return `${KEYS.flow}:direct`;
  return department === "support" ? `${KEYS.flow}:support` : KEYS.flow;
}

export function getDefaultSteps(department?: "general" | "support" | "direct"): FlowStep[] {
  return department === "support" ? DEFAULT_SUPPORT_STEPS : DEFAULT_STEPS;
}

/** Fetches flow steps honoring department sandbox and KV custom copy. */
export async function getFlowSteps(department?: "general" | "support" | "direct"): Promise<FlowStep[]> {
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
export async function saveFlowSteps(steps: FlowStep[], department?: "general" | "support" | "direct"): Promise<boolean> {
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
export async function resetFlowSteps(department?: "general" | "support" | "direct"): Promise<boolean> {
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
export async function getEffectiveFlowStep(id?: string | null, department?: "general" | "support" | "direct"): Promise<FlowStep | null> {
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
  department?: "general" | "support" | "direct"
): Promise<FlowStep | null> {
  if (!choiceId) return null;

  const primaryDept = department || "general";
  const secondaryDept = primaryDept === "support" ? "general" : primaryDept === "direct" ? "general" : "support";

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
  department?: "general" | "support" | "direct"
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
