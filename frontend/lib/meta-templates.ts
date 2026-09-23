/**
 * Meta-approved message template definitions.
 *
 * These are the ONLY way to start a business-initiated conversation on the
 * WhatsApp Cloud API (i.e. message someone who hasn't texted you in the last
 * 24 hours). Each template must be submitted to Meta and approved before it can
 * be sent — use POST /api/whatsapp/meta-templates to submit them.
 *
 * Rules encoded here (enforced by Meta):
 *   • name       – lowercase letters, numbers and underscores only
 *   • category   – MARKETING (promotional) or UTILITY (transactional)
 *   • language   – BCP-47 code, e.g. "en_US"
 *   • header     – optional static TEXT header, ≤60 chars, NO emojis / newlines /
 *                  asterisks (Meta rejects them — error subcode 2388072)
 *   • body       – required, ≤1024 chars, may contain {{1}}, {{2}}… variables,
 *                  emojis ARE allowed here
 *   • bodyExample – one sample value per body variable, in order (required by Meta when variables are present)
 *   • footer     – optional, ≤60 chars, no variables
 *   • buttons    – optional quick-reply labels, ≤25 chars each, max 10
 *
 * TWO THINGS THAT CANNOT BE CHANGED LATER
 * ───────────────────────────────────────
 * `name` and `category` are fixed the moment Meta accepts a template. Renaming
 * one orphans the approved copy at Meta and every send call site that names it;
 * the category cannot be changed at all. Everything else — header, body, footer,
 * buttons — is editable, and POST /api/whatsapp/meta-templates edits an existing
 * template in place rather than resubmitting it. An edit sends the template back
 * into review, and the previously approved wording keeps sending until the new
 * one is approved.
 *
 * HOUSE RULES FOR THE COPY — the same three as lib/wa-flow
 * ───────────────────────────────────────────────────────
 * 1. No emojis. Meta allows them in a body, but they read as noise on a business
 *    number and several still render as boxes on older Androids. (Meta forbids
 *    them in a TEXT header outright — see `sanitizeHeader`.)
 * 2. No prices. What the work costs depends on scope. A figure baked into an
 *    approved template is one somebody then has to argue their way out of, and it
 *    cannot be corrected without another round of review.
 * 3. No promise a person has to keep. Working hours are a fact and can be
 *    stated; "we reply within 2-4 hours" and "trusted by 100+ clients" are a
 *    guess and a boast respectively, and both were in the set this replaces.
 *
 * Variable rules Meta enforces: `{{1}}..{{N}}` sequential, one `bodyExample`
 * value each, no variable at the very start or end of a body, and no two
 * adjacent. Variable COUNTS here are also load-bearing — `buildSendComponents`
 * pads missing values with empty strings, so removing a variable that a caller
 * still fills is silent, but adding one it does not fill leaves a gap in the
 * delivered message.
 */

export type MetaTemplateDef = {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  department?: "general" | "support" | "direct";
  header?: string;
  body: string;
  bodyExample?: string[];
  footer?: string;
  buttons?: string[];
};

