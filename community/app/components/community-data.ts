import { Bot, Cloud, Code2, Palette, ShieldCheck } from "lucide-react";

export const capabilities = [
  { index: "01", label: "WEB ENGINEERING", title: "Build systems", description: "Architecture, APIs, dashboards, and product platforms shaped for performance, ownership, and long-term maintenance.", icon: Code2 },
  { index: "02", label: "CYBERSECURITY", title: "Secure by design", description: "Threat modeling, access boundaries, vulnerability thinking, and security habits brought into the work before launch day.", icon: ShieldCheck },
  { index: "03", label: "AI AUTOMATION", title: "Make work clearer", description: "Responsible automation, internal copilots, retrieval workflows, and data-enabled tools for operational teams.", icon: Bot },
  { index: "04", label: "CLOUD ENGINEERING", title: "Run with confidence", description: "Infrastructure, CI/CD, containers, and observability that make production behavior visible and resilient.", icon: Cloud },
  { index: "05", label: "PRODUCT DESIGN", title: "Turn complexity into clarity", description: "Research-informed flows, information architecture, and component systems for people doing consequential work.", icon: Palette },
] as const;

export const delivery = [
  { index: "01", title: "Discover", text: "Map the actual problem, existing systems, constraints, and risks before architecture decisions are made." },
  { index: "02", title: "Plan", text: "Make the operational reality visible: requirements, trade-offs, security boundaries, and a scope that fits." },
  { index: "03", title: "Build", text: "Deliver in testable increments while feature, infrastructure, security, and experience move together." },
  { index: "04", title: "Support", text: "Ship with runbooks, monitoring baselines, and the clarity teams need to keep the system healthy." },
] as const;

export const sessions = [
  { date: "12 SEP", title: "Planning secure web platforms", type: "ENGINEERING", summary: "Architecture, access control, performance, and maintainability before development begins." },
  { date: "19 SEP", title: "Incident response under pressure", type: "SECURITY", summary: "Tabletop thinking for teams that need the playbook to work during a real incident." },
  { date: "03 OCT", title: "AI automation that improves operations", type: "AUTOMATION", summary: "Choosing the right workflow, measuring value, and rolling out internal AI responsibly." },
  { date: "17 OCT", title: "Cloud cost and reliability in practice", type: "CLOUD", summary: "Making infrastructure spend and service health visible before they become surprises." },
] as const;
