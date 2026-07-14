import { ExternalLink } from "lucide-react";

import {
  Card,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";

const projects = [
  {
    title: "Enterprise Operations Portal",
    category: "Web Platform",
    description:
      "A secure role-based portal for leadership dashboards, internal workflows, and operational reporting.",
    impact: "Reduced manual reporting cycles and improved executive visibility.",
  },
  {
    title: "Security Compliance Dashboard",
    category: "Cybersecurity",
    description:
      "A centralized risk tracking interface for vulnerability evidence, remediation ownership, and audit readiness.",
    impact: "Improved remediation prioritization across distributed teams.",
  },
  {
    title: "AI Workflow Assistant",
    category: "AI Automation",
    description:
      "An internal assistant that routes requests, drafts operational responses, and summarizes business data.",
    impact: "Shortened repetitive task handling for customer-facing teams.",
  },
];

export default function PortfolioPreview() {
  return (
    <Section className="bg-white" labelledBy="portfolio-title">
      <SectionHeader
        id="portfolio-title"
        eyebrow="Featured work"
        title="Production systems with measurable outcomes"
        action={<TextLink href="/portfolio">View Portfolio</TextLink>}
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-[#A67C00]">
                {project.category}
              </p>
              <ExternalLink className="h-5 w-5 text-[#9CA3AF]" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[#111827]">
              {project.title}
            </h3>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              {project.description}
            </p>
            <p className="mt-6 border-l border-[#C9A227] pl-4 text-sm leading-6 text-[#374151]">
              {project.impact}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
