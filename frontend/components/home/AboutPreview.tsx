"use client";

import { BrainCircuit, Building2, Layers3, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { ButtonLink, Eyebrow, GlowCard, ImagePlaceholder, Section, useScrollReveal } from "./ui";

const values = [
  "Practical innovation",
  "Security by design",
  "Operational clarity",
  "Long-term partnership",
];

const focusAreas = [
  { title: "Enterprise solutions", icon: Building2,   color: "text-[#0B5FFF]", bg: "bg-[#EEF4FF] border-[#BFCFFF]" },
  { title: "AI & automation",      icon: BrainCircuit, color: "text-[#7C3AED]", bg: "bg-[#F5F3FF] border-[#DDD6FE]" },
  { title: "Security-first",       icon: ShieldCheck,  color: "text-[#059669]", bg: "bg-[#ECFDF5] border-[#A7F3D0]" },
];

const miniStats = [
  { value: "2006", label: "Founded", icon: TrendingUp },
  { value: "50+",  label: "Team size", icon: Users },
  { value: "200+", label: "Engagements", icon: Building2 },
];

export default function AboutPreview() {
  const imgRef    = useScrollReveal<HTMLDivElement>();
  const textRef   = useScrollReveal<HTMLDivElement>();
  const areaRef   = useScrollReveal<HTMLDivElement>();

  return (
    <Section className="bg-white" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

        {/* ── Image column ── */}
        <div ref={imgRef} className="sr anim-left order-2 lg:order-1 space-y-4">
          <ImagePlaceholder
            src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-about-office_ugfz0w.jpg"
            title="Office & product strategy"
            caption="Founded 2006 · Islamabad, Pakistan"
          />

          {/* Mini-stats row */}
          <div className="grid grid-cols-3 gap-px border border-[#D7DEE8] bg-[#D7DEE8]">
            {miniStats.map((s) => (
              <div key={s.label} className="bg-white px-4 py-4 text-center">
                <s.icon className="mx-auto h-4 w-4 text-[#0B5FFF]" aria-hidden />
                <p className="mt-2 font-mono text-xl font-bold text-[#0A1628]">{s.value}</p>
                <p className="mt-0.5 text-xs text-[#9AA5B4]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Text column ── */}
        <div ref={textRef} className="sr anim-right order-1 lg:order-2">
          <Eyebrow>About Tauqeer Mustafa Inc.</Eyebrow>

          <h2 id="about-title" className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-[#0A1628] sm:text-4xl lg:text-5xl">
            Technology leadership for teams that need clarity before complexity.
          </h2>

          <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-[#5F6673] sm:text-lg">
            <p>
              Since 2006, Tauqeer Mustafa Inc. has grown into a technology consulting and
              software engineering company spanning three service lines: AI systems &amp;
              automation, cybersecurity &amp; risk assurance, and graphic design &amp; brand identity.
            </p>
            <p>
              The work is shaped around dependable engineering, responsible innovation, and
              measurable business outcomes — without exaggerating claims or hiding tradeoffs.
            </p>
          </div>

          {/* Values checklist */}
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {values.map((v, i) => (
              <li key={v} className={`sr anim-up d-${i + 1} flex items-center gap-3 text-sm font-semibold text-[#374151]`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#F0F5FF] text-[#0A46A8]" aria-hidden>
                  <Layers3 className="h-3.5 w-3.5" />
                </span>
                {v}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/about" variant="primary">About Us</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">Contact</ButtonLink>
          </div>
        </div>
      </div>

      {/* ── Focus area cards ── */}
      <div ref={areaRef} className="sr anim-up mt-14 grid gap-4 border-t border-[#E5E7EB] pt-8 md:grid-cols-3">
        {focusAreas.map((area, i) => (
          <GlowCard key={area.title} className={`d-${i}`}>
            <div className={`flex h-10 w-10 items-center justify-center border ${area.bg} ${area.color}`}>
              <area.icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-base font-semibold text-[#0A1628]">{area.title}</p>
          </GlowCard>
        ))}
      </div>
    </Section>
  );
}
