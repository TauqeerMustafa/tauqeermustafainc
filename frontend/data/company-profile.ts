import { company } from "./company";
import { ALL_DOCS } from "./docs-registry";

export interface ProfileSlide {
  id: number;
  slideNumber: string;
  category: string;
  title: string;
  subtitle: string;
  bullets: string[];
  keyHighlights: { label: string; value: string }[];
  accentColor?: string;
}

export interface CompanyMetric {
  label: string;
  value: string;
  description: string;
}

export interface OutreachTemplate {
  id: string;
  title: string;
  channel: "whatsapp" | "email" | "proposal" | "linkedin";
  purpose: string;
  subject?: string;
  body: string;
  variables: string[];
}

export interface ClientSourceItem {
  id: string;
  title: string;
  category: "entity" | "communication" | "security" | "legal" | "technical" | "social";
  description: string;
  link?: string;
  displayValue?: string;
  verified: boolean;
  actionLabel?: string;
}

export const companyMetrics: CompanyMetric[] = [
  {
    label: "Delivery Uptime & SLA",
    value: "99.98%",
    description: "Enterprise system reliability across production deployments",
  },
  {
    label: "Engagements Delivered",
    value: "45+",
    description: "Full-cycle digital platforms, security audits, and cloud infrastructures",
  },
  {
    label: "Average Project Sprint",
    value: "8-16 Wks",
    description: "From architecture discovery to hardened production launch",
  },
  {
    label: "Client Satisfaction",
    value: "100%",
    description: "Direct founder-led technical governance and transparent delivery",
  },
  {
    label: "Global Reach",
    value: "UK & Global",
    description: "Headquartered in London/Harrow, UK with regional engineering offices",
  },
  {
    label: "Security Hardened",
    value: "Zero-Trust",
    description: "OWASP Top 10, ISO 27001 aligned practices, TLS 1.3, strict RBAC",
  },
];

