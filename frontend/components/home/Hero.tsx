import { company } from "@/data/company";

import { Section, PrimaryButton, OutlineButton, ImagePlaceholder } from "./ui";

const yearsInBusiness = new Date().getFullYear() - Number(company.founded);

const heroStats = [
  { value: `${yearsInBusiness}+ yrs`, label: "In operation", detail: `Delivering software since ${company.founded}` },
  { value: "3", label: "Integrated service lines", detail: "AI, cybersecurity, and design under one roof" },
  { value: "1 biz day", label: "Response time", detail: "Every inquiry reaches the delivery team directly" },
];

export default function Hero() {
  return (
    <Section
      className="tmi-grid relative overflow-hidden border-b border-[#D7DEE8] bg-[radial-gradient(circle_at_50%_0%,#DCE8FB_0%,rgba(220,232,251,0.25)_28%,rgba(255,255,255,0)_56%)] pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40"
      containerClassName="relative"
    >
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="text-center lg:text-left">
          <p className="mx-auto inline-flex items-center gap-2 border border-[#0B5FFF]/30 bg-white/90 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8] shadow-sm backdrop-blur lg:mx-0">
            <span className="h-1.5 w-1.5 bg-[#0B5FFF]" aria-hidden="true" />
            TMI // Security, Compliance &amp; Digital Systems
          </p>
          <h1 className="mt-8 text-balance text-5xl font-semibold tracking-tight text-[#0A1628] sm:text-6xl lg:text-7xl">
            Technology systems built for serious business outcomes.
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-pretty text-lg leading-8 text-zinc-600 sm:text-xl lg:mx-0">
            We help organizations build, modernize, and maintain secure,
            scalable, and intelligent software systems that drive measurable
            business growth &mdash; across AI automation, cybersecurity and
            risk assurance, and graphic design and brand identity.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <PrimaryButton href="/contact">Start a Conversation</PrimaryButton>
            <OutlineButton href="/portfolio">View Our Work</OutlineButton>
          </div>
        </div>

        <ImagePlaceholder
          src="/images/hero/tmi-hero-globe.jpg"
          title="Global-ready delivery"
          caption="Secure systems, designed to operate across markets and time zones."
          className="hidden lg:block"
        />
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-3">
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="tmi-corners border border-[#D7DEE8] bg-white/85 px-5 py-5 text-left shadow-[0_12px_34px_rgba(10,22,40,0.05)] backdrop-blur"
          >
            <div className="font-mono text-2xl font-semibold text-[#0A46A8]">{stat.value}</div>
            <div className="mt-2 text-sm font-semibold text-[#0A1628]">{stat.label}</div>
            <div className="mt-1 text-xs leading-5 text-zinc-500">{stat.detail}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
