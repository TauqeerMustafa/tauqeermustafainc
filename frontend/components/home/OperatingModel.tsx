"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Hammer, ShieldCheck, Telescope } from "lucide-react";
import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, MStripe, Reveal, Section, fadeLeft, fadeUp, stagger, viewportOnce } from "./ui";

/* ── Mastercard cream counterpoint tile, BMW precision phase grid ── */

const phases = [
  { step: "01", title: "Discover", description: "What problem are we solving? What systems already exist? What risks actually matter? Discovery maps constraints before any architecture decisions are made.", icon: Telescope },
  { step: "02", title: "Plan",     description: "Design for the operational reality the system will face. Document security requirements, infrastructure tradeoffs, and the actual scope that fits the timeline.", icon: ClipboardCheck },
  { step: "03", title: "Build",    description: "Incremental delivery with testable milestones. Security and infrastructure work happen in parallel with features, not after. Regular check-ins keep progress visible.", icon: Hammer },
  { step: "04", title: "Support",  description: "Systems ship with runbooks, monitoring baselines, and post-launch support. The work doesn't end at deployment — it ends when the system runs stably in production.", icon: ShieldCheck },
];

export default function OperatingModel() {
  return (
    <Section className="bg-[#f3f0ee]" labelledBy="operating-model-title">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <Reveal variant={fadeLeft}>
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066b1]">
            How We Work
          </p>
          <h2
            id="operating-model-title"
            className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-[#141413] sm:text-[44px] lg:text-[48px]"
          >
            A clear process, built for delivery.
          </h2>
          <p className="mt-6 text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-[#5a5a5a] sm:text-[18px]">
            Every engagement follows the same structure: discover the actual constraints, plan for what the system
            will face in production, build in testable increments with security embedded from the start, then support
            the deployment until it runs stably. The timeline scales to the scope, but the phases stay consistent —
            whether it&apos;s an 8-week authentication rebuild or a 16-week operational platform.
          </p>
        </Reveal>

        <div className="hidden lg:block">
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
        className="mt-16 grid gap-px border border-[#ddd8d3] bg-[#ddd8d3] sm:grid-cols-2 lg:grid-cols-4"
      >
        {phases.map((phase) => (
          <motion.article
            key={phase.step}
            variants={fadeUp}
            className="group relative overflow-hidden bg-white p-7 transition-colors duration-300 hover:bg-[#faf9f8]"
          >
            {/* BMW hover accent rail */}
            <span
              className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-[#1c69d4] transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden
            />
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d8d4d1] bg-[#f3f0ee] font-mono text-[12px] font-bold text-[#141413] transition-colors group-hover:border-[#1c69d4] group-hover:bg-[#1c69d4] group-hover:text-white">
                {phase.step}
              </div>
              <phase.icon className="h-5 w-5 text-[#0066b1]" aria-hidden />
            </div>
            <h3 className="mt-7 text-[17px] font-bold uppercase leading-[1.25] tracking-[0.02em] text-[#141413]">
              {phase.title}
            </h3>
            <p className="mt-3 text-[14px] font-light leading-[1.6] tracking-[-0.01em] text-[#5a5a5a]">
              {phase.description}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  );
}