export const profileSlides: ProfileSlide[] = [
  {
    id: 1,
    slideNumber: "01",
    category: "Executive Title",
    title: "Tauqeer Mustafa Inc.",
    subtitle: "Engineering that ships. Security that holds.",
    bullets: [
      "High-assurance digital platforms, cybersecurity consulting, AI workflows, and cloud engineering.",
      "Direct technical leadership — no junior handoffs or account manager buffers.",
      "Headquartered in London (Harrow), UK with regional engineering operations in Islamabad.",
      "Empowering startups, scaling SaaS, and enterprises to build mission-critical systems.",
    ],
    keyHighlights: [
      { label: "Entity", value: "Tauqeer Mustafa Inc." },
      { label: "Founded", value: "2023" },
      { label: "HQ", value: "London / Harrow, UK" },
      { label: "Website", value: "tauqeermustafa.tech" },
    ],
  },
  {
    id: 2,
    slideNumber: "02",
    category: "About & Mission",
    title: "Who We Are & Why We Exist",
    subtitle: "Bridging the gap between engineering velocity and uncompromising security.",
    bullets: [
      "Most digital agencies decouple development from security — leading to fragile code and costly late audits.",
      "TMI operates as one unified discipline: full-stack engineering with built-in adversarial threat modeling.",
      "We build resilient systems designed to handle real operational traffic, compliance mandates, and high concurrency.",
      "Focused on long-term maintainability with comprehensive documentation and knowledge transfer.",
    ],
    keyHighlights: [
      { label: "Core Model", value: "Unified DevSecOps" },
      { label: "Engagement", value: "8 - 16 Week Sprints" },
      { label: "Lead", value: "Founder Direct" },
      { label: "Standard", value: "Production-Grade" },
    ],
  },
  {
    id: 3,
    slideNumber: "03",
    category: "Core Disciplines",
    title: "Our 5 Specialized Pillars",
    subtitle: "Integrated technical capabilities delivered by a seasoned engineering team.",
    bullets: [
      "1. Web Platforms & SaaS: Modern Next.js, React, Node.js, and high-throughput API architectures.",
      "2. Cybersecurity & Auditing: Penetration testing, vulnerability assessments, DevSecOps pipelines, and threat modeling.",
      "3. AI Automation & Workflows: Custom LLM integrations, RAG systems, data automation, and agentic workflows.",
      "4. Cloud Infrastructure: Kubernetes, Docker, AWS/GCP, multi-region high availability, and database scaling.",
      "5. Product Design & Systems: Enterprise design systems, WCAG 2.1 AA accessibility, and intuitive UI/UX.",
    ],
    keyHighlights: [
      { label: "Web", value: "Next.js / TypeScript" },
      { label: "Security", value: "OWASP & Pen Testing" },
      { label: "AI", value: "RAG & Automation" },
      { label: "Cloud", value: "AWS / Docker / K8s" },
    ],
  },
  {
    id: 4,
    slideNumber: "04",
    category: "Engineering Standards",
    title: "Security & Quality Assurance",
    subtitle: "Zero-trust architecture embedded directly into every line of code.",
    bullets: [
      "Secure by Default: Strict input validation, parameterized queries, CSRF & XSS protection, and CSP headers.",
      "Granular RBAC: Role-based and permission-based access control models with auditable access logs.",
      "Data Protection: End-to-end encryption, TLS 1.3 in transit, AES-256 at rest, and international GDPR/CCPA alignment.",
      "Automated CI/CD: Automated linting, type-checking, unit test coverage, and automated container scanning.",
    ],
    keyHighlights: [
      { label: "Encryption", value: "AES-256 / TLS 1.3" },
      { label: "Access Model", value: "Least-Privilege RBAC" },
      { label: "Compliance", value: "GDPR / CCPA / DPA" },
      { label: "Audit Trail", value: "Immutable Logging" },
    ],
  },
  {
    id: 5,
    slideNumber: "05",
    category: "Tech Stack",
    title: "Modern Technical Stack",
    subtitle: "Battle-tested, maintainable, and high-performance technologies.",
    bullets: [
      "Frontend: Next.js 15+, React 19, TypeScript, Tailwind CSS, Framer Motion, Radix/Base UI.",
      "Backend & APIs: Node.js, Express, Python/FastAPI, REST & GraphQL, WebSockets, Supabase.",
      "Databases & Caching: PostgreSQL, Redis, Upstash, Prisma/Drizzle ORM with connection pooling.",
      "Payments & Billing: Paddle Node SDK, Stripe Integration, Multi-currency checkout, Webhook reconciliation.",
      "DevOps & Hosting: Docker, Kubernetes, Vercel, Render, Railway, AWS ECS/S3, Cloudflare.",
    ],
    keyHighlights: [
      { label: "Stack", value: "Next.js / TypeScript / Node" },
      { label: "Databases", value: "PostgreSQL & Redis" },
      { label: "Payments", value: "Paddle & Stripe Verified" },
      { label: "Cloud", value: "Multi-Cloud / Edge" },
    ],
  },
  {
    id: 6,
    slideNumber: "06",
    category: "Operating Model",
    title: "How We Deliver",
    subtitle: "Disciplined 4-phase delivery methodology with complete milestone transparency.",
    bullets: [
      "Phase 1 - Technical Discovery: Architecture audits, threat modeling, dependency mapping, and detailed SOW.",
      "Phase 2 - Iterative Sprint Delivery: Bi-weekly shippable releases, staging environments, and live demo milestones.",
      "Phase 3 - Security Hardening & QA: Penetration tests, load simulation, security review, and cross-browser QA.",
      "Phase 4 - Production Launch & Handover: Zero-downtime deployment, telemetry monitoring, docs, and staff training.",
    ],
    keyHighlights: [
      { label: "Sprints", value: "Bi-Weekly Deliveries" },
      { label: "Visibility", value: "Live Staging Portals" },
      { label: "Testing", value: "Automated & Penetration" },
      { label: "Handover", value: "100% IP & Documentation" },
    ],
  },
  {
    id: 7,
    slideNumber: "07",
    category: "Case Studies",
    title: "Proven Track Record",
    subtitle: "Delivering tangible business outcomes across demanding domains.",
    bullets: [
      "FinTech & Billing: Integrated enterprise multi-currency Paddle & Stripe checkout with webhook failover and ledger sync.",
      "Corporate Operations Portal: Custom internal ERP & HR suite with automated attendance, multi-role RBAC, and payroll tracking.",
      "High-Traffic SaaS Platform: Scaled Next.js and PostgreSQL architecture handling sub-100ms response times globally.",
      "Cybersecurity Hardening: Performed full-spectrum security assessment and remediation for international clients.",
    ],
    keyHighlights: [
      { label: "Billing", value: "Paddle / Stripe Webhooks" },
      { label: "Latency", value: "< 100ms Response Time" },
      { label: "Security", value: "Zero Vulnerability Ships" },
      { label: "Uptime", value: "99.98% Maintained" },
    ],
  },
  {
    id: 8,
    slideNumber: "08",
    category: "Global Presence",
    title: "Offices & Worldwide Operations",
    subtitle: "UK registered head office with distributed global delivery capability.",
    bullets: [
      "UK Head Office: TMHQ, 6 Milton Rd, Harrow HA1 1XX, United Kingdom.",
      "Regional Engineering Office: TMRQ, Iqbal Town, Islamabad, Pakistan.",
      "Timezone Flexibility: Covering GMT, EST, CET, and PKT business hours for seamless real-time collaboration.",
      "Compliance & Treasury: Multi-currency billing in USD, GBP, EUR, and PKR with formal invoicing and contracts.",
    ],
    keyHighlights: [
      { label: "UK Head Office", value: "Harrow, London" },
      { label: "Regional Office", value: "Islamabad, PK" },
      { label: "Timezones", value: "UK, US & EU Coverage" },
      { label: "Currencies", value: "USD, GBP, EUR, PKR" },
    ],
  },
  {
    id: 9,
    slideNumber: "09",
    category: "Governance & Trust",
    title: "Legal, Security & Compliance",
    subtitle: "Enterprise-grade governance framework protecting client data and IP.",
    bullets: [
      "Intellectual Property: Full 100% IP transfer upon milestone settlement — no vendor lock-in or proprietary traps.",
      "Non-Disclosure Agreements (NDA): Mutual NDAs executed prior to any proprietary architecture sharing.",
      "Service Level Agreements (SLA): Guaranteed uptime, emergency incident response SLAs, and dedicated support desk.",
      "Privacy Standards: Full GDPR (EU/UK), CCPA (US), and PDPA data processing agreements available.",
    ],
    keyHighlights: [
      { label: "IP Rights", value: "100% Client Owned" },
      { label: "NDA", value: "Mutual Non-Disclosure" },
      { label: "SLA", value: "Guaranteed Response" },
      { label: "Privacy", value: "GDPR / CCPA / DPA" },
    ],
  },
  {
    id: 10,
    slideNumber: "10",
    category: "Engagement & Contact",
    title: "Let's Build Together",
    subtitle: "Direct technical consultations with our leadership team.",
    bullets: [
      "Website: https://tauqeermustafa.tech",
      "Direct Sales & Proposal Inquiries: sales@tauqeermustafa.tech / contact@tauqeermustafa.tech",
      "WhatsApp Sales Channel: +92 333 56701199 (Direct WhatsApp Chat)",
      "24/7 Client Technical Support: support@tauqeermustafa.tech / wa.me/message/TJILSTIMLJHVK1",
      "Founder GitHub: github.com/tauqeermustafa | LinkedIn: linkedin.com/in/tauqeermustafa",
    ],
    keyHighlights: [
      { label: "General Email", value: "info@tauqeermustafa.tech" },
      { label: "Sales Email", value: "sales@tauqeermustafa.tech" },
      { label: "WhatsApp", value: "+92 333 56701199" },
      { label: "Support", value: "24/7 Live Desk" },
    ],
  },
];

