import { FileCheck2, LockKeyhole, MessagesSquare } from "lucide-react";

import { Section, SectionHeader } from "@/components/home/ui";

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
];

export default function Trust() {
  return (
    <Section className="bg-zinc-50" labelledBy="trust-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeader
          id="trust-title"
          eyebrow="Trust & Transparency"
          title="Building Confidence Through a Disciplined Process"
          description="Our delivery model emphasizes clarity, secure defaults, and maintainable outcomes from planning through launch, ensuring stakeholders remain aligned and confident."
        />

        <div className="space-y-8">
          {trustPrinciples.map((principle) => (
            <article key={principle.title} className="flex gap-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none bg-white shadow-sm">
                <principle.icon className="h-6 w-6 text-zinc-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900">{principle.title}</h3>
                <p className="mt-1 text-base leading-7 text-zinc-600">{principle.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}