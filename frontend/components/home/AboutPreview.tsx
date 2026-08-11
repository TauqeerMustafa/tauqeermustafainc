"use client";

import { BrainCircuit, Building2, Layers3, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { ButtonLink, Eyebrow, GlowCard, ImagePlaceholder, Reveal, Section, fadeLeft, fadeRight, stagger, viewportOnce } from "./ui";
import { motion } from "framer-motion";

const values = ["Practical innovation", "Security by design", "Operational clarity", "Long-term partnership"];

const focusAreas = [
  { title: "Enterprise solutions", icon: Building2 },
  { title: "AI & automation",      icon: BrainCircuit },
  { title: "Security-first",       icon: ShieldCheck },
];

const miniStats = [
  { value: "2006", label: "Founded", icon: TrendingUp },
  { value: "50+",  label: "Team size", icon: Users },
  { value: "200+", label: "Engagements", icon: Building2 },
];

export default function AboutPreview() {
  return (
    <Section className="bg-white" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

        <Reveal variant={fadeLeft} className="order-2 lg:order-1 space-y-4">
          <ImagePlaceholder
            src={imageLibrary.about[0]}
            title="Office & product strategy"
            caption="Founded 2006 · Islamabad, Pakistan"
          />
          <div className="grid grid-cols-3 gap-px border border-[#E5E5E5] bg-[#E5E5E5]">
            {miniStats.map((s) => (
              <div key={s.label} className="bg-white px-4 py-4 text-center">
                <s.icon className="mx-auto h-4 w-4 text-[#0A0A0A]" aria-hidden />
                <p className="mt-2 font-mono text-xl font-bold text-[#0A0A0A]">{s.value}</p>
                <p className="mt-0.5 text-xs text-[#A3A3A3]">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="order-1 lg:order-2">
          <Eyebrow>About Tauqeer Mustafa Inc.</Eyebrow>
          <h2 id="about-title" className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-[#0A0A0A] sm:text-4xl lg:text-5xl">
            Technology leadership for teams that need clarity before complexity.
          </h2>
          <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-[#525252] sm:text-lg">
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

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={stagger(0.08)}
            className="mt-8 grid gap-3 sm:grid-cols-2"
          >
            {values.map((v) => (
              <motion.li
                key={v}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-3 text-sm font-semibold text-[#171717]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#D4D4D4] bg-[#FAFAFA] text-[#171717]" aria-hidden>
                  <Layers3 className="h-3.5 w-3.5" />
                </span>
                {v}
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/about" variant="primary">About Us</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">Contact</ButtonLink>
          </div>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-4 border-t border-[#E5E5E5] pt-8 md:grid-cols-3">
        {focusAreas.map((area) => (
          <GlowCard key={area.title}>
            <div className="flex h-10 w-10 items-center justify-center border border-[#D4D4D4] bg-[#FAFAFA] text-[#171717]">
              <area.icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-base font-semibold text-[#0A0A0A]">{area.title}</p>
          </GlowCard>
        ))}
      </div>
    </Section>
  );
}
