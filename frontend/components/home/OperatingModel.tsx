"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Hammer, ShieldCheck, Telescope } from "lucide-react";
import { imageLibrary } from "@/data/media";
import { Eyebrow, ImagePlaceholder, Reveal, Section, StepBadge, fadeLeft, fadeUp, stagger, viewportOnce } from "./ui";

const phases = [
  { step: "01", title: "Discover", description: "We map the business problem, current systems, and risk exposure before writing a line of code or a policy document.", icon: Telescope },
  { step: "02", title: "Assess",   description: "Architecture, security posture, and compliance gaps are documented against a clear standard, with tradeoffs made visible to stakeholders.", icon: ClipboardCheck },
  { step: "03", title: "Build",    description: "Engineering, security controls, and remediation work proceed together, not as a bolt-on step after launch.", icon: Hammer },
  { step: "04", title: "Sustain",  description: "Systems are handed over with documentation and monitoring in place, so they stay maintainable long after our engagement ends.", icon: ShieldCheck },
];

export default function OperatingModel() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-[#161821] to-[#1A1D2E]" labelledBy="operating-model-title">
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(56,189,248,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px'}} aria-hidden />

      <div className="relative grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal variant={fadeLeft} className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm lg:mx-0 mx-auto">
            <span className="h-1.5 w-1.5 shrink-0 bg-[#38BDF8]" aria-hidden />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0E7FF]">Engagement Model</span>
          </div>
          <h2 id="operating-model-title" className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            A clear process, without the overhead.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#C7D2FE]">
            A four-phase process, whether you&apos;re a solo founder or a growing team: align
            on the problem, make tradeoffs visible, then deliver work that holds up in production.
          </p>
        </Reveal>
        <div className="relative hidden lg:block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          <ImagePlaceholder
            src={imageLibrary.dashboard[2]}
            title="Delivery timeline"
            caption="Scope, risk, and milestones stay visible end to end."
          />
        </div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.1)}
        className="relative mt-16 grid gap-px rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4 overflow-hidden"
      >
        {phases.map((phase) => (
          <motion.article
            key={phase.step}
            variants={fadeUp}
            className="group bg-gradient-to-br from-white/[0.03] to-transparent p-7 transition-all duration-300 hover:from-[#38BDF8]/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 font-mono text-xs font-bold text-white transition-colors group-hover:border-[#38BDF8]/50 group-hover:bg-[#38BDF8]/10 group-hover:text-[#38BDF8]">
                {phase.step}
              </div>
              <phase.icon className="h-5 w-5 text-[#38BDF8] transition-colors" aria-hidden />
            </div>
            <h3 className="mt-6 text-lg font-bold text-white transition-colors">
              {phase.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#C7D2FE] transition-colors">
              {phase.description}
            </p>
            <div className="mt-5 h-px w-0 bg-gradient-to-r from-[#38BDF8] to-[#818CF8] transition-all duration-500 group-hover:w-full" aria-hidden />
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