export const clientSources: ClientSourceItem[] = [
  // Corporate & Entity
  {
    id: "src-uk-hq",
    title: "UK Head Office Location",
    category: "entity",
    description: "TMHQ, 6 Milton Rd, Harrow HA1 1XX, United Kingdom",
    displayValue: "Harrow, London, United Kingdom",
    link: company.offices[0].mapEmbedUrl,
    verified: true,
    actionLabel: "View on Google Maps",
  },
  {
    id: "src-pk-hq",
    title: "Regional Engineering Office",
    category: "entity",
    description: "TMRQ Flat No 02-A A Block, Awais Appartment, Iqbal Town, Islamabad, Pakistan",
    displayValue: "Islamabad, Pakistan",
    link: company.offices[1].mapEmbedUrl,
    verified: true,
    actionLabel: "View on Google Maps",
  },
  {
    id: "src-official-domain",
    title: "Official Web Domain",
    category: "entity",
    description: "Verified primary domain with TLS 1.3 security and DNSSEC",
    displayValue: "https://tauqeermustafa.tech",
    link: "https://tauqeermustafa.tech",
    verified: true,
    actionLabel: "Visit Website",
  },
  // Communication
  {
    id: "src-sales-wa",
    title: "Sales & Inquiries WhatsApp",
    category: "communication",
    description: "Direct line for commercial proposals, service scopes, and contract inquiries",
    displayValue: company.whatsappChannels.general.displayNumber,
    link: company.whatsappChannels.general.url,
    verified: true,
    actionLabel: "Open WhatsApp Chat",
  },
  {
    id: "src-support-wa",
    title: "24/7 Client Support WhatsApp",
    category: "communication",
    description: "Dedicated live desk for ongoing client SLA escalations and production support",
    displayValue: company.whatsappChannels.support.displayNumber,
    link: `https://${company.whatsappChannels.support.url}`,
    verified: true,
    actionLabel: "Contact Support Desk",
  },
  {
    id: "src-sales-email",
    title: "Commercial & Sales Email",
    category: "communication",
    description: "Direct email for RFPs, statements of work, and discovery calls",
    displayValue: company.emails.sales,
    link: `mailto:${company.emails.sales}`,
    verified: true,
    actionLabel: "Send Sales Email",
  },
  {
    id: "src-contact-email",
    title: "General Contact Email",
    category: "communication",
    description: "Official desk for corporate correspondence and partnerships",
    displayValue: company.emails.contact,
    link: `mailto:${company.emails.contact}`,
    verified: true,
    actionLabel: "Send Email",
  },
  // Security & Compliance
  {
    id: "src-security-policy",
    title: "Information Security Policy",
    category: "security",
    description: "Comprehensive security posture, zero-trust controls, and data protection rules",
    displayValue: "Security Architecture & Controls",
    link: "/documents/security-policy",
    verified: true,
    actionLabel: "Read Policy",
  },
  {
    id: "src-responsible-disclosure",
    title: "Responsible Vulnerability Disclosure",
    category: "security",
    description: "Vulnerability reporting program and security contact SLA",
    displayValue: "security@tauqeermustafa.tech",
    link: "/documents/responsible-disclosure",
    verified: true,
    actionLabel: "View Disclosure Terms",
  },
  {
    id: "src-gdpr",
    title: "GDPR / UK Data Protection Compliance",
    category: "security",
    description: "Data processing, subject access rights, and transfer compliance",
    displayValue: "GDPR Statement",
    link: "/documents/gdpr",
    verified: true,
    actionLabel: "View GDPR Terms",
  },
  {
    id: "src-ccpa",
    title: "CCPA Privacy Notice (US Clients)",
    category: "security",
    description: "California Consumer Privacy Act notices and data opt-out governance",
    displayValue: "CCPA Notice",
    link: "/documents/ccpa",
    verified: true,
    actionLabel: "View CCPA Terms",
  },
  // Legal
  {
    id: "src-nda",
    title: "Standard Mutual NDA Terms",
    category: "legal",
    description: "Bilateral non-disclosure terms protecting proprietary information",
    displayValue: "Mutual Non-Disclosure Agreement",
    link: "/documents/nda",
    verified: true,
    actionLabel: "View NDA Terms",
  },
  {
    id: "src-sla",
    title: "Service Level Agreement (SLA)",
    category: "legal",
    description: "System availability commitments, response times, and remedy guarantees",
    displayValue: "SLA Guarantees",
    link: "/documents/sla",
    verified: true,
    actionLabel: "View SLA",
  },
  {
    id: "src-payment-policy",
    title: "Commercial & Payment Terms",
    category: "legal",
    description: "Milestone schedule, invoice currencies, and escrow handling",
    displayValue: "Payment & Milestone Policy",
    link: "/documents/payment-policy",
    verified: true,
    actionLabel: "View Payment Policy",
  },
  // Social & Verification
  {
    id: "src-github",
    title: "Engineering Portfolio & Open Source",
    category: "social",
    description: "Verified GitHub repositories, code examples, and technical work",
    displayValue: "github.com/tauqeermustafa",
    link: company.social.github,
    verified: true,
    actionLabel: "View GitHub",
  },
  {
    id: "src-linkedin",
    title: "LinkedIn Executive Profile",
    category: "social",
    description: "Official executive presence and corporate updates",
    displayValue: "linkedin.com/in/tauqeermustafa",
    link: company.social.linkedin,
    verified: true,
    actionLabel: "View LinkedIn",
  },
];

