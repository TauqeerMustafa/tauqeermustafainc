import { FileCheck2, LockKeyhole, MessagesSquare, ClipboardCheck } from "lucide-react";

import { IconFrame, ImagePlaceholder, Section, SectionHeader } from "./ui";

const trustPrinciples = [
  {
    title: "Clear decision records",
    description:
      "Important product and architecture decisions are documented so teams understand the reasoning behind the system.",
    icon: FileCheck2,
  },
  {
    title: "Security-minded defaults",
    description:
      "Access control, data handling, dependency choices, and deployment paths are considered early instead of after launch.",
    icon: LockKeyhole,
  },
  {
    title: "Direct communication",
    description:
      "Scope, risks, tradeoffs, and delivery progress are kept visible so business and technical stakeholders stay aligned.",
    icon: MessagesSquare,
  },
  {
    title: "Structured handoff",
    description:
      "Every engagement ends with documentation, access transfer, and a maintenance plan, so nothing depends on tribal knowledge.",
    icon: ClipboardCheck,
  },
];

export default function Testimonials() {
  return (
    <Section className="bg-[#F8F9FA]" labelledBy="trust-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHeader
            id="trust-title"
            eyebrow="Trust"
            title="Building Trust Through Transparent Delivery"
            description="Our delivery model emphasizes clarity, secure defaults, and maintainable outcomes from planning through launch, ensuring stakeholders remain aligned and confident."
          />
          <ImagePlaceholder
            src="/images/dashboard/tmi-dashboard-growth.jpg"
            title="Delivery visibility"
            caption="Progress, risks, and decisions stay visible to every stakeholder."
            className="hidden lg:block"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {trustPrinciples.map((principle) => (
            <article
              key={principle.title}
              className="grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-[auto_1fr] sm:gap-6"
            >
              <IconFrame icon={principle.icon} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {principle.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  {principle.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
