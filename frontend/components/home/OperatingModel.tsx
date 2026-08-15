"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Hammer, ShieldCheck, Telescope } from "lucide-react";
import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, Reveal, Section, fadeLeft, fadeUp, stagger, viewportOnce } from "./ui";

const phases = [
  { step: "01", title: "Discover", description: "Map the business problem, current systems, and risk exposure before any implementation begins.", icon: Telescope },
  { step: "02", title: "Plan",     description: "Architecture, security requirements, and tradeoffs are documented so every delivery decision has a clear reason.", icon: ClipboardCheck },
  { step: "03", title: "Build",    description: "Engineering and security controls proceed together in reviewable increments with regular check-ins.", icon: Hammer },
  { step: "04", title: "Support",  description: "Systems ship with documentation, monitoring, and post-launch support to keep them maintainable.", icon: ShieldCheck },
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
            Four phases across every engagement: understand the problem, design for the constraints,
            build in testable increments, then support what we ship. The same structure whether
            you&apos;re a solo founder or a distributed team.
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
