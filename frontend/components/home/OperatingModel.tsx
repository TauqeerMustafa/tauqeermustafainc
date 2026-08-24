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
    <Section className="tmi-dot-grid bg-[#F4F4F4]" labelledBy="operating-model-title">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal variant={fadeLeft} className="text-center lg:text-left">
          <Eyebrow>Engagement Model</Eyebrow>
          <h2 id="operating-model-title" className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl lg:text-5xl">
            Enterprise discipline, without the enterprise drag.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#525252]">
            A four-phase engagement, run the same way for a two-person startup or a regulated
            financial firm: align on the problem, make tradeoffs visible, then deliver work
            that survives contact with production.
          </p>
        </Reveal>
        <ImagePlaceholder
          src={imageLibrary.dashboard[2]}
          title="Delivery timeline"
          caption="Scope, risk, and milestones stay visible end to end."
          className="hidden lg:block"
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={stagger(0.1)}
        className="mt-16 grid gap-px border border-[#E5E5E5] bg-[#E5E5E5] sm:grid-cols-2 lg:grid-cols-4"
      >
        {phases.map((phase) => (
          <motion.article
            key={phase.step}
            variants={fadeUp}
            className="group bg-white p-7 transition-all duration-300 hover:bg-[#171717]"
          >
            <div className="flex items-center justify-between">
              <StepBadge step={phase.step} />
              <phase.icon className="h-5 w-5 text-[#0A0A0A] transition-colors group-hover:text-white" aria-hidden />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-[#0A0A0A] transition-colors group-hover:text-white">
              {phase.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#525252] transition-colors group-hover:text-white/70">
              {phase.description}
            </p>
            <div className="mt-5 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" aria-hidden />
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
