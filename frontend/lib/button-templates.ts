/**
 * Presets for the admin composer's interactive-button message.
 *
 * WHAT THESE ARE
 * ──────────────
 * Hand-picked presets for the admin Send tab. A team member selects one from
 * the dropdown, which pre-populates header, body, footer, and interactive buttons.
 *
 * HOUSE RULES
 * ───────────
 * 1. Professional, crisp executive engineering voice (BMW-clean aesthetic).
 * 2. Meta character limits:
 *    • header: ≤ 60 chars
 *    • body: ≤ 1024 chars (*bold* allowed)
 *    • footer: ≤ 60 chars
 *    • buttons: ≤ 20 chars each, max 3
 * 3. Transparent, scope-based engagements with fixed-price delivery.
 */

export type ButtonTemplate = {
  /** Stable key for the composer's <select>. Never shown to the contact. */
  name: string;
  /** Bolded by WhatsApp above the body. Also the dropdown label. Max 60. */
  header: string;
  /** Max 1024. `*bold*` renders here. */
  body: string;
  /** Max 60, plain text. Required so the composer always has something to load. */
  footer: string;
  /** Meta accepts up to three; max 20 chars each. */
  buttons: string[];
};

export const BUTTON_TEMPLATES: ButtonTemplate[] = [
  {
    name: "route_enquiry",
    header: "Engineering & Advisory Desk",
    body:
      "Welcome to *Tauqeer Mustafa Inc.*\n\n" +
      "To connect you directly with the appropriate engineering team, please select your primary focus:\n\n" +
      "1. *Web & Platforms* — Cloud portals, enterprise SaaS & microservices\n" +
      "2. *Cybersecurity* — Posture audits, zero-trust & incident defense\n" +
      "3. *AI & Cloud* — Workflow automation, custom LLM copilots & DevOps\n\n" +
      "Our technical leadership will review your inquiry immediately.",
    footer: "Mon to Sat, 09:00 to 18:00 PKT",
    buttons: ["Web & Platforms", "Cybersecurity", "AI & Cloud Systems"],
  },
  {
    name: "web_platform_start",
    header: "Web & Cloud Platforms",
    body:
      "We engineer resilient, high-throughput web applications, cloud-native portals, and scalable API architectures.\n\n" +
      "Which milestone best describes your current project?",
    footer: "Technical Architecture Consultation",
    buttons: ["New Platform / MVP", "System Rebuild", "Architecture Review"],
  },
  {
    name: "security_review_start",
    header: "Cybersecurity Review",
    body:
      "We conduct end-to-end security assessments: mapping data flows, identifying attack surfaces, testing perimeter defense, and delivering a prioritized remediation matrix.\n\n" +
      "Which engagement fits your timeline?",
    footer: "Zero-Trust & Threat Modeling",
    buttons: ["Security Audit", "Active Incident", "Compliance Review"],
  },
  {
    name: "ai_automation_start",
    header: "AI & Workflow Automation",
    body:
      "We design and deploy autonomous AI agents, enterprise RAG knowledge search, and custom copilots that integrate directly into your production databases and workflows.\n\n" +
      "What is your primary AI objective?",
    footer: "Production-Grade AI Systems",
    buttons: ["Workflow Automation", "Custom AI Copilot", "RAG Knowledge Base"],
  },
  {
    name: "cloud_devops_start",
    header: "Cloud & DevOps Architecture",
    body:
      "We design scalable multi-cloud infrastructure, Kubernetes orchestration, CI/CD automation pipelines, and Terraform IaC to ensure high availability and zero-downtime deployments.\n\n" +
      "What is your current infrastructure priority?",
    footer: "AWS, GCP & Azure Multi-Cloud",
    buttons: ["Cloud Migration", "Kubernetes & CI/CD", "Infrastructure IaC"],
  },
  {
    name: "incident_response_start",
    header: "Emergency Incident Triage",
    body:
      "Our on-call incident response team is standing by to assist with active outages, data breaches, or suspicious infrastructure activity.\n\n" +
      "• *Direct Hotline:* +92 335 6701199\n" +
      "• Please reply with affected endpoints or symptoms.",
    footer: "24/7 Rapid Emergency Response",
    buttons: ["System Outage", "Security Breach", "Speak with Lead"],
  },
  {
    name: "details_needed",
    header: "Technical Discovery Intake",
    body:
      "To prepare an accurate technical scope and proposal, please share:\n\n" +
      "1. *Organization* — Company name and primary website\n" +
      "2. *Contact* — Your full name and role\n" +
      "3. *Objective* — What you want to build, upgrade, or defend\n\n" +
      "A brief text or voice note is welcome.",
    footer: "Tauqeer Mustafa Inc",
    buttons: ["Sending Details", "Request Voice Call", "Technical Sync"],
  },
  {
    name: "arrange_call",
    header: "Technical Discovery Call",
    body:
      "We would be glad to schedule an architecture sync with our technical leadership.\n\n" +
      "Please share your direct phone number and two preferred time windows (Monday to Saturday, 09:00 to 18:00 PKT). We will confirm your calendar invite.",
    footer: "Principal Engineer Consultation",
    buttons: ["Send Call Times", "Call Me Direct", "Continue on Chat"],
  },
  {
    name: "proposal_sent",
    header: "Engineering Proposal Delivered",
    body:
      "The formal engineering proposal for *[SCOPE]* has been dispatched to [EMAIL].\n\n" +
      "It outlines technical architecture, milestones, deliverables schedule, and a transparent fixed price.\n\n" +
      "Our team is available to walk through any architectural questions with you.",
    footer: "Fixed-Scope Engineering Agreement",
    buttons: ["Review Proposal", "Schedule Review", "Approved to Start"],
  },
  {
    name: "invoice_due",
    header: "Milestone Invoice",
    body:
      "Invoice *[NUMBER]* for *[MILESTONE]* is now due for settlement on *[DATE]*.\n\n" +
      "Banking details and wire instructions are attached to the invoice sent to [EMAIL].\n\n" +
      "For billing questions or corporate vendor onboarding, reply directly to this thread.",
    footer: "Finance & Accounts Desk",
    buttons: ["Payment Dispatched", "Resend Invoice", "Billing Query"],
  },
  {
    name: "work_complete",
    header: "Milestone Complete & Handed Over",
    body:
      "Deployment of *[SCOPE]* is successfully completed and operational in production.\n\n" +
      "Delivered artifacts: [DELIVERABLES].\n\n" +
      "Includes 30 days of complimentary hypercare and deployment support.",
    footer: "Production Deployment Verified",
    buttons: ["Verify & Sign Off", "Request Hypercare", "Technical Question"],
  },
  {
    name: "careers_reply",
    header: "Engineering Careers at TMI",
    body:
      "We are actively recruiting exceptional software engineers, security researchers, and systems architects.\n\n" +
      "To apply, please submit:\n" +
      "1. Your CV / resume (PDF)\n" +
      "2. GitHub profile or portfolio link\n" +
      "3. Summary of a complex system you engineered\n\n" +
      "Our engineering leads review every submission.",
    footer: "tauqeermustafa.tech/careers",
    buttons: ["Sending Resume", "View Open Roles", "Speak with Lead"],
  },
  {
    name: "not_a_fit",
    header: "Project Evaluation",
    body:
      "Thank you for sharing your project specifications. After technical review, we have concluded this specific engagement is outside our core architectural focus: [REASON].\n\n" +
      "We prioritize taking on only work where we can guarantee world-class execution.\n\n" +
      "If you would like a vetted industry referral, let us know and we will be happy to connect you.",
    footer: "Engineering Standards First",
    buttons: ["Request Referral", "Different Scope", "Understood"],
  },
];
