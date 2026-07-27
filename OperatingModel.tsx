import { Gauge, Lock, Network, Users } from "lucide-react";

import { Section } from "@/components/home/ui";

const principles = [
  {
    title: "Architecture Before Acceleration",
    description:
      "We establish clear architecture, ownership, and security controls before scaling implementation to ensure systems are built on a solid foundation.",
    icon: Network,
  },
  {
    title: "Security as a Feature",
    description:
      "Threat awareness, secure defaults, and remediation planning are integrated throughout the project lifecycle, not bolted on at the end.",
    icon: Lock,
  },
  {
    title: "Transparent by Default",
    description:
      "Milestones, risks, tradeoffs, and decisions are kept visible to all stakeholders, enabling teams to move forward with confidence and clarity.",
    icon: Gauge,
  },
  {
    title: "Business-Aware Engineering",
    description:
      "Technical choices are explicitly tied to operational impact, user needs, and the commercial goals that drive the project.",
    icon: Users,
  },
];

export default function OperatingModel() {
  return (
    <Section className="bg-white" labelledBy="operating-model-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="operating-model-title"
          className="text-3xl font-semibold tracking-tighter text-zinc-900 sm:text-4xl"
        >
          Enterprise discipline, without the enterprise drag.
        </h2>
        <p className="mt-6 text-lg text-zinc-600">
          Our engagement model is intentionally simple: align on the business
          problem, make the technical tradeoffs visible, then deliver work that
          can be maintained long after launch.
        </p>
      </div>

      <div className="relative mt-20">
        {/* Vertical line for desktop */}
        <div
          className="absolute left-1/2 top-4 hidden h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-zinc-200 lg:block"
          aria-hidden="true"
        />

        <div className="space-y-16 lg:space-y-24">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="relative lg:grid lg:grid-cols-2 lg:items-start lg:gap-16"
            >
              <div
                className={`flex flex-col ${
                  index % 2 === 0
                    ? "lg:order-1 lg:items-end lg:text-right"
                    : "lg:order-2 lg:items-start"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                  Principle 0{index + 1}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-zinc-900">
                  {principle.title}
                </h3>
                <p className="mt-3 text-base text-zinc-600">
                  {principle.description}
                </p>
              </div>

              <div
                className={`hidden lg:flex lg:items-center ${
                  index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-4 ring-white">
                    <principle.icon
                      className="h-5 w-5 text-zinc-500"
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