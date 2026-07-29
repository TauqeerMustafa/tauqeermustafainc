import { BrainCircuit, Building2, Layers3, ShieldCheck } from "lucide-react";

import {
  ButtonLink,
  ImagePlaceholder,
  Section,
  SecondaryButton,
} from "@/components/home/ui";

const values = [
  "Practical innovation",
  "Security by design",
  "Operational clarity",
  "Long-term partnership",
];

const focusAreas = [
  {
    title: "Enterprise solutions",
    icon: Building2,
  },
  {
    title: "AI innovation",
    icon: BrainCircuit,
  },
  {
    title: "Security first",
    icon: ShieldCheck,
  },
];

export default function AboutPreview() {
  return (
    <Section className="bg-white" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <ImagePlaceholder src="/images/about/tmi-about-office.jpg"
          title="Office and product strategy"
          caption="Founded 2026 · Islamabad, Pakistan"
          className="order-2 lg:order-1"
        />

        <div className="order-1 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
            About Tauqeer Mustafa Inc.
          </p>

          <h2
            id="about-title"
            className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-[#0A1628] sm:text-4xl lg:text-5xl"
          >
            Technology leadership for teams that need clarity before complexity.
          </h2>

          <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-[#5F6673] sm:text-lg">
            <p>
              Tauqeer Mustafa Inc. is a technology consulting and software
              engineering company spanning three service lines: AI systems and
              automation, cybersecurity and risk assurance, and graphic design
              and brand identity.
            </p>
            <p>
              The work is shaped around dependable engineering, responsible
              innovation, and measurable business outcomes without exaggerating
              claims or hiding technical tradeoffs.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {values.map((value) => (
              <li
                key={value}
                className="flex items-center gap-3 text-sm font-semibold text-[#374151]"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-none bg-[#F4F7FC] text-[#0A46A8]"
                  aria-hidden
                >
                  <Layers3 className="h-3.5 w-3.5" />
                </span>
                {value}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/about" variant="primary">About Us</ButtonLink>
            <SecondaryButton href="/contact">Contact</SecondaryButton>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-4 border-t border-[#E5E7EB] pt-8 md:grid-cols-3">
        {focusAreas.map((area) => (
          <div key={area.title} className="flex items-center gap-4 border-l border-[#0B5FFF] bg-[#F4F7FC] px-5 py-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-none border border-[#D7DEE8] bg-white text-[#0A46A8]">
              <area.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-[#0A1628]">{area.title}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