export const META_TEMPLATES: MetaTemplateDef[] = [
  {
    name: "welcome_new_lead",
    category: "MARKETING",
    language: "en_US",
    department: "general",
    header: "Welcome to Tauqeer Mustafa Inc",
    body:
      "Hi {{1}}, thanks for connecting with Tauqeer Mustafa Inc.\n\n" +
      "We design and engineer high-performance web platforms, cloud systems, AI workflows, and cybersecurity.\n\n" +
      "Reply with what you are building or solving and we will connect you directly with the right lead engineer.",
    bodyExample: ["there"],
    footer: "Mon to Sat, 09:00 to 18:00 PKT",
    buttons: ["Web Platforms", "Cybersecurity", "AI & Cloud"],
  },
  {
    name: "services_overview",
    category: "MARKETING",
    language: "en_US",
    department: "general",
    header: "Engineering Capabilities",
    body:
      "Hi {{1}}, here is how our engineering team helps businesses build and scale:\n\n" +
      "Web & Platforms: Modern scalable portals, SaaS web apps, and API backends.\n" +
      "Cybersecurity: Posture audits, infrastructure hardening, and rapid incident response.\n" +
      "AI & Cloud: Automated AI workflows, internal copilots, and cloud architecture.\n\n" +
      "Which area is closest to your current priorities?",
    bodyExample: ["there"],
    footer: "Engineering & Advisory",
    buttons: ["Web Platforms", "Cybersecurity", "AI & Cloud"],
  },
  {
    name: "pricing_info",
    category: "MARKETING",
    language: "en_US",
    department: "general",
    header: "Project Investment",
    body:
      "Hi {{1}}, project investment depends directly on your technical scope and milestones.\n\n" +
      "Send a quick summary of what you need built or secured, and we will prepare a clear, fixed-price proposal with defined deliverables.\n\n" +
      "Transparent pricing, no surprises.",
    bodyExample: ["there"],
    footer: "Fixed-Price Proposals",
    buttons: ["Share Project Scope", "Schedule a Call"],
  },
  {
    name: "quote_ready",
    category: "MARKETING", // Meta already has this as MARKETING from first submission; correct is UTILITY but can't change category after creation
    language: "en_US",
    department: "general",
    header: "Your proposal is ready",
    body:
      "Hi {{1}}, the proposal for {{2}} is written and on its way to your email.\n\n" +
      "It sets out what is included, what is not, the order the work runs in, and a fixed price. " +
      "Nothing outside it is billed without your say.\n\n" +
      "As scoped, the work runs {{3}} from the day it starts.",
    bodyExample: ["John", "the security review", "four weeks"],
    footer: "Valid for 30 days",
    buttons: ["View the proposal", "Ask a question", "Happy to proceed"],
  },
  {
    name: "project_kickoff",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Project kickoff",
    body:
      "Welcome aboard, {{1}}. Work on {{2}} starts now.\n\n" +
      "You get one named contact here, the scope in writing, and an update at each milestone.\n\n" +
      "If anything looks wrong at any point, say it early rather than at the end.",
    bodyExample: ["John", "your project"],
    footer: "Everything agreed is in writing",
    buttons: ["Meet your contact", "Ask a question"],
  },
  {
    name: "milestone_update",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Milestone complete",
    body:
      "Hi {{1}}, we have finished {{2}} on your project.\n\n" +
      "The deliverables are ready for you to look over. Tell us what needs another pass — changes " +
      "inside the agreed scope are part of the job, not a new one.",
    bodyExample: ["John", "the design phase"],
    footer: "Review whenever suits you",
    buttons: ["Review the work", "Approve", "Request changes"],
  },
  {
    name: "payment_reminder",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Invoice reminder",
    body:
      "Hi {{1}}, invoice {{2}} is due on {{3}}. This is a reminder, not a chase.\n\n" +
      "The amount and the payment details are on the invoice itself.\n\n" +
      "If anything on it does not match what we agreed, tell us and we will reissue it.",
    bodyExample: ["John", "TM-104", "25 August"],
    footer: "Bank transfer or card",
    buttons: ["Send the invoice", "Already paid", "Question on it"],
  },
  {
    name: "meeting_reminder",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Meeting reminder",
    body:
      "Hi {{1}}, a reminder about our meeting on {{2}} at {{3}} Pakistan time.\n\n" +
      "Nothing to prepare. We will go through what you want to be different and what the work " +
      "would involve.\n\n" +
      "If the time no longer suits, reply and we will move it.",
    bodyExample: ["John", "22 August", "3:00 PM"],
    footer: "Reply to move it",
    buttons: ["Confirm", "Reschedule"],
  },
  {
    name: "project_delivered",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Work delivered",
    body:
      "Hi {{1}}, the work on {{2}} is finished and handed over.\n\n" +
      "The report, the files and the handover notes are going to your email.\n\n" +
      "Support runs for 30 days from today and questions inside it are not billed. If something is " +
      "not as agreed, say so and we will put it right.",
    bodyExample: ["John", "your security review"],
    footer: "Support runs for 30 days",
    buttons: ["Get the files", "Ask a question", "Leave a review"],
  },
  {
    name: "follow_up",
    category: "MARKETING",
    language: "en_US",
    department: "general",
    header: "Checking In",
    body:
      "Hi {{1}}, checking in regarding your conversation with our team.\n\n" +
      "If you would like to move forward on your project, we are ready to share a delivery roadmap and scope. If timing has shifted, no problem at all.\n\n" +
      "Let us know how you would like to proceed.",
    bodyExample: ["there"],
    footer: "Tauqeer Mustafa Inc",
    buttons: ["Ready to proceed", "Need more time", "Schedule a call"],
  },
  {
    name: "feedback_request",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Project Feedback",
    body:
      "Hi {{1}}, now that {{2}} is deployed, we would love your candid feedback.\n\n" +
      "How did the delivery go, and how can our engineering team support you further?\n\n" +
      "Your feedback directly shapes our standards.",
    bodyExample: ["John", "your recent project"],
    footer: "Engineering Quality",
    buttons: ["Share Feedback", "Leave a Review"],
  },
  {
    name: "reengagement",
    category: "MARKETING",
    language: "en_US",
    department: "general",
    header: "Reconnecting",
    body:
      "Hi {{1}}, we are revisiting our engineering roadmap and wanted to check in.\n\n" +
      "If you still have upcoming software, cloud, or security milestones, we would be glad to resume right where we left off.\n\n" +
      "Feel free to reply here anytime.",
    bodyExample: ["there"],
    footer: "Tauqeer Mustafa Inc",
    buttons: ["Resume discussion", "Not right now", "Schedule a call"],
  },
  // ─── Technical & Client Support Templates ────────────────────────────
  {
    name: "support_ticket_created",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Support ticket opened",
    body:
      "Hi {{1}}, your ticket {{2}} is logged with {{3}} SLA priority.\n\n" +
      "Our incident engineer is reviewing diagnostic logs. Updates will be dispatched here directly.",
    bodyExample: ["there", "TMI-SUP-88214", "P1 Critical"],
    footer: "24/7 SLA Technical Desk",
    buttons: ["Track Ticket Status", "Escalate to Lead", "Add Notes"],
  },
  {
    name: "support_p1_outage_ack",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Critical P1 Incident Alert",
    body:
      "URGENT ACKNOWLEDGEMENT for {{1}}.\n\n" +
      "Our incident commander has initiated the emergency triage bridge for outage report {{2}}.\n\n" +
      "Voice bridge dispatch is standing by at {{3}}.",
    bodyExample: ["Production Cluster", "TMI-INC-99120", "+92 335 6701199"],
    footer: "15 to 60 min SLA Response",
    buttons: ["Join Bridge", "View Incident Status"],
  },
  {
    name: "support_ticket_resolved",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Support ticket resolved",
    body:
      "Hi {{1}}, ticket {{2}} is resolved.\n\n" +
      "The fix has been deployed to production: {{3}}.\n\n" +
      "Please verify that your system is functioning normally.",
    bodyExample: ["there", "TMI-SUP-88214", "API gateway patch applied"],
    footer: "Tauqeer Mustafa Inc Support",
    buttons: ["Confirm Resolution", "Reopen Ticket"],
  },
  {
    name: "support_status_update",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Ticket Status Update",
    body:
      "Hi {{1}}, an update on ticket {{2}}.\n\n" +
      "Investigation details: {{3}}.\n\n" +
      "Our engineering team is monitoring the resolution.",
    bodyExample: ["there", "TMI-SUP-88214", "Patch testing underway in staging"],
    footer: "SLA Priority Monitored",
    buttons: ["Acknowledge", "Speak with Lead"],
  },
  {
    name: "support_sla_escalation",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Emergency SLA Escalation",
    body:
      "Notice for {{1}} regarding ticket {{2}}.\n\n" +
      "This incident has been escalated directly to {{3}} for priority triage.\n\n" +
      "We will update you within the next 30 minutes.",
    bodyExample: ["there", "TMI-SUP-88214", "Head of Engineering"],
    footer: "Tauqeer Mustafa Inc Support Desk",
    buttons: ["View Status", "Call Hotline"],
  },
  {
    name: "support_maintenance_notice",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Scheduled Maintenance",
    body:
      "Notice for {{1}}.\n\n" +
      "Scheduled system maintenance is planned for {{2}}.\n\n" +
      "Expected service impact: {{3}}.\n\n" +
      "All redundant backup nodes remain active.",
    bodyExample: ["all systems", "Sunday 02:00 PKT", "under 15 minutes"],
    footer: "Infrastructure Operations Desk",
    buttons: ["Maintenance Details", "Contact Ops"],
  },
  {
    name: "otp_verification_code",
    category: "UTILITY",
    language: "en_US",
    department: "general",
    header: "Verification Code",
    body:
      "Your security verification code for Tauqeer Mustafa Inc is {{1}}.\n\n" +
      "This code is valid for 10 minutes. For your protection, never share this code or your account credentials with anyone.",
    bodyExample: ["849201"],
    footer: "Tauqeer Mustafa Inc Security",
    buttons: ["Copy Code", "I did not request this"],
  },
  {
    name: "security_alert_otp",
    category: "UTILITY",
    language: "en_US",
    department: "support",
    header: "Security Verification",
    body:
      "Security notice for {{1}}.\n\n" +
      "A verification request was initiated. Your one-time authentication code is: {{2}}.\n\n" +
      "If you did not make this request, notify our 24/7 support desk immediately.",
    bodyExample: ["your account", "629140"],
    footer: "24/7 SLA Technical Desk",
    buttons: ["Contact Support", "Acknowledge"],
  },
];

