import { ClipboardCheck, Hammer, ShieldCheck, Telescope } from "lucide-react";

import { ImagePlaceholder, Section } from "./ui";

const phases = [
  {
    step: "01",
    title: "Discover",
    description:
      "We map the business problem, current systems, and risk exposure before writing a line of code or a policy document.",
    icon: Telescope,
  },
  {
    step: "02",
    title: "Assess",
    description:
      "Architecture, security posture, and compliance gaps are documented against a clear standard, with tradeoffs made visible to stakeholders.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "Build",
    description:
      "Engineering, security controls, and remediation work proceed together, not as a bolt-on step after launch.",
    icon: Hammer,
  },
  {
    step: "04",
    title: "Sustain",
    description:
      "Systems are handed over with documentation and monitoring in place, so they stay maintainable long after our engagement ends.",
    icon: ShieldCheck,
  },
];

export default function OperatingModel() {
  return (
    <Section className="tmi-grid bg-[#F4F7FC]" labelledBy="operating-model-title">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div className="text-center lg:text-left">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
            Engagement Model
          </p>
          <h2
            id="operating-model-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl"
          >
            Enterprise discipline, without the enterprise drag.
          </h2>
          <p className="mt-6 text-lg text-zinc-600">
            A four-phase engagement, run the same way for a two-person startup
            or a regulated financial firm: align on the problem, make tradeoffs
            visible, then deliver work that survives contact with production.
          </p>
        </div>
        <ImagePlaceholder
          src="/images/dashboard/tmi-dashboard-finance.jpg"
          title="Delivery timeline"
          caption="Scope, risk, and milestones stay visible end to end."
          className="hidden lg:block"
        />
      </div>

      <div className="mt-16 grid gap-px border border-[#D7DEE8] bg-[#D7DEE8] sm:grid-cols-2 lg:grid-cols-4">
        {phases.map((phase) => (
          <div key={phase.step} className="bg-white p-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold tracking-widest text-[#0A46A8]">
                {phase.step}
              </span>
              <phase.icon className="h-5 w-5 text-[#0B5FFF]" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[#0A1628]">
              {phase.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {phase.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