export const outreachTemplates: OutreachTemplate[] = [
  {
    id: "tmpl-wa-intro",
    title: "WhatsApp Quick Introduction & Deck",
    channel: "whatsapp",
    purpose: "Send to warm prospects or incoming WhatsApp inquiries with instant deck link.",
    body: `Hi [ClientName],

Thanks for reaching out to Tauqeer Mustafa Inc. (TMI).

We are a UK-headquartered digital engineering agency specializing in:
✓ High-performance Web Platforms & SaaS (Next.js/React/Node)
✓ Cybersecurity Audits & Penetration Testing (OWASP / Zero-Trust)
✓ AI Automation & Custom Workflows (LLM / RAG)
✓ Cloud Architecture & DevOps (Docker / K8s / AWS)

You can explore our interactive Company Profile and download our official Pitch Deck here:
👉 https://tauqeermustafa.tech/company-profile

Would you be open for a brief 15-minute technical discovery call this week to review your project constraints?

Best regards,
[EmployeeName]
Tauqeer Mustafa Inc. | https://tauqeermustafa.tech`,
    variables: ["[ClientName]", "[EmployeeName]"],
  },
  {
    id: "tmpl-email-proposal-intro",
    title: "Email: Formal Executive Introduction & Company Profile",
    channel: "email",
    purpose: "Formal introductory email to CTOs, VPs of Engineering, and Founders with profile PDF/PPTX attached.",
    subject: "Introduction: Engineering & Security Partnership with Tauqeer Mustafa Inc. (TMI)",
    body: `Dear [ClientName],

I hope this email finds you well.

I am writing from Tauqeer Mustafa Inc. (TMI), a UK-registered digital engineering agency (HQ London / Harrow). We partner with high-growth companies, startups, and enterprises that require systems built to handle real operational pressure without security tradeoffs.

Our core disciplines include:
1. Web Engineering & SaaS Systems: Modern Next.js/TypeScript architectures engineered for sub-100ms response times.
2. Cybersecurity & DevSecOps: Proactive penetration testing, vulnerability audits, and ISO 27001-aligned security defaults.
3. AI & Automation Workflows: Custom LLM systems, RAG search pipelines, and automated business logic.
4. Cloud Infrastructure: Resilient multi-cloud deployments with 99.98% SLA guarantees.

Unlike traditional agencies with bloated account management layers, our clients work directly with senior engineers led by our founder, ensuring zero scope drift and rapid delivery sprints (8-16 weeks).

Attached please find our official Company Profile & Pitch Deck. You may also review our live interactive profile here:
https://tauqeermustafa.tech/company-profile

Could we schedule a short 15-minute diagnostic call on [SuggestedDate] to discuss your roadmap?

Sincerely,

[EmployeeName]
Technical Partnerships Lead
Tauqeer Mustafa Inc.
Website: https://tauqeermustafa.tech
Direct Sales: sales@tauqeermustafa.tech
WhatsApp: +92 333 56701199`,
    variables: ["[ClientName]", "[EmployeeName]", "[SuggestedDate]"],
  },
  {
    id: "tmpl-security-posture",
    title: "Security & Compliance Assurance Snippet",
    channel: "proposal",
    purpose: "Send to enterprise clients requesting security, NDA, or compliance verification during procurement.",
    body: `Tauqeer Mustafa Inc. — Security & Compliance Profile Summary

• Head Office: TMHQ, 6 Milton Rd, Harrow HA1 1XX, United Kingdom
• Security Philosophy: Zero-Trust by default; OWASP Top 10 mitigation embedded in development sprints.
• Data Protection: TLS 1.3 encryption in transit; AES-256 at rest; strict RBAC and least-privilege policies.
• Legal & Governance:
  - Mutual NDA: https://tauqeermustafa.tech/documents/nda
  - Privacy & GDPR: https://tauqeermustafa.tech/documents/gdpr
  - Information Security Policy: https://tauqeermustafa.tech/documents/security-policy
  - SLA Commitments: https://tauqeermustafa.tech/documents/sla
• IP Ownership: 100% intellectual property transfer upon milestone completion with zero vendor lock-in.
• Support SLA: 24/7 dedicated escalation desk with guaranteed response times.`,
    variables: [],
  },
  {
    id: "tmpl-linkedin-outreach",
    title: "LinkedIn Executive Message",
    channel: "linkedin",
    purpose: "Direct LinkedIn outreach to technical decision-makers.",
    body: `Hi [ClientName],

Noticed your team at [CompanyName] is scaling your digital platforms. 

At Tauqeer Mustafa Inc. (TMI), we help fast-growing teams ship secure, production-grade web platforms, cloud infrastructure, and AI workflows without the usual agency bloat or handoff friction.

We work directly with engineering leaders from architecture discovery through launch. You can check out our interactive company profile and pitch deck here: https://tauqeermustafa.tech/company-profile

Would you be open to a brief chat sometime next week to compare notes on what you're building?

Best,
[EmployeeName]`,
    variables: ["[ClientName]", "[CompanyName]", "[EmployeeName]"],
  },
];

export const downloadableCollateral = [
  {
    id: "collat-pptx-deck",
    title: "Official Pitch & Capabilities Deck",
    format: "PPTX",
    extension: ".pptx",
    fileSize: "~1.2 MB",
    description: "Editable 10-slide PowerPoint presentation with full corporate branding, services matrix, architecture, and case studies.",
    type: "pptx",
    badge: "Most Popular",
  },
  {
    id: "collat-pdf-profile",
    title: "Complete Company Profile Document",
    format: "PDF",
    extension: ".pdf",
    fileSize: "~850 KB",
    description: "Multi-page formal corporate overview document ready for printing or attaching to formal RFPs and enterprise bids.",
    type: "pdf",
    badge: "Official",
  },
  {
    id: "collat-pdf-onepager",
    title: "Executive One-Pager Summary",
    format: "PDF",
    extension: ".pdf",
    fileSize: "~420 KB",
    description: "High-impact single page executive brief highlighting key metrics, pillars, credentials, and contact channels.",
    type: "onepager",
    badge: "Quick Read",
  },
  {
    id: "collat-docx-proposal",
    title: "Word / DOCX Proposal & Statement of Work",
    format: "DOCX",
    extension: ".docx",
    fileSize: "~280 KB",
    description: "Formatted Word document template containing company profile, standard scope structure, and terms.",
    type: "docx",
    badge: "Editable",
  },
  {
    id: "collat-brand-kit",
    title: "Brand & Press Media Kit",
    format: "ZIP",
    extension: ".zip",
    fileSize: "~2.4 MB",
    description: "Vector SVG & PNG high-resolution logo files (Dark & Light), color palette codes, founder portrait, and brand specs.",
    type: "brandkit",
    badge: "Media Assets",
  },
  {
    id: "collat-vcard",
    title: "Corporate Digital Contact Card",
    format: "VCF",
    extension: ".vcf",
    fileSize: "~5 KB",
    description: "1-click digital contact file importing verified TMI corporate phone, email, WhatsApp, and office address into any device.",
    type: "vcard",
    badge: "1-Click Contact",
  },
];
