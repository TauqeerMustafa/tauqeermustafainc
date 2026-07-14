import { Gauge, Lock, Network, Users } from "lucide-react";

import { Card, IconFrame, Section, SectionHeader } from "@/components/home/ui";

const reasons = [
  {
    title: "Enterprise-first architecture",
    description:
      "Systems are designed with reliability, observability, access control, and long-term maintainability in mind.",
    icon: Network,
  },
  {
    title: "Security built into delivery",
    description:
      "Threat awareness, secure defaults, and clear remediation planning are included throughout the project lifecycle.",
    icon: Lock,
  },
  {
    title: "Fast, transparent execution",
    description:
      "Clear milestones, disciplined communication, and pragmatic decisions keep teams aligned from discovery to launch.",
    icon: Gauge,
  },
  {
    title: "Business-aware engineering",
    description:
      "Technical choices are tied to operational impact, user needs, and the commercial goals behind the product.",
    icon: Users,
  },
];

export default function WhyChooseUs() {
  return (
    <Section className="bg-white" labelledBy="why-title">
      <SectionHeader
        id="why-title"
        eyebrow="Why choose us"
        title="Practical expertise for high-stakes digital work"
      />

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {reasons.map((reason) => (
          <Card key={reason.title}>
            <IconFrame icon={reason.icon} />
            <h3 className="mt-6 text-lg font-semibold text-[#111827]">
              {reason.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#6B7280]">
              {reason.description}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
