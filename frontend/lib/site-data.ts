export const navigation = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
];

export const footerLinks = {
  services: [
    { name: "Web Platforms", href: "/services/enterprise-web-development" },
    { name: "Cybersecurity", href: "/services/cybersecurity" },
    { name: "AI Solutions", href: "/services/ai-solutions" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [{ name: "Privacy", href: "/privacy" }, { name: "Terms", href: "/terms" }],
};

export const services = [
  {
    slug: "enterprise-web-development",
    title: "Enterprise Web Development",
    shortDescription:
      "Secure web platforms, portals, dashboards, and product systems built for scale.",
    description:
      "We design and build maintainable enterprise web applications with clear architecture, reliable delivery practices, and performance-minded implementation.",
    outcomes: [
      "Application architecture",
      "Customer and internal portals",
      "Dashboards and reporting",
      "Performance optimization",
    ],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    shortDescription:
      "Security reviews, hardening, and governance support for digital operations.",
    description:
      "We help teams identify risk, improve secure defaults, and build practical remediation plans that align engineering effort with business exposure.",
    outcomes: [
      "Security posture reviews",
      "Vulnerability prioritization",
      "Access control guidance",
      "Operational risk reporting",
    ],
  },
  {
    slug: "ai-solutions",
    title: "AI Solutions",
    shortDescription:
      "Internal copilots, automation workflows, and data-enabled tools for operations.",
    description:
      "We create practical AI systems that reduce repetitive work, improve response quality, and give teams better visibility into operational decisions.",
    outcomes: [
      "Workflow automation",
      "Internal assistant design",
      "Data summarization",
      "Responsible rollout planning",
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
    technologies: ["Next.js", "FastAPI", "PostgreSQL", "Role-based access"],
    gallery: ["Operations dashboard", "Workflow queue", "Executive reporting"],
  },
  {
    slug: "security-compliance-dashboard",
    title: "Security Compliance Dashboard",
    category: "Cybersecurity",
    summary:
      "A centralized risk tracking interface for vulnerability evidence, remediation ownership, and audit readiness.",
    impact: "Improved remediation prioritization across distributed teams.",
    technologies: ["Risk scoring", "Evidence tracking", "PostgreSQL", "Audit views"],
    gallery: ["Risk register", "Control evidence", "Remediation timeline"],
  },
  {
    slug: "ai-workflow-assistant",
    title: "AI Workflow Assistant",
    category: "AI Automation",
    summary:
      "An internal assistant that routes requests, drafts operational responses, and summarizes business data.",
    impact: "Shortened repetitive task handling for customer-facing teams.",
    technologies: ["LLM workflows", "Knowledge retrieval", "Approval flows", "Analytics"],
    gallery: ["Request triage", "Draft workspace", "Performance summary"],
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
      "The strongest plans connect technical constraints to business outcomes so every delivery decision has a clear reason.",
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
      "Responsible rollout keeps teams confident because they can inspect, adjust, and improve the system over time.",
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
      "When these signals are reviewed consistently, security work becomes easier to prioritize and explain.",
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
    ],
  },
];
