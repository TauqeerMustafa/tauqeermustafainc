import { Gauge, Lock, Network, Users } from "lucide-react";

import { Section, SectionHeader } from "@/components/home/ui";

const principles = [
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

export default function OperatingModel() {
  return (
    <Section className="bg-zinc-50" labelledBy="model-title">
      <SectionHeader
        id="model-title"
        eyebrow="Our Operating Model"
        title="Enterprise discipline, without the enterprise drag."
        description="Our engagement model is intentionally simple: align on the business problem, make the technical tradeoffs visible, then deliver work that can be maintained after launch."
        className="mx-auto max-w-3xl text-center"
      />

      <div className="relative mt-16">
        <div
          className="absolute left-1/2 top-4 hidden w-px -translate-x-1/2 bg-zinc-200 lg:block"
          style={{ height: "calc(100% - 2rem)" }}
        />

        <div className="space-y-12 lg:space-y-0">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="relative lg:grid lg:grid-cols-2 lg:items-center lg:gap-16"
            >
              <div
                className={`flex flex-col items-start lg:items-end ${
                  index % 2 === 0 ? "lg:order-1" : "lg:order-2"
                } lg:text-right`}
              >
                <span className="text-4xl font-bold tracking-tight text-zinc-900">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-2xl font-semibold text-zinc-900">
                  {principle.title}
                </h3>
                <p className="mt-3 text-lg text-zinc-600">
                  {principle.description}
                </p>
              </div>

              <div
                className={`hidden lg:flex lg:items-center ${
                  index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white ring-8 ring-zinc-50">
                    <principle.icon
                      className="h-7 w-7 text-zinc-600"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="w-full border-t border-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}