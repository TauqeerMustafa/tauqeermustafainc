export interface StoreProduct {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "Web Engineering" | "Cybersecurity" | "Cloud & DevOps" | "AI Automation" | "Developer Tools" | "Compliance & Audit";
  price: number;
  isFree?: boolean;
  icon: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  downloadCount: string;
  version: string;
  lastUpdated: string;
  author: string;
  shortDescription: string;
  longDescription: string;
  architectureHighlights: string[];
  features: string[];
  deliverables: string[];
  techStack: string[];
  screenshots: string[];
  demoUrl?: string;
}

export const DIGITAL_PRODUCTS: StoreProduct[] = [
  {
    id: "QORL-WEB-01",
    slug: "enterprise-fullstack-web-platform",
    title: "Enterprise Full-Stack Web Platform",
    subtitle: "Next.js 16 + React 19 + Asynchronous FastAPI Architecture Starter",
    category: "Web Engineering",
    price: 3500,
    badge: "Bestseller",
    icon: "/jampack/symbol-avatar-14.png",
    rating: 5.0,
    reviewCount: 48,
    downloadCount: "2,410",
    version: "v2.6.0",
    lastUpdated: "October 2026",
    author: "Qorlune LLC",
    shortDescription: "Production-ready, ultra-high-performance web platform engineered with Next.js 16 App Router, React 19, asynchronous Python FastAPI, PostgreSQL, and Redis caching.",
    longDescription: "A turnkey enterprise web platform built for high-scale B2B applications. It features end-to-end type safety, sub-second page transitions, role-based access control (RBAC), Supabase SSR authentication, Stripe & Paddle checkout integrations, dynamic multi-tenant subdomain routing, and automated GitHub Actions CI/CD pipelines.",
    architectureHighlights: [
      "Next.js 16 App Router with React 19 Server Components",
      "Asynchronous Python FastAPI backend with SQLAlchemy 2.0 & Alembic",
      "Redis multi-tier query cache achieving sub-15ms latency",
      "Native multi-tenant subdomain routing proxy (store, billing, client, docs, portals)",
      "Strict Content-Security-Policy (CSP) and zero-leakage token boundary"
    ],
    features: [
      "Full authentication suite (OAuth2, magic links, session tokens, MFA)",
      "Automated Stripe & Paddle billing checkout with webhook verification",
      "Interactive analytics dashboard powered by Recharts & TanStack Table",
      "Multi-container Docker Compose orchestration for local & production deploys",
      "Automated test coverage with Playwright & pytest"
    ],
    deliverables: [
      "Complete Next.js 16 Frontend Source Code (TypeScript)",
      "Production-ready FastAPI Backend Microservice (Python)",
      "Docker Compose & Kubernetes Deployment Manifests",
      "Interactive OpenAPI / Swagger Documentation",
      "Commercial Perpetual Multi-Seat License"
    ],
    techStack: ["Next.js 16", "React 19", "FastAPI", "PostgreSQL", "Redis", "Docker", "Tailwind CSS v4"],
    screenshots: [
      "/jampack/slide1.jpg",
      "/jampack/slide2.jpg",
      "/jampack/slide3.jpg"
    ],
    demoUrl: "https://qorlune.co.uk"
  },
  {
    id: "QORL-SEC-02",
    slug: "cybersecurity-code-audit-playbook",
    title: "Cybersecurity Code Audit & Threat Modeling Playbook",
    subtitle: "Enterprise Vulnerability Assessment & Hardening Framework",
    category: "Cybersecurity",
    price: 1500,
    badge: "Essential",
    icon: "/jampack/symbol-avatar-15.png",
    rating: 4.9,
    reviewCount: 92,
    downloadCount: "5,820",
    version: "v4.1.2",
    lastUpdated: "October 2026",
    author: "Qorlune Security Team",
    shortDescription: "Comprehensive security assessment runbook, automated SAST/DAST scanning scripts, and manual code audit checklist aligned with OWASP Top 10 and NIST CSF 2.0.",
    longDescription: "Field-tested by security consultants across Fortune 500 environments. This playbook guides software teams and auditors through identification of business logic flaws, token leakage, privilege escalation, CORS misconfigurations, and cryptographic weaknesses.",
    architectureHighlights: [
      "Deterministic AST inspection patterns for Python, TypeScript, and Go",
      "Continuous DevSecOps integration scripts for GitHub Actions",
      "Automated token entropy calculation and secret scanner configs",
      "MITRE ATT&CK enterprise tactic cross-mapping matrix"
    ],
    features: [
      "120+ point audit checklist with severity weighting and remediation code snippets",
      "Automated Semgrep and Trivy custom rule packs",
      "Executive summary presentation template (.pptx and Notion format)",
      "Client-ready PDF penetration test report templates",
      "Legal statement of work (SOW) and engagement agreement clauses"
    ],
    deliverables: [
      "Interactive Notion Workspace & Obsidian Vault template",
      "Custom Semgrep & Bandit Security Rule Packs (.yml)",
      "Executive Presentation Deck (.pptx & Figma)",
      "Sample Audit Reports (Clean & Sanitized Case Studies)",
      "One-on-One Security Architecture Review Voucher (30 min)"
    ],
    techStack: ["Python", "OWASP ZAP", "Semgrep", "NIST CSF 2.0", "CIS Controls", "Trivy"],
    screenshots: [
      "/jampack/slide2.jpg",
      "/jampack/slide3.jpg",
      "/jampack/slide4.jpg"
    ]
  },
  {
    id: "QORL-AI-04",
    slug: "autonomous-ai-agent-workflow-orchestrator",
    title: "Autonomous AI Agent Workflow Orchestrator",
    subtitle: "Production Multi-Agent System with Memory & Multi-Provider LLMs",
    category: "AI Automation",
    price: 2200,
    badge: "Trending",
    icon: "/jampack/symbol-avatar-4.png",
    rating: 5.0,
    reviewCount: 114,
    downloadCount: "8,450",
    version: "v3.0.0",
    lastUpdated: "October 2026",
    author: "Qorlune AI Lab",
    shortDescription: "End-to-end multi-agent AI execution engine supporting OpenAI, Anthropic Claude, and Google Gemini with long-term SQLite memory and automated background scheduling.",
    longDescription: "Designed to operate 24/7 autonomous agents without supervision. Implements automatic token cost optimization, exponential fallback retries, dynamic web browsing with Playwright, image and video generation pipelines, and automated social publishing.",
    architectureHighlights: [
      "Unified AI Provider Interface (Gemini 2.5, GPT-4o, Claude 3.5 Sonnet)",
      "Persistent state database with schema migrations and vector similarity",
      "Deterministic JSON schema enforcement with Pydantic validation",
      "Dead-letter queues and circuit breaker patterns for rate limit resilience"
    ],
    features: [
      "Autonomous background scheduler (APScheduler & GitHub Actions cron)",
      "Dynamic browser automation engine powered by Playwright headless shell",
      "Branded infographic card generator and kinetic typography video renderer",
      "Real-time trending news scraper with feedparser and RSS aggregators",
      "Self-healing error recovery with zero crash daemon design"
    ],
    deliverables: [
      "Complete Python 3.11+ Source Code",
      "Pre-configured GitHub Actions 24/7 Cloud Poster Workflow",
      "SQLite State Database schema and migration scripts",
      "Docker container for cloud runner / VPS deployment",
      "Full Architecture & Integration Guide (Markdown & PDF)"
    ],
    techStack: ["Python", "Google GenAI", "OpenAI", "Playwright", "SQLite", "APScheduler"],
    screenshots: [
      "/jampack/slide4.jpg",
      "/jampack/slide1.jpg",
      "/jampack/slide2.jpg"
    ]
  },
  {
    id: "QORL-CLD-03",
    slug: "high-availability-cloud-devops-blueprint",
    title: "High-Availability Cloud & DevOps Blueprint",
    subtitle: "Production AWS & Azure Terraform Modules + Zero-Downtime CI/CD",
    category: "Cloud & DevOps",
    price: 2800,
    badge: "Enterprise",
    icon: "/jampack/symbol-avatar-1.png",
    rating: 4.9,
    reviewCount: 64,
    downloadCount: "1,980",
    version: "v2.2.0",
    lastUpdated: "October 2026",
    author: "Qorlune Infrastructure Group",
    shortDescription: "Fault-tolerant multi-region cloud infrastructure blueprints written in Terraform HCL with automated blue-green GitHub Actions pipelines and Prometheus monitoring.",
    longDescription: "Deploy a hardened, SOC-2 compliant multi-region infrastructure in under 30 minutes. Includes automated TLS 1.3 certificates, Cloudflare DDoS defense, VPC peering, isolated RDS PostgreSQL clusters with read replicas, and Redis cache clusters.",
    architectureHighlights: [
      "Modular Terraform 1.8+ infrastructure as code for AWS and Azure",
      "Zero-downtime rolling deploys with blue/green traffic splitting",
      "Comprehensive Prometheus and Grafana dashboards for sub-microsecond telemetry",
      "Automated database backup snapshots with cross-region replication"
    ],
    features: [
      "Isolated multi-tier VPC network topology with NAT Gateways",
      "Kubernetes (EKS/AKS) Helm charts for microservice deployments",
      "Automated WAF security rules blocking automated bot attacks",
      "Cost-optimized auto-scaling groups with Spot/Burstable instances",
      "Integrated centralized logging with Grafana Loki and Fluentbit"
    ],
    deliverables: [
      "Terraform HCL Infrastructure Modules (.tf)",
      "Kubernetes Manifests & Production Helm Charts",
      "Grafana Dashboards JSON exports & Alerting Rules",
      "GitHub Actions CI/CD Pipeline configurations",
      "Disaster Recovery & Failover Simulation Runbook"
    ],
    techStack: ["Terraform", "Kubernetes", "AWS", "Azure", "Docker", "Prometheus", "Grafana"],
    screenshots: [
      "/jampack/slide3.jpg",
      "/jampack/slide1.jpg",
      "/jampack/slide4.jpg"
    ]
  },
  {
    id: "QORL-CMP-05",
    slug: "soc2-nist-compliance-readiness-roadmap",
    title: "SOC 2 & NIST CSF Compliance Readiness Roadmap",
    subtitle: "Turnkey Audit Governance, Policies & Technical Evidence Toolkit",
    category: "Compliance & Audit",
    price: 1800,
    icon: "/jampack/symbol-avatar-5.png",
    rating: 4.8,
    reviewCount: 39,
    downloadCount: "1,320",
    version: "v3.4.0",
    lastUpdated: "October 2026",
    author: "Qorlune Governance Desk",
    shortDescription: "Complete audit readiness suite for SOC 2 Type I/II, ISO 27001, and NIST CSF 2.0 with policy templates, access matrices, and automated evidence collection scripts.",
    longDescription: "Eliminate months of auditor back-and-forth. This comprehensive framework gives engineering and leadership teams the exact technical control mappings, employee onboarding policies, and automated audit trails required to pass external security audits.",
    architectureHighlights: [
      "NIST CSF 2.0 Core Function alignment (Govern, Identify, Protect, Detect, Respond, Recover)",
      "Automated AWS/Azure configuration auditor scripts",
      "Least-privilege RBAC role definition schema",
      "Continuous compliance monitoring guidelines for SaaS teams"
    ],
    features: [
      "24 attorney-vetted information security policies (Access Control, IR, DR, BC, Encryption)",
      "Automated evidence collection CLI for cloud permissions and MFA enforcement",
      "Vendor security assessment questionnaire and evaluation scoring matrix",
      "Employee security awareness training checklist and onboarding quiz",
      "Annual penetration test scope template and RFP documentation"
    ],
    deliverables: [
      "24 Customizable Policy Documents (.docx & Markdown)",
      "Technical Evidence Collection Scripts (Bash & Python)",
      "Security Risk Register & Impact Assessment Matrix (.xlsx)",
      "Employee Security Handbook Template",
      "Auditor Interview Preparation Guide"
    ],
    techStack: ["NIST CSF 2.0", "ISO 27001", "SOC 2", "Python", "CloudTrail", "AWS IAM"],
    screenshots: [
      "/jampack/slide2.jpg",
      "/jampack/slide4.jpg",
      "/jampack/slide1.jpg"
    ]
  },
  {
    id: "QORL-INC-06",
    slug: "emergency-incident-response-containment-toolkit",
    title: "Emergency Incident Response & Containment Toolkit",
    subtitle: "Rapid Threat Mitigation, Memory Forensics & Session Revocation",
    category: "Cybersecurity",
    price: 2500,
    badge: "Critical",
    icon: "/jampack/symbol-avatar-7.png",
    rating: 5.0,
    reviewCount: 85,
    downloadCount: "3,120",
    version: "v2.5.1",
    lastUpdated: "October 2026",
    author: "Qorlune Threat Operations",
    shortDescription: "Battle-hardened playbooks and automation scripts for containing active breaches, isolating compromised hosts, rotating leaked keys, and notifying regulators.",
    longDescription: "When an incident happens, every minute counts. This toolkit gives on-call engineers step-by-step containment runbooks, memory and network triage one-liners, emergency token revocation webhooks, and executive communication templates.",
    architectureHighlights: [
      "Automated global session token invalidation webhook for Redis & Supabase",
      "Ephemeral sandbox isolation script for compromised Linux containers",
      "Volatile memory and socket triage script for Linux servers",
      "Tamper-proof audit logging preservation pipeline"
    ],
    features: [
      "Ransomware containment step-by-step checklist",
      "Business Email Compromise (BEC) investigation runbook",
      "Compromised API Key rotation & revocation automations",
      "Breach notification legal templates (GDPR 72-hour notice, SEC disclosure)",
      "Post-Incident Review (PIR) and Root Cause Analysis (RCA) reporting framework"
    ],
    deliverables: [
      "Emergency Runbooks (Markdown & Interactive Web Portal)",
      "Forensic Triage Automation Scripts (Bash & Python)",
      "Executive Incident Briefing Slide Deck (.pptx)",
      "Legal Notification Templates for Data Protection Authorities",
      "Post-Mortem Root Cause Analysis Template"
    ],
    techStack: ["Linux", "Bash", "Python", "Memory Forensics", "Redis", "eBPF", "Wireshark"],
    screenshots: [
      "/jampack/slide3.jpg",
      "/jampack/slide2.jpg",
      "/jampack/slide1.jpg"
    ]
  },
  {
    id: "QORL-PRT-07",
    slug: "zero-trust-internal-operations-portal",
    title: "Zero-Trust Internal Operations Portal Blueprint",
    subtitle: "Isolated Subpath (/emp) Workspace with Next.js SSR & Supabase RBAC",
    category: "Web Engineering",
    price: 2400,
    icon: "/jampack/symbol-avatar-12.png",
    rating: 4.9,
    reviewCount: 53,
    downloadCount: "1,750",
    version: "v2.1.0",
    lastUpdated: "October 2026",
    author: "Qorlune Systems",
    shortDescription: "Complete enterprise employee portal with staff chat, project task tracking, document vault, and attendance logging isolated on a strict zero-leakage security boundary.",
    longDescription: "Stop exposing internal corporate tools to public web bundles. This architecture separates your staff workplace into an authenticated subpath boundary with server-side auth verification, session guards, strict CORS whitelists, and search engine blocking headers.",
    architectureHighlights: [
      "Complete isolation from public customer-facing web assets",
      "Supabase SSR server-side session authentication with auto-refresh",
      "Real-time WebSocket chat and team task board",
      "Role-based permission guards (Employee, Manager, Executive, Admin)"
    ],
    features: [
      "Team attendance & work-log tracking with automated time calculations",
      "Secure document repository with signed URL file downloads",
      "Internal corporate announcements and push alerts",
      "Interactive company pipeline and OKR delivery milestones",
      "Executive management overview with headcount analytics"
    ],
    deliverables: [
      "Next.js 16 Portal Source Code (TypeScript)",
      "Supabase Database Schema with Row-Level Security (RLS) policies",
      "Tailwind CSS v4 Custom Glassmorphic Dashboard Components",
      "Role-Based Access Control Setup Guide",
      "Production Deployment Configs for Vercel & Render"
    ],
    techStack: ["Next.js 16", "React 19", "Supabase", "TypeScript", "Tailwind CSS", "Zustand"],
    screenshots: [
      "/jampack/slide1.jpg",
      "/jampack/slide4.jpg",
      "/jampack/slide2.jpg"
    ]
  },
  {
    id: "QORL-API-08",
    slug: "distributed-api-gateway-microservices-engine",
    title: "Distributed API Gateway & Microservices Engine",
    subtitle: "High-Throughput Go Concurrency Core + Python Gateway",
    category: "Cloud & DevOps",
    price: 1900,
    icon: "/jampack/symbol-avatar-10.png",
    rating: 4.9,
    reviewCount: 71,
    downloadCount: "4,190",
    version: "v3.2.0",
    lastUpdated: "October 2026",
    author: "Qorlune Core Engineering",
    shortDescription: "Dual-engine distributed backend architecture combining a high-speed Go worker pool and concurrency dispatcher with Python FastAPI for lightning-fast REST & gRPC.",
    longDescription: "Built for services that handle millions of events daily. Features sliding-window rate limiting using Redis Sorted Sets, bounded goroutine memory pools to eliminate OOM spikes, and end-to-end mTLS authentication between internal services.",
    architectureHighlights: [
      "Go 1.22 bounded worker pool processing 25,000+ operations/sec",
      "Distributed token-bucket and sliding-window rate limiters",
      "Constant-time HMAC SHA-256 signature verification preventing timing attacks",
      "Multi-broker pub/sub event dispatcher supporting Kafka and Redis streams"
    ],
    features: [
      "Dual REST and gRPC endpoint interfaces with protocol buffers",
      "Automated idempotency key management with distributed locks",
      "Prometheus metrics instrumentation exporting p95/p99 latency histograms",
      "Structured JSON zero-allocation logging with Zap / Loguru",
      "Graceful shutdown handling with in-flight request draining"
    ],
    deliverables: [
      "Go Concurrency Engine Source Code",
      "FastAPI API Gateway Source Code",
      "Proto / gRPC definitions and auto-generated stubs",
      "Redis Lua scripts for atomic rate limiting",
      "K6 Performance Benchmarking Suite"
    ],
    techStack: ["Go", "Python", "gRPC", "Redis", "Kafka", "Docker", "Prometheus"],
    screenshots: [
      "/jampack/slide2.jpg",
      "/jampack/slide3.jpg",
      "/jampack/slide1.jpg"
    ]
  },
  {
    id: "QORL-DEV-09",
    slug: "security-engineer-cli-recon-suite",
    title: "Security Engineer CLI & Recon Toolkit (50+ Tools)",
    subtitle: "Portable Python Command-Line Utilities for Penetration Testers",
    category: "Developer Tools",
    price: 49,
    badge: "Popular",
    icon: "/jampack/symbol-avatar-9.png",
    rating: 4.9,
    reviewCount: 210,
    downloadCount: "12,400",
    version: "v5.0.0",
    lastUpdated: "October 2026",
    author: "Qorlune Developer Hub",
    shortDescription: "A comprehensive suite of 50+ standalone, zero-dependency Python command-line tools covering TCP port scanning, offline JWT decoding, CORS audits, and ASN recon.",
    longDescription: "The ultimate digital Swiss Army knife for cybersecurity analysts, penetration testers, and DevOps engineers. Every tool is cleanly modular, lightweight, MIT-licensed, and works out-of-the-box on Linux, macOS, and Windows with zero bloated dependencies.",
    architectureHighlights: [
      "Zero-dependency standard library design where possible",
      "Asynchronous network sockets for rapid non-blocking port discovery",
      "Offline cryptographically secure random token generation",
      "Unified CLI argument parsing with colored terminal telemetry"
    ],
    features: [
      "Repo-health-audit: Automated GitHub secret and credential detection",
      "JWT-inspector-cli: Offline claim decoder, signature and expiry validator",
      "Port-scout: Async multi-threaded TCP/UDP port scanner",
      "CORS-security-tester: Misconfiguration and wildcard origin auditor",
      "Password-entropy-calculator: Realistic brute-force time estimator"
    ],
    deliverables: [
      "Full Source Code for 50+ CLI Utilities (Python)",
      "Standalone Executable Binaries for Windows and Linux",
      "Pre-built Docker Image (Alpine Linux)",
      "Unified Bash wrapper and alias configuration script",
      "Comprehensive Cheat Sheet & Man Pages (Markdown)"
    ],
    techStack: ["Python 3.11+", "AsyncIO", "Cryptography", "Docker", "Bash"],
    screenshots: [
      "/jampack/slide3.jpg",
      "/jampack/slide4.jpg",
      "/jampack/slide2.jpg"
    ]
  },
  {
    id: "QORL-GIT-10",
    slug: "conventional-changelog-pro-engine",
    title: "Conventional Changelog Pro Engine",
    subtitle: "Automated SemVer Bumper & Production Release Notes Drafter",
    category: "Developer Tools",
    price: 0,
    isFree: true,
    badge: "Free Tool",
    icon: "/jampack/symbol-avatar-11.png",
    rating: 5.0,
    reviewCount: 340,
    downloadCount: "28,900",
    version: "v3.1.4",
    lastUpdated: "October 2026",
    author: "Qorlune Open Source",
    shortDescription: "Fast, intelligent Git changelog generator adhering to Conventional Commits specification with automated semantic version calculation and GitHub release drafting.",
    longDescription: "Stop wasting hours writing manual changelogs before releases. This utility parses your commit history, groups changes by type (feat, fix, perf, docs, chore), calculates the correct SemVer bump (major, minor, patch), and outputs beautiful GitHub release notes.",
    architectureHighlights: [
      "Deterministic Conventional Commits 1.0 parser",
      "Semantic Versioning (SemVer 2.0.0) calculation rules",
      "Direct integration with GitHub Releases API",
      "Zero external runtime dependencies"
    ],
    features: [
      "Automated changelog generation grouped by category",
      "Breaking changes detection with prominent visual callouts",
      "Monorepo and single-package scoping support",
      "GitHub Actions workflow for automated release on tag push",
      "Customizable Markdown and HTML output templates"
    ],
    deliverables: [
      "Open Source Python Utility Source Code",
      "Pre-configured GitHub Action Workflow (.github/workflows/release.yml)",
      "NPM and PyPI distribution packages",
      "Complete CLI Documentation and Quickstart Guide"
    ],
    techStack: ["Python", "Git", "GitHub Actions", "Markdown"],
    screenshots: [
      "/jampack/slide4.jpg",
      "/jampack/slide1.jpg",
      "/jampack/slide3.jpg"
    ]
  },
  {
    id: "QORL-SAAS-11",
    slug: "jampack-robust-nextjs-saas-template",
    title: "Jampack Robust Next.js 16 SaaS App Template",
    subtitle: "Enterprise Admin Dashboard, Analytics & CRM Application Suite",
    category: "Web Engineering",
    price: 120,
    badge: "Official",
    icon: "/jampack/symbol-avatar-6.png",
    rating: 5.0,
    reviewCount: 155,
    downloadCount: "6,800",
    version: "v2.5.0",
    lastUpdated: "October 2026",
    author: "Hencework & Qorlune",
    shortDescription: "The complete Jampack SaaS and admin dashboard template featuring modern data visualizations, chat, calendar, invoicing, and integrations store modules.",
    longDescription: "The exact, world-class SaaS application suite adapted for modern Next.js 16 and React 19. Features 3 responsive layout styles (Classic, Compact, Horizontal), rich ApexCharts & AmCharts telemetry, light and dark themes, and modular components.",
    architectureHighlights: [
      "Next.js App Router architecture with modular application layouts",
      "Comprehensive UI component system with form wizards and file uploaders",
      "Rich telemetry cards for active users, conversion funnels, and revenue",
      "Production-ready authentication layouts (Login, Signup, Lock Screen)"
    ],
    features: [
      "Full e-commerce / integrations app marketplace module",
      "Invoicing system with automated printable PDF bill generation",
      "Interactive Scrumboard and Kanban project management",
      "Real-time chat and multi-conversation messaging interface",
      "Customizable navigation drawers and dark/light color themes"
    ],
    deliverables: [
      "Complete Next.js Source Code in 3 Layout Variations",
      "Modular SCSS and Tailwind CSS Design Tokens",
      "High-Resolution Vector Icons and Asset Packs",
      "Detailed Step-by-Step Installation Documentation",
      "Commercial Lifetime Usage License"
    ],
    techStack: ["Next.js", "React 19", "Bootstrap 5", "ApexCharts", "Sass", "Framer Motion"],
    screenshots: [
      "/jampack/slide1.jpg",
      "/jampack/slide2.jpg",
      "/jampack/slide3.jpg"
    ]
  },
  {
    id: "QORL-MAIL-12",
    slug: "cloud-email-dispatcher-queue-engine",
    title: "24/7 Cloud Email Dispatcher & Queue Engine",
    subtitle: "Serverless Email Delivery Pipeline with Failover & Throttling",
    category: "Cloud & DevOps",
    price: 350,
    icon: "/jampack/symbol-avatar-16.png",
    rating: 4.8,
    reviewCount: 42,
    downloadCount: "940",
    version: "v1.8.0",
    lastUpdated: "October 2026",
    author: "Qorlune Operations",
    shortDescription: "Lightweight, highly reliable automated email dispatch engine running in the cloud on GitHub Actions or cron without requiring a dedicated persistent server.",
    longDescription: "Send transactional emails and bulk notifications automatically with zero server maintenance costs. Features automatic queue polling, batch delivery pacing to protect domain reputation, OpenEmail and SMTP fallback adapters, and state sync back to Git.",
    architectureHighlights: [
      "Zero-server architecture powered by scheduled GitHub Actions cron",
      "Deterministic delivery state persistence preventing duplicate sends",
      "Adaptive rate throttling preventing IP blacklisting and spam flags",
      "Clean separation of delivery credentials using repository secrets"
    ],
    features: [
      "Scheduled dispatch engine triggering every 5-10 minutes",
      "OpenEmail API and standard SMTP multi-provider support",
      "Automated unsubscribe and bounce handling logic",
      "HTML template rendering with variable interpolation",
      "Detailed delivery audit trail logged in Git"
    ],
    deliverables: [
      "Python 3.11+ Cloud Dispatcher Script",
      "GitHub Actions Cloud Workflow Configuration (.yml)",
      "HTML Email Templates (Responsive Dark & Light Mode)",
      "Target Contact Queue Management Schema (JSON)",
      "Setup & Domain SPF/DKIM Authentication Guide"
    ],
    techStack: ["Python", "GitHub Actions", "OpenEmail", "SMTP", "JSON"],
    screenshots: [
      "/jampack/slide4.jpg",
      "/jampack/slide3.jpg",
      "/jampack/slide1.jpg"
    ]
  }
];

export const STORE_CATEGORIES = [
  "All Products",
  "Web Engineering",
  "Cybersecurity",
  "Cloud & DevOps",
  "AI Automation",
  "Developer Tools",
  "Compliance & Audit"
] as const;