/** Count of {{n}} placeholders in a template body. */
export function countVariables(body: string): number {
  const matches = body.match(/\{\{\s*\d+\s*\}\}/g);
  if (!matches) return 0;
  // Highest index used (Meta expects sequential 1..N)
  const indexes = matches.map((m) => parseInt(m.replace(/[^0-9]/g, ""), 10));
  return Math.max(...indexes);
}

/**
 * Meta forbids emojis, newlines and formatting characters (* _ ~) in TEXT
 * headers. Strip them defensively so a stray emoji never blocks submission.
 */
export function sanitizeHeader(text: string): string {
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/[*_~`]/g, "")
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{2000}-\u{206F}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/**
 * Build the `components` array for the Meta "create template" API
 * (POST /{WABA_ID}/message_templates).
 */
export function buildCreateComponents(def: MetaTemplateDef): Record<string, unknown>[] {
  const components: Record<string, unknown>[] = [];

  if (def.header) {
    const clean = sanitizeHeader(def.header);
    if (clean) components.push({ type: "HEADER", format: "TEXT", text: clean });
  }

  const bodyComponent: Record<string, unknown> = { type: "BODY", text: def.body };
  const varCount = countVariables(def.body);
  if (varCount > 0) {
    // Meta wants one example row: example.body_text = [[val1, val2, ...]]
    const example = (def.bodyExample ?? []).slice(0, varCount);
    while (example.length < varCount) example.push("example");
    bodyComponent.example = { body_text: [example] };
  }
  components.push(bodyComponent);

  if (def.footer) {
    components.push({ type: "FOOTER", text: def.footer });
  }

  if (def.buttons && def.buttons.length > 0) {
    // Meta allows up to 10 quick-reply buttons per template.
    components.push({
      type: "BUTTONS",
      buttons: def.buttons.slice(0, 10).map((b) => ({ type: "QUICK_REPLY", text: b.slice(0, 25) })),
    });
  }

  return components;
}

/**
 * Build the `template.components` array for SENDING an approved template
 * (POST /{PHONE_NUMBER_ID}/messages with type "template").
 * Quick-reply buttons and static headers need no runtime parameters — only
 * body variables do.
 */
export function buildSendComponents(def: MetaTemplateDef, bodyVars: string[]): Record<string, unknown>[] {
  const components: Record<string, unknown>[] = [];
  const varCount = countVariables(def.body);
  if (varCount > 0) {
    const values = bodyVars.slice(0, varCount);
    while (values.length < varCount) values.push("");
    components.push({
      type: "body",
      parameters: values.map((v) => ({ type: "text", text: v })),
    });
  }
  return components;
}
