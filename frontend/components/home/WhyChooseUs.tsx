import { Gauge, Lock, Network, Users } from "lucide-react";

import { IconFrame, Section, SectionHeader } from "./ui";

const reasons = [
  {
    title: "Architecture before acceleration",
    description:
      "Reliability, observability, access control, and ownership are considered before implementation scales.",
    icon: Network,
  },
  {
    title: "Security built into delivery",
    description:
      "Threat awareness, secure defaults, and remediation planning are included throughout the project lifecycle.",
    icon: Lock,
  },
  {
    title: "Transparent execution",
    description:
      "Milestones, risks, tradeoffs, and decisions stay visible so teams can move without ambiguity.",
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
    <Section className="bg-[#F8F9FA]" labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeader
          id="why-title"
          eyebrow="Our Operating Model"
          title="Enterprise discipline, without enterprise drag"
          description="The engagement model is intentionally simple: align on the business problem, make the technical tradeoffs visible, then deliver work that can be maintained after launch."
        />

        <div className="grid gap-6">
          {reasons.map((reason, index) => (
            <article
              key={reason.title}
              className="grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-[auto_1fr] sm:gap-6"
            >
              <IconFrame icon={reason.icon} />
              <div>
                <span className="text-sm font-semibold text-[#B88A2A]">
                  0{index + 1}
                </span>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  {reason.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  {reason.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
