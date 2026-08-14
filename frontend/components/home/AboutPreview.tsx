"use client";

import { BrainCircuit, Building2, Layers3, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { ButtonLink, Eyebrow, GlowCard, ImagePlaceholder, Reveal, Section, fadeLeft, fadeRight, stagger, viewportOnce } from "./ui";
import { motion } from "framer-motion";

const values = ["Security built into every build", "Direct founder access", "Honest pricing, no markup", "Fast delivery, small team"];

const focusAreas = [
  { title: "Web & product build", icon: Building2 },
  { title: "AI & automation",     icon: BrainCircuit },
  { title: "Security-first",      icon: ShieldCheck },
];

const miniStats = [
  { value: "2026", label: "Year founded",   icon: TrendingUp },
  { value: "Lean", label: "Team model",     icon: Users },
  { value: "Sec+", label: "Security-first", icon: ShieldCheck },
];

export default function AboutPreview() {
  return (
    <Section className="bg-gradient-to-b from-[#0A0D12] to-[#161821]" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

        <Reveal variant={fadeLeft} className="order-2 lg:order-1 space-y-4">
          <ImagePlaceholder
            src={imageLibrary.about[0]}
            title="Tauqeer Mustafa — Founder, TMI"
            caption="Founded 2026 · Islamabad, Pakistan"
          />
          <div className="grid grid-cols-3 gap-px rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            {miniStats.map((s) => (
              <div key={s.label} className="bg-gradient-to-br from-white/[0.05] to-transparent px-4 py-5 text-center transition hover:from-white/[0.1]">
                <s.icon className="mx-auto h-4 w-4 text-[#38BDF8]" aria-hidden />
                <p className="mt-2 font-mono text-xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="order-1 lg:order-2">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 shrink-0 bg-[#38BDF8]" aria-hidden />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0E7FF]">About TMI</span>
          </div>
          <h2 id="about-title" className="mt-6 max-w-3xl text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
            A lean agency. Honest about being new. Built to grow.
          </h2>
          <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-[#C7D2FE] sm:text-lg">
            <p>
              TMI was founded in 2026 by Tauqeer Mustafa in Islamabad, Pakistan. This is a real operating agency, built to serve small businesses and startups who need secure, well-designed digital products without enterprise overhead.
            </p>
            <p>
              Clients work directly with the founder. No account managers, no hand-offs, no bloated markup. You get a lean, security-minded team at honest rates — and work that&apos;s built to last.
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
                className="flex items-center gap-3 text-sm font-semibold text-white"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#38BDF8]" aria-hidden>
                  <Layers3 className="h-4 w-4" />
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

      <div className="mt-14 grid gap-4 border-t border-white/10 pt-10 md:grid-cols-3">
        {focusAreas.map((area) => (
          <GlowCard key={area.title}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#38BDF8]">
              <area.icon className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-5 text-base font-semibold text-white">{area.title}</p>
          </GlowCard>
        ))}
      </div>
    </Section>
  );
}
