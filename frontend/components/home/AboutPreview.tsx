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
    /* Parchment tile — light alternate canvas */
    <Section className="bg-[#f5f5f7]" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

        <Reveal variant={fadeLeft} className="order-2 lg:order-1 space-y-6">
          <div className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <img
                src={imageLibrary.about[0]}
                alt="Tauqeer Mustafa — Founder, TMI"
                className="h-full w-full object-cover"
                style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[17px] font-semibold leading-[1.47] tracking-[-0.374px]">Tauqeer Mustafa — Founder</p>
                <p className="mt-1 text-[14px] leading-[1.43] tracking-[-0.224px] text-white/75">Founded 2026 · Islamabad, Pakistan</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#e0e0e0] border border-[#e0e0e0] bg-white">
            {miniStats.map((s) => (
              <div key={s.label} className="px-4 py-5 text-center">
                <s.icon className="mx-auto h-5 w-5 text-[#0066cc]" aria-hidden />
                <p className="mt-2 text-[28px] font-semibold leading-[1.14] text-[#1d1d1f]">{s.value}</p>
                <p className="mt-0.5 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="order-1 lg:order-2">
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">About TMI</p>
          <h2 id="about-title" className="mt-4 max-w-3xl text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            A lean agency. Honest about being new. Built to grow.
          </h2>
          <div className="mt-6 max-w-3xl space-y-5 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
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
                className="flex items-center gap-3 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] text-[#0066cc]" aria-hidden>
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

      <div className="mt-16 grid gap-6 border-t border-[#e0e0e0] pt-12 md:grid-cols-3">
        {focusAreas.map((area) => (
          <GlowCard key={area.title}>
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#e0e0e0] bg-white text-[#0066cc]">
              <area.icon className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-5 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">{area.title}</p>
          </GlowCard>
        ))}
      </div>
    </Section>
  );
}
