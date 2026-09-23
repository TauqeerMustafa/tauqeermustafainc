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

  // ── Step 1 · List ──────────────────────────────────────────────────────────
  {
    kind: "list",
    id: "start",
    header: "Tauqeer Mustafa Inc",
    body:
      "We specialise in AI systems, cybersecurity, cloud engineering, and " +
      "enterprise advisory.\n\n" +
      "Select a category to route your enquiry to the right practice team:",
    footer: "Mon–Sat · 09:00–18:00 PKT",
    button: "Get Started",
    sections: [
      {
        title: "Services",
        rows: [
          {
            id: "cat_sec",
            title: "Cybersecurity & Defense",
            description: "Penetration testing, threat defense & risk audits",
            next: "scope_security",
          },
          {
            id: "cat_fin",
            title: "Compliance & Governance",
            description: "Internal controls, audit readiness & policy",
            next: "scope_compliance",
          },
          {
            id: "cat_seo",
            title: "Growth & Digital",
            description: "AI solutions, enterprise web & SEO",
            next: "scope_seo",
          },
        ],
      },
      {
        title: "Accounts",
        rows: [
          {
            id: "cat_cli",
            title: "Existing Client",
            description: "Project delivery, billing & technical queries",
            next: "scope_client",
          },
          {
            id: "cat_gen",
            title: "Careers & Partnerships",
            description: "Roles, internships & executive advisory",
            next: "scope_general",
          },
        ],
      },
    ],
  },

  // ── Step 2 · Lists (one per category) ──────────────────────────────────────
  {
    kind: "list",
    id: "scope_security",
    header: "Cybersecurity",
    body: "Select the engagement type that applies to your requirement:",
    footer: "Step 2 of 5",
    button: "Select Scope",
    sections: [
      {
        title: "Security Engagements",
        rows: [
          {
            id: "sec_review",
            title: "Vulnerability Assessment",
            description: "Network, cloud & application risk audit",
            next: "step3_scale",
          },
          {
            id: "sec_incident",
            title: "Incident Response",
            description: "Active breach: containment & forensics",
            next: "step3_scale",
          },
          {
            id: "sec_defense",
            title: "System Hardening",
            description: "Zero-trust design & perimeter controls",
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
    body: "Select your primary compliance objective:",
    footer: "Step 2 of 5",
    button: "Select Scope",
    sections: [
      {
        title: "Compliance Engagements",
        rows: [
          {
            id: "fin_controls",
            title: "Internal Controls",
            description: "Risk framework & control architecture",
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
            description: "Policy design, board reporting & governance",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_seo",
    header: "Growth & Digital",
    body: "Select your primary growth objective:",
    footer: "Step 2 of 5",
    button: "Select Scope",
    sections: [
      {
        title: "Growth Engagements",
        rows: [
          {
            id: "seo_growth",
            title: "Search Optimisation",
            description: "Rankings, Core Web Vitals & technical SEO",
            next: "step3_scale",
          },
          {
            id: "seo_adsense",
            title: "AdSense Optimisation",
            description: "Ad yield, placement strategy & revenue uplift",
            next: "step3_scale",
          },
          {
            id: "seo_funnel",
            title: "Conversion Strategy",
            description: "Traffic-to-lead funnel design & automation",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_client",
    header: "Client Services",
    body: "Select the area where you need assistance:",
    footer: "Step 2 of 5",
    button: "Select Area",
    sections: [
      {
        title: "Client Account",
        rows: [
          {
            id: "cli_milestone",
            title: "Delivery & Milestones",
            description: "Progress updates, deliverables & sign-off",
            next: "step3_scale",
          },
          {
            id: "cli_invoice",
            title: "Billing & Invoices",
            description: "Retainer statements, payments & receipts",
            next: "step3_scale",
          },
          {
            id: "cli_technical",
            title: "Technical Support",
            description: "Priority query on a live deliverable",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  {
    kind: "list",
    id: "scope_general",
    header: "Careers & Partnerships",
    body: "Select your area of interest:",
    footer: "Step 2 of 5",
    button: "Select Option",
    sections: [
      {
        title: "Talent & Advisory",
        rows: [
          {
            id: "gen_careers",
            title: "Professional Roles",
            description: "Full-time positions in engineering & advisory",
            next: "step3_scale",
          },
          {
            id: "gen_intern",
            title: "Paid Internship",
            description: "Structured programme, performance-evaluated",
            next: "step3_scale",
          },
          {
            id: "gen_exec",
            title: "Executive Advisory",
            description: "Strategic collaboration or senior consulting",
            next: "step3_scale",
          },
        ],
      },
    ],
  },

  // ── Step 3 · List ──────────────────────────────────────────────────────────
  {
    kind: "list",
    id: "step3_scale",
    header: "Organisation & Timeline",
    body:
      "Two quick details help us assign the right resource and set accurate " +
      "expectations.\n\n" +
      "Select the profile that best fits your situation:",
    footer: "Step 3 of 5",
    button: "Select Profile",
    sections: [
      {
        title: "Organisation Size",
        rows: [
          {
            id: "scale_ent",
            title: "Enterprise (100+ staff)",
            description: "Multi-site, complex org or regulated sector",
            next: "step4_format",
          },
          {
            id: "scale_sme",
            title: "Growth Business",
            description: "Scaling team with defined milestones",
            next: "step4_format",
          },
        ],
      },
      {
        title: "Project Timeline",
        rows: [
          {
            id: "scale_urgent",
            title: "Urgent (Within 7 Days)",
            description: "Active risk, breach, or hard deadline",
            next: "step4_format",
          },
          {
            id: "scale_quarter",
            title: "Planned Initiative",
            description: "Roadmap item with a defined start window",
            next: "step4_format",
          },
        ],
      },
    ],
  },

  // ── Step 4 · Buttons ────────────────────────────────────────────────────────
  {
    kind: "buttons",
    id: "step4_format",
    header: "How Should We Connect?",
    body:
      "We keep first conversations short and focused — no lengthy forms, " +
      "no generic calls.\n\n" +
      "Choose your preferred format:",
    footer: "Step 4 of 5",
    buttons: [
      { id: "btn_call", title: "Book Discovery Call", next: "step5_action" },
      { id: "btn_brief", title: "Request a Proposal", next: "step5_action" },
      { id: "btn_direct", title: "Brief Practice Lead", next: "step5_action" },
    ],
  },

  // ── Step 5 · Buttons ────────────────────────────────────────────────────────
  {
    kind: "buttons",
    id: "step5_action",
    header: "One Last Step",
    body:
      "Your message goes directly to a practice lead — not a shared queue.\n\n" +
      "Choose how to proceed:",
    footer: "Step 5 of 5",
    buttons: [
      { id: "act_details", title: "Share Project Brief", next: "details" },
      { id: "act_deck", title: "Send Company Info", next: "briefing" },
      { id: "act_agent", title: "Connect Me Now", next: "human" },
    ],
  },

  // ── Terminal steps ──────────────────────────────────────────────────────────
  {
    kind: "text",
    id: "details",
    body:
      "*Your brief is received.*\n\n" +
      "Reply in one message:\n\n" +
      "1. *Company* — name and website\n" +
      "2. *You* — name and role\n" +
      "3. *Outcome* — what needs to change after this engagement\n\n" +
      "A voice note works just as well.",
  },

  {
    kind: "text",
    id: "briefing",
    body:
      "*Noted.*\n\n" +
      "Reply with your work email and company website.\n\n" +
      "A practice lead will send relevant case studies and an approach note " +
      "within one business day.\n\n" +
      `Hours: ${HOURS}.`,
  },

  {
    kind: "text",
    id: "urgent",
    body:
      "*Urgent escalation logged.*\n\n" +
      "Reply with:\n\n" +
      "1. *What occurred* — and when it started\n" +
      "2. *Systems affected* — endpoints, infrastructure, or data scope\n" +
      "3. *Direct contact number* — for immediate coordination\n\n" +
      "The on-call lead will respond on this channel.",
  },

  {
    kind: "text",
    id: "apply",
    body:
      "*Thank you for your interest.*\n\n" +
      "Send your CV as a PDF and include:\n" +
      "— The role or area you are applying for\n" +
      "— Your location and current availability\n\n" +
      "A portfolio or writing sample is welcome but not required.",
  },

  {
    kind: "text",
    id: "human",
    body:
      "*Connecting you to a practice lead.*\n\n" +
      "Your message has been flagged for direct review.\n\n" +
      "Send any files, notes, or context now — they will be waiting when the " +
      "lead opens this thread. No automated replies from this point.",
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

  // ── Step 1 · List ──────────────────────────────────────────────────────────
  {
    kind: "list",
    id: "start",
    header: "Technical Support",
    body:
      "You have reached the *Tauqeer Mustafa Inc* 24/7 Technical Incident " +
      "& Support Desk.\n\n" +
      "Select your issue category to begin triage and route to on-call engineering:",
    footer: "P1 Critical · 15–30 min SLA",
    button: "Begin Triage",
    sections: [
      {
        title: "Incident Triage",
        rows: [
          {
            id: "supp_p1",
            title: "P1 Critical Incident",
            description: "Production down, breach active, or critical data loss",
            next: "supp_scope",
          },
          {
            id: "supp_bug",
            title: "P2/P3 Service Issue",
            description: "Degraded performance, error loop, or broken feature",
            next: "supp_scope",
          },
          {
            id: "supp_ticket",
            title: "Check Ticket Status",
            description: "Track resolution progress by TMI-SUP reference ID",
            next: "check_ticket",
          },
          {
            id: "supp_lead",
            title: "Duty Lead Escalation",
            description: "Direct escalation — requires active retainer account",
            next: "supp_scope",
          },
        ],
      },
    ],
  },

  // ── Step 2 · List ──────────────────────────────────────────────────────────
  {
    kind: "list",
    id: "supp_scope",
    header: "Affected System Layer",
    body:
      "Pinpointing the affected component routes your ticket to the right engineer.\n\n" +
      "Select the primary layer experiencing issues:",
    footer: "Step 2 of 5",
    button: "Select Component",
    sections: [
      {
        title: "Infrastructure Tier",
        rows: [
          {
            id: "comp_prod",
            title: "Compute & Database",
            description: "Backend servers, cloud compute, VMs or database host",
            next: "supp_impact",
          },
          {
            id: "comp_api",
            title: "API & Integrations",
            description: "REST/GraphQL endpoints, webhooks, or queue workers",
            next: "supp_impact",
          },
          {
            id: "comp_client",
            title: "Web Portal & CDN",
            description: "User portal, mobile client, CDN caching, or DNS",
            next: "supp_impact",
          },
        ],
      },
    ],
  },

  // ── Step 3 · List ──────────────────────────────────────────────────────────
  {
    kind: "list",
    id: "supp_impact",
    header: "Incident Severity",
    body:
      "Severity determines dispatch priority and SLA response time.\n\n" +
      "Select current operational impact:",
    footer: "Step 3 of 5",
    button: "Select Severity",
    sections: [
      {
        title: "Severity Level",
        rows: [
          {
            id: "sev_crit",
            title: "Critical Outage (P1)",
            description: "Total production disruption, customer operations blocked",
            next: "supp_channel",
          },
          {
            id: "sev_high",
            title: "High Degradation (P2)",
            description: "Core service impaired with workaround in place",
            next: "supp_channel",
          },
          {
            id: "sev_norm",
            title: "Standard Issue (P3)",
            description: "Non-critical bug, configuration query, or notice",
            next: "supp_channel",
          },
        ],
      },
    ],
  },

  // ── Step 4 · Buttons ────────────────────────────────────────────────────────
  {
    kind: "buttons",
    id: "supp_channel",
    header: "Response Channel",
    body:
      "Incident classified.\n\n" +
      "Select how you want engineering to coordinate with your team:",
    footer: "Step 4 of 5",
    buttons: [
      { id: "p1_call_btn", title: "Emergency Hotline", next: "supp_confirm" },
      { id: "p1_status_btn", title: "Status Dashboard", next: "supp_confirm" },
      { id: "bug_sla_btn", title: "SLA Ticket Queue", next: "supp_confirm" },
    ],
  },

  // ── Step 5 · Buttons ────────────────────────────────────────────────────────
  {
    kind: "buttons",
    id: "supp_confirm",
    header: "Dispatch Confirmation",
    body:
      "Confirm your dispatch action to notify the on-call team and open the ticket:",
    footer: "Step 5 of 5",
    buttons: [
      { id: "conf_ticket", title: "Log Ticket Now", next: "supp_ticket_intake" },
      { id: "conf_lead", title: "Page Duty Lead", next: "speak_lead" },
      { id: "conf_hotline", title: "Direct Hotline", next: "hotline_info" },
    ],
  },

  // ── Terminal steps ──────────────────────────────────────────────────────────
  {
    kind: "text",
    id: "supp_ticket_intake",
    body:
      "*Incident Ticket Registration*\n\n" +
      "Reply with the following in one message:\n\n" +
      "1. *Affected URL / Host* — failing endpoint or service\n" +
      "2. *Environment* — production, staging, or specific region\n" +
      "3. *Timestamp* — when the issue began\n" +
      "4. *Error Details* — HTTP status, stack trace, or log snippet\n\n" +
      "A ticket ID will be generated upon receipt.",
  },
  {
    kind: "text",
    id: "check_ticket",
    body:
      "*Ticket Status Lookup*\n\n" +
      "Reply with your Ticket Reference ID (e.g. *TMI-SUP-88214*).\n\n" +
      "Live SLA countdown and updates are available at:\n" +
      "https://support.tauqeermustafa.tech/ticket",
  },
  {
    kind: "text",
    id: "speak_lead",
    body:
      "*Duty Lead Notified.*\n\n" +
      "The on-call incident commander has been paged.\n\n" +
      "Send your logs, terminal output, or screenshot now — they will be reviewed " +
      "the moment the lead opens this thread.\n\n" +
      "Active monitoring: 24/7 for P1/P2 · 08:00–22:00 PKT for P3/P4.",
  },
  {
    kind: "text",
    id: "hotline_info",
    body:
      "*24/7 Emergency Dispatch Desk:*\n\n" +
      "Phone: *+92 335 6701199*\n" +
      "Email: support@tauqeermustafa.tech\n\n" +
      "Available 24/7/365 for active retainer accounts with critical outages.",
  },
  {
    kind: "text",
    id: "status_hub",
    body:
      "*System Status & Telemetry:*\n\n" +
      "Real-time uptime, API latency, and operational health metrics:\n" +
      "https://support.tauqeermustafa.tech/status",
  },
  {
    kind: "text",
    id: "sla_info",
    body:
      "*Guaranteed SLA Response Windows:*\n\n" +
      "• *P1 (Critical Outage):* 15–30 min response\n" +
      "• *P2 (High Severity):* Under 2 hours response\n" +
      "• *P3 (Standard Issue):* Under 24 hours turnaround\n" +
      "• *P4 (General Request):* Under 48 hours\n\n" +
      "SLA windows apply to active retainer accounts during contracted hours.",
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
