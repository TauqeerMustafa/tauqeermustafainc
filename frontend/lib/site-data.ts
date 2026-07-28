export const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

export const footerLinks = {
  services: [
    { name: "Enterprise Web Development", href: "/services/enterprise-web-development" },
    { name: "Cybersecurity", href: "/services/cybersecurity" },
    { name: "AI Solutions", href: "/services/ai-solutions" },
    { name: "Cloud Engineering", href: "/services/cloud-engineering" },
    { name: "UI/UX & Product Design", href: "/services/ui-ux-product-design" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

export const services = [
  {
    slug: "enterprise-web-development",
    title: "Enterprise Web Development",
    shortDescription:
      "Secure web platforms, portals, dashboards, and product systems built for scale.",
    description:
      "We design and build maintainable enterprise web applications with clear architecture, reliable delivery practices, and performance-minded implementation. Every engagement starts with the business workflow, not the framework, so the systems we ship stay easy to operate long after launch.",
    outcomes: [
      "Application architecture and technical planning",
      "Customer and internal portals",
      "Dashboards and operational reporting",
      "Performance optimization and Core Web Vitals",
      "API design and third-party integrations",
      "Post-launch maintenance and support",
    ],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    shortDescription:
      "Security reviews, hardening, and governance support for digital operations.",
    description:
      "We help teams identify risk, improve secure defaults, and build practical remediation plans that align engineering effort with business exposure. Our approach favors clear, prioritized action over generic checklists so security work fits inside real delivery timelines.",
    outcomes: [
      "Security posture reviews and audits",
      "Vulnerability assessment and prioritization",
      "Access control and identity governance",
      "Secure application development practices",
      "Incident response and readiness planning",
      "Operational risk reporting for leadership",
    ],
  },
  {
    slug: "ai-solutions",
    title: "AI Solutions",
    shortDescription:
      "Internal copilots, automation workflows, and data-enabled tools for operations.",
    description:
      "We create practical AI systems that reduce repetitive work, improve response quality, and give teams better visibility into operational decisions. Every rollout includes human review checkpoints and measurable success criteria, so automation earns trust instead of just adding complexity.",
    outcomes: [
      "Workflow automation and process design",
      "Internal assistant and copilot design",
      "Document and data summarization",
      "Retrieval-augmented knowledge systems",
      "Model evaluation and quality monitoring",
      "Responsible rollout and governance planning",
    ],
  },
  {
    slug: "cloud-engineering",
    title: "Cloud Engineering",
    shortDescription:
      "Cloud infrastructure, CI/CD pipelines, and reliable deployment systems for growing teams.",
    description:
      "We design cloud infrastructure that scales predictably and fails gracefully. From containerized deployments to automated pipelines and observability, we build the operational backbone that keeps applications reliable as usage grows.",
    outcomes: [
      "Cloud architecture on AWS, Azure, or GCP",
      "CI/CD pipeline design and automation",
      "Containerization and orchestration",
      "Infrastructure as code",
      "Monitoring, logging, and alerting",
      "Cost optimization and capacity planning",
    ],
  },
  {
    slug: "ui-ux-product-design",
    title: "UI/UX & Product Design",
    shortDescription:
      "Research-informed interface design that turns complex workflows into clear digital products.",
    description:
      "We design interfaces that hold up under real operational use, not just first impressions. From information architecture to interaction detail, our design process stays grounded in the workflows people actually rely on every day.",
    outcomes: [
      "User research and journey mapping",
      "Information architecture and wireframing",
      "Design systems and component libraries",
      "High-fidelity interface design",
      "Usability testing and iteration",
      "Design-to-development handoff",
    ],
  },
];

export const projects = [
  {
    slug: "enterprise-operations-portal",
    title: "Secure Operations Portal for a Financial Services Firm",
    category: "Web Platform",
    summary:
      "A secure role-based portal for leadership dashboards, internal workflows, and operational reporting.",
    impact: "Reduced manual reporting cycles and improved executive visibility.",
    technologies: ["Next.js", "FastAPI", "PostgreSQL", "Role-based access", "Docker"],
    gallery: ["Operations dashboard", "Workflow queue", "Executive reporting", "Access control panel"],
  },
  {
    slug: "security-compliance-dashboard",
    title: "Security Compliance Dashboard",
    category: "Cybersecurity",
    summary:
      "A centralized risk tracking interface for vulnerability evidence, remediation ownership, and audit readiness.",
    impact: "Improved remediation prioritization across distributed teams.",
    technologies: ["Risk scoring", "Evidence tracking", "PostgreSQL", "Audit views", "SSO"],
    gallery: ["Risk register", "Control evidence", "Remediation timeline", "Audit export view"],
  },
  {
    slug: "ai-workflow-assistant",
    title: "AI Workflow Assistant",
    category: "AI Automation",
    summary:
      "An internal assistant that routes requests, drafts operational responses, and summarizes business data.",
    impact: "Shortened repetitive task handling for customer-facing teams.",
    technologies: ["LLM workflows", "Knowledge retrieval", "Approval flows", "Analytics", "Next.js"],
    gallery: ["Request triage", "Draft workspace", "Performance summary", "Knowledge base search"],
  },
  {
    slug: "healthcare-patient-scheduling-platform",
    title: "Patient Scheduling Platform for a Multi-Clinic Healthcare Group",
    category: "Web Platform",
    summary:
      "A HIPAA-conscious scheduling and intake system connecting front-desk staff, clinicians, and patients across multiple locations.",
    impact: "Cut double-bookings and reduced front-desk call volume during peak hours.",
    technologies: ["Next.js", "PostgreSQL", "Role-based access", "Calendar sync", "Notifications"],
    gallery: ["Multi-location calendar", "Patient intake flow", "Clinician view", "Admin reporting"],
  },
  {
    slug: "cloud-cost-observability-suite",
    title: "Cloud Cost & Reliability Observability Suite",
    category: "Cloud Engineering",
    summary:
      "A monitoring and cost-attribution suite giving engineering leadership a real-time view of infrastructure spend and service health.",
    impact: "Identified and eliminated recurring infrastructure waste within the first quarter.",
    technologies: ["AWS", "Terraform", "Grafana", "CI/CD", "Cost allocation tagging"],
    gallery: ["Spend attribution view", "Service health map", "Alerting rules", "Capacity forecast"],
  },
];

export const posts = [
  {
    slug: "planning-secure-web-platforms",
    title: "How Enterprise Teams Should Plan Secure Web Platforms",
    category: "Engineering",
    date: "July 3, 2026",
    excerpt:
      "A practical framework for aligning architecture, access control, performance, and long-term maintainability before development begins.",
    body: [
      "Secure web platforms start with clear ownership, explicit access rules, and a realistic view of how the system will be operated after launch.",
      "Teams should define data boundaries, deployment expectations, monitoring needs, and security review checkpoints before implementation begins.",
      "Architecture decisions made early, such as how services communicate and where authentication lives, are far cheaper to get right than to retrofit once a platform is in production.",
      "Performance planning belongs in the same conversation as security planning. Caching strategy, database indexing, and API contracts all shape how a system behaves under real load, not just in a demo environment.",
      "The strongest plans connect technical constraints to business outcomes so every delivery decision has a clear reason, and every stakeholder understands the tradeoffs being made on their behalf.",
    ],
  },
  {
    slug: "ai-automation-that-improves-operations",
    title: "AI Automation That Actually Improves Operations",
    category: "Automation",
    date: "June 21, 2026",
    excerpt:
      "What to automate first, how to measure value, and why responsible rollout matters for internal AI systems.",
    body: [
      "Useful automation starts with repetitive, measurable workflows where quality can be evaluated consistently.",
      "The first release should include human review, clear fallback paths, and reporting that shows whether the workflow is saving time.",
      "Teams that succeed with internal AI systems tend to start narrow: one workflow, one team, one clear metric, rather than a broad rollout across the whole organization at once.",
      "Measuring value means tracking more than adoption. Response accuracy, escalation rate, and time saved per task tell a more honest story than usage counts alone.",
      "Responsible rollout keeps teams confident because they can inspect, adjust, and improve the system over time, instead of treating automation as a black box they have to trust blindly.",
    ],
  },
  {
    slug: "monthly-security-signals",
    title: "Security Signals Leaders Should Watch Every Month",
    category: "Cybersecurity",
    date: "June 7, 2026",
    excerpt:
      "A concise operating view of vulnerabilities, access exposure, remediation aging, and incident readiness.",
    body: [
      "Security leaders need a monthly operating view that highlights risk movement rather than isolated technical findings.",
      "Useful signals include remediation age, access exceptions, control evidence gaps, and repeated issue categories.",
      "Tracking remediation age specifically, how long a known issue has stayed open, tends to reveal process problems that a raw vulnerability count never shows.",
      "Access exceptions deserve their own review line. Temporary access that becomes permanent is one of the most common sources of unnecessary exposure in growing organizations.",
      "When these signals are reviewed consistently, security work becomes easier to prioritize and explain, and it stops feeling like a separate function bolted onto engineering.",
    ],
  },
  {
    slug: "choosing-a-cloud-architecture-that-scales",
    title: "Choosing a Cloud Architecture That Scales With the Business, Not Against It",
    category: "Cloud Engineering",
    date: "May 19, 2026",
    excerpt:
      "How to evaluate cloud architecture decisions against real growth patterns instead of hypothetical future scale.",
    body: [
      "Many cloud architecture decisions are made for a scale the business does not have yet, which adds cost and complexity without a matching benefit.",
      "A better starting point is understanding current traffic and data patterns, then designing for the next realistic order of magnitude rather than an unbounded future.",
      "Infrastructure as code and consistent environments matter more early on than exotic scaling patterns, because they reduce operational risk on every single deployment.",
      "Cost visibility should be built in from the start. Teams that only look at cloud spend after it becomes a problem lose the ability to make informed tradeoffs early.",
      "The goal is an architecture that can grow in clear, well-understood steps, with each step justified by actual usage rather than speculation.",
    ],
  },
  {
    slug: "design-systems-that-engineering-teams-actually-use",
    title: "Design Systems That Engineering Teams Actually Use",
    category: "Product Design",
    date: "May 4, 2026",
    excerpt:
      "Why so many design systems stall after launch, and what it takes to keep one alive across product and engineering.",
    body: [
      "A design system fails less often because of bad components and more often because of unclear ownership after the initial launch.",
      "The most durable systems treat design and engineering as co-owners, with a shared process for proposing, reviewing, and retiring components over time.",
      "Documentation matters, but usage examples inside real product code matter more. Teams reach for what is easy to copy correctly, not what is merely well described.",
      "Consistency should be measured, not assumed. Periodic audits of where a design system is and is not being used reveal where the system needs to evolve.",
      "When a design system is treated as a living product with its own roadmap, it keeps pace with the interfaces it is meant to support instead of falling behind them.",
    ],
  },
];

export const jobs = [
  {
    slug: "senior-full-stack-engineer",
    title: "Senior Full-Stack Engineer",
    location: "Remote",
    type: "Full-time",
    summary:
      "Build production web platforms with a focus on maintainability, performance, and enterprise delivery quality.",
    responsibilities: [
      "Design and ship full-stack product features",
      "Collaborate on architecture and implementation plans",
      "Improve reliability, performance, and developer workflow",
      "Review code and mentor other engineers on the team",
      "Participate in client-facing technical discussions",
    ],
  },
  {
    slug: "security-consultant",
    title: "Security Consultant",
    location: "Hybrid",
    type: "Contract",
    summary:
      "Support security reviews, remediation planning, and practical governance for client systems.",
    responsibilities: [
      "Assess application and operational risks",
      "Prepare practical remediation recommendations",
      "Communicate security findings to technical and business teams",
      "Support incident readiness and response planning",
      "Track remediation progress across engagements",
    ],
  },
  {
    slug: "product-delivery-manager",
    title: "Product Delivery Manager",
    location: "Remote",
    type: "Full-time",
    summary:
      "Guide complex digital projects from discovery through launch with clear communication and delivery discipline.",
    responsibilities: [
      "Own milestone planning and delivery coordination",
      "Translate client goals into actionable work",
      "Maintain clear reporting across stakeholders",
      "Identify and manage delivery risks early",
      "Facilitate discovery and scoping sessions with clients",
    ],
  },
  {
    slug: "cloud-devops-engineer",
    title: "Cloud & DevOps Engineer",
    location: "Remote",
    type: "Full-time",
    summary:
      "Design and operate cloud infrastructure, CI/CD pipelines, and observability systems for client platforms.",
    responsibilities: [
      "Build and maintain infrastructure as code",
      "Design CI/CD pipelines for reliable, repeatable releases",
      "Set up monitoring, logging, and alerting",
      "Support cost optimization and capacity planning",
      "Respond to infrastructure incidents and drive postmortems",
    ],
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    location: "Hybrid",
    type: "Full-time",
    summary:
      "Lead research-informed interface design for enterprise portals, dashboards, and internal tools.",
    responsibilities: [
      "Run lightweight user research and synthesis",
      "Design wireframes and high-fidelity interfaces",
      "Maintain and extend shared design system components",
      "Partner closely with engineering on implementation detail",
      "Facilitate usability testing and iterate on findings",
    ],
  },
];
