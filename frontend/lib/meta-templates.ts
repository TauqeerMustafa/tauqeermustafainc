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
 *   • buttons    – optional quick-reply labels, ≤20 chars each, max 3
 */

export type MetaTemplateDef = {
  name: string;
  category: "MARKETING" | "UTILITY";
  language: string;
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
    header: "Welcome to Tauqeer Mustafa Inc",
    body: "👋 Hi {{1}}! Thanks for your interest in our services. We build websites, mobile apps, and custom software. How can we help you today?",
    bodyExample: ["there"],
    footer: "We reply within 2-4 hours",
    buttons: ["View Services", "Get Pricing", "Talk to Us"],
  },
  {
    name: "services_overview",
    category: "MARKETING",
    language: "en_US",
    header: "What We Build",
    body: "🚀 Hi {{1}}, we specialize in Web Development, Mobile Apps, UI/UX Design, E-commerce, and API integrations. Which service interests you most?",
    bodyExample: ["there"],
    footer: "Trusted by 100+ clients",
    buttons: ["Web & Apps", "Design", "Get a Quote"],
  },
  {
    name: "pricing_info",
    category: "MARKETING",
    language: "en_US",
    header: "Our Pricing",
    body: "💰 Great question, {{1}}! Websites start at $2,000, mobile apps at $5,000, and design projects at $1,000. Share your requirements for a detailed quote.",
    bodyExample: ["there"],
    footer: "Free, no-obligation quotes",
    buttons: ["Request Quote", "See Services", "Book a Call"],
  },
  {
    name: "quote_ready",
    category: "UTILITY",
    language: "en_US",
    header: "Your Quote is Ready",
    body: "✅ Hi {{1}}, your custom quote for {{2}} is ready! Estimated total: {{3}}. The full proposal includes scope, timeline, and payment terms.",
    bodyExample: ["John", "your website", "$3,500"],
    footer: "Valid for 30 days",
    buttons: ["View Quote", "Ask a Question", "Accept"],
  },
  {
    name: "project_kickoff",
    category: "UTILITY",
    language: "en_US",
    header: "Project Kickoff",
    body: "🎉 Welcome aboard, {{1}}! We're excited to start {{2}}. Your dedicated project manager will reach out within 24 hours with portal access and next steps.",
    bodyExample: ["John", "your project"],
    footer: "Let's build something great",
    buttons: ["View Portal", "Meet the Team"],
  },
  {
    name: "milestone_update",
    category: "UTILITY",
    language: "en_US",
    header: "Milestone Complete",
    body: "✨ Hi {{1}}, we've completed {{2}} for your project. Please review the deliverables and share your feedback so we can proceed to the next phase.",
    bodyExample: ["John", "the design phase"],
    footer: "We respond within 24 hours",
    buttons: ["Review Work", "Approve", "Request Changes"],
  },
  {
    name: "payment_reminder",
    category: "UTILITY",
    language: "en_US",
    header: "Payment Reminder",
    body: "💳 Hi {{1}}, a friendly reminder that your payment of {{2}} is due on {{3}}. Once received, we'll move straight to the next phase of your project.",
    bodyExample: ["John", "$1,500", "Aug 25"],
    footer: "Multiple payment options",
    buttons: ["Pay Now", "View Invoice", "Need Help?"],
  },
  {
    name: "meeting_reminder",
    category: "UTILITY",
    language: "en_US",
    header: "Meeting Reminder",
    body: "📅 Hi {{1}}, reminder about our meeting on {{2}} at {{3}}. We'll discuss your project details and next steps. Looking forward to speaking with you!",
    bodyExample: ["John", "Aug 22", "3:00 PM"],
    footer: "Reply to reschedule",
    buttons: ["Confirm", "Reschedule"],
  },
  {
    name: "project_delivered",
    category: "UTILITY",
    language: "en_US",
    header: "Project Delivered",
    body: "🚀 Congratulations {{1}}! {{2}} is now live. You'll receive the source code, documentation, and 30 days of free support in your email shortly.",
    bodyExample: ["John", "Your website"],
    footer: "Thank you for your trust",
    buttons: ["Get Access", "Leave a Review"],
  },
  {
    name: "follow_up",
    category: "MARKETING",
    language: "en_US",
    header: "Just Checking In",
    body: "👋 Hi {{1}}, we wanted to follow up on your interest in working with us. Do you have any questions we can help answer to get your project moving?",
    bodyExample: ["there"],
    footer: "We're here to help",
    buttons: ["Yes, Let's Talk", "Send Pricing", "Maybe Later"],
  },
  {
    name: "feedback_request",
    category: "UTILITY",
    language: "en_US",
    header: "How Did We Do",
    body: "💙 Hi {{1}}, thank you for choosing us! We'd love your feedback on {{2}}. Your review helps us improve and serve you even better next time.",
    bodyExample: ["John", "your recent project"],
    footer: "Takes less than a minute",
    buttons: ["Leave Review", "Share Feedback"],
  },
  {
    name: "reengagement",
    category: "MARKETING",
    language: "en_US",
    header: "We Miss You",
    body: "🌟 Hi {{1}}, it's been a while! We've added new services and would love to help with your next project. Reply and let's pick up where we left off.",
    bodyExample: ["there"],
    footer: "Special offers available",
    buttons: ["See What's New", "Get a Quote"],
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
    components.push({
      type: "BUTTONS",
      buttons: def.buttons.slice(0, 3).map((b) => ({ type: "QUICK_REPLY", text: b.slice(0, 20) })),
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
