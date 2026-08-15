"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Hammer, ShieldCheck, Telescope } from "lucide-react";
import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, Reveal, Section, fadeLeft, fadeUp, stagger, viewportOnce } from "./ui";

const phases = [
  { step: "01", title: "Discover", description: "What problem are we solving? What systems already exist? What risks actually matter? Discovery maps constraints before any architecture decisions are made.", icon: Telescope },
  { step: "02", title: "Plan",     description: "Design for the operational reality the system will face. Document security requirements, infrastructure tradeoffs, and the actual scope that fits the timeline.", icon: ClipboardCheck },
  { step: "03", title: "Build",    description: "Incremental delivery with testable milestones. Security and infrastructure work happen in parallel with features, not after. Regular check-ins keep progress visible.", icon: Hammer },
  { step: "04", title: "Support",  description: "Systems ship with runbooks, monitoring baselines, and post-launch support. The work doesn't end at deployment — it ends when the system runs stably in production.", icon: ShieldCheck },
];

export default function OperatingModel() {
  return (
    /* Parchment tile */
    <Section className="bg-[#f5f5f7]" labelledBy="operating-model-title">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal variant={fadeLeft} className="text-center lg:text-left">
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">How We Work</p>
          <h2 id="operating-model-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            A clear process, built for delivery.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
            Every engagement follows the same structure: discover the actual constraints, plan for what the system
            will face in production, build in testable increments with security embedded from the start, then support
            the deployment until it runs stably. The timeline scales to the scope, but the phases stay consistent —
            whether it's an 8-week authentication rebuild or a 16-week operational platform.
          </p>
        </Reveal>
        <div className="relative hidden lg:block overflow-hidden">
          <ImagePlaceholder
            src={imageLibrary.dashboard[2]}
            title="Delivery timeline"
            caption="Scope, risk, and milestones visible from day one."
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
              <phase.icon className="h-5 w-5 text-[#0066cc]" aria-hidden />
            </div>
            <h3 className="mt-6 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">
              {phase.title}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">
              {phase.description}
            </p>
            <div className="mt-5 h-px w-0 bg-[#0066cc] transition-all duration-500 group-hover:w-full" aria-hidden />
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
