"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Hammer, ShieldCheck, Telescope } from "lucide-react";
import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, Reveal, Section, fadeLeft, fadeUp, stagger, viewportOnce } from "./ui";

const phases = [
  { step: "01", title: "Discover", description: "We map the business problem, current systems, and risk exposure before writing a line of code or a policy document.", icon: Telescope },
  { step: "02", title: "Assess",   description: "Architecture, security posture, and compliance gaps are documented against a clear standard, with tradeoffs made visible to stakeholders.", icon: ClipboardCheck },
  { step: "03", title: "Build",    description: "Engineering, security controls, and remediation work proceed together, not as a bolt-on step after launch.", icon: Hammer },
  { step: "04", title: "Sustain",  description: "Systems are handed over with documentation and monitoring in place, so they stay maintainable long after our engagement ends.", icon: ShieldCheck },
];

export default function OperatingModel() {
  return (
    /* White canvas tile */
    <Section className="bg-[#ffffff]" labelledBy="operating-model-title">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal variant={fadeLeft} className="text-center lg:text-left">
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">Engagement Model</p>
          <h2 id="operating-model-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            A clear process, without the overhead.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
            A four-phase process, whether you&apos;re a solo founder or a growing team: align
            on the problem, make tradeoffs visible, then deliver work that holds up in production.
          </p>
        </Reveal>
        <div className="relative hidden lg:block overflow-hidden">
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
        className="mt-16 grid gap-px overflow-hidden border border-[#e0e0e0] bg-[#e0e0e0] sm:grid-cols-2 lg:grid-cols-4"
      >
        {phases.map((phase) => (
          <motion.article
            key={phase.step}
            variants={fadeUp}
            className="group bg-white p-7 transition-all duration-300 hover:bg-[#f5f5f7]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] bg-[#f5f5f7] text-[14px] font-semibold text-[#1d1d1f] transition-colors group-hover:border-[#0066cc] group-hover:bg-[#0066cc] group-hover:text-white">
                {phase.step}
              </div>
              <phase.icon className="h-5 w-5 text-[#0066cc] transition-colors" aria-hidden />
            </div>
            <h3 className="mt-6 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f] transition-colors">
              {phase.title}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a] transition-colors">
              {phase.description}
            </p>
            <div className="mt-5 h-px w-0 bg-[#0066cc] transition-all duration-500 group-hover:w-full" aria-hidden />
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
