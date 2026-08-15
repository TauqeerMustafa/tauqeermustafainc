"use client";

import { BrainCircuit, Building2, Cloud, Layers3, ShieldCheck, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

import { imageLibrary } from "@/data/media";
import { ButtonLink, Reveal, Section, fadeLeft, fadeRight, stagger, viewportOnce } from "./ui";

const values = [
  "Security in every build — not a bolt-on",
  "Senior engineers on every engagement — no outsourcing",
  "Five integrated disciplines, one cohesive team",
  "Honest scope, honest pricing, no markup",
];

const disciplines = [
  { title: "Web & product platforms", icon: Building2 },
  { title: "AI & workflow automation", icon: BrainCircuit },
  { title: "Cybersecurity & risk",     icon: ShieldCheck },
  { title: "Cloud infrastructure",     icon: Cloud },
  { title: "UI/UX & product design",  icon: Paintbrush },
];

const miniStats = [
  { value: "5",      label: "Disciplines" },
  { value: "100%",   label: "In-house" },
  { value: "8–16w",  label: "Avg. engagement" },
];

export default function AboutPreview() {
  return (
    /* Parchment tile */
    <Section className="bg-[#f5f5f7]" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">

        <Reveal variant={fadeLeft} className="order-2 lg:order-1 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-lg">
              <img
                src={imageLibrary.services[0]}
                alt="Infrastructure & cloud architecture"
                className="h-full w-full object-cover"
                style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
              />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img
                src={imageLibrary.services[1]}
                alt="Security & compliance"
                className="h-full w-full object-cover"
                style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
              />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img
                src={imageLibrary.services[3]}
                alt="AI & automation"
                className="h-full w-full object-cover"
                style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
              />
            </div>
            <div className="overflow-hidden rounded-lg">
              <img
                src={imageLibrary.dashboard[0]}
                alt="Analytics & dashboards"
                className="h-full w-full object-cover"
                style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#e0e0e0] border border-[#e0e0e0] bg-white">
            {miniStats.map((s) => (
              <div key={s.label} className="px-4 py-5 text-center">
                <p className="text-[28px] font-semibold leading-[1.14] text-[#1d1d1f]">{s.value}</p>
                <p className="mt-0.5 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="order-1 lg:order-2">
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">About TMI</p>
          <h2 id="about-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            A digital agency built around engineering that lasts.
          </h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
            <p>
              TMI delivers web engineering, cybersecurity, AI automation, cloud infrastructure, and product design
              as a single integrated practice. Instead of coordinating five vendors, clients work with one team
              that understands how those capabilities need to interact — security constraints shape architecture decisions
              from the start, infrastructure design informs feature scope, and UX reflects the actual data model.
            </p>
            <p>
              Every engagement is staffed by senior engineers — no account managers filtering technical decisions,
              no handoffs between sales and delivery. The team that scopes your project writes the code, reviews the security
              posture, and stays available through launch. That model works for projects that need depth — authentication systems
              with real threat models, compliance dashboards that handle sensitive data correctly, operational platforms built to
              survive contact with production load.
            </p>
            <p>
              Most engagements run 8–16 weeks, from discovery through deployment and launch support. Clients typically return
              for the next phase — new features, scaling work, or security audits — because the systems were built with
              long-term maintainability in mind, not just enough to demo.
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
            <ButtonLink href="/about"    variant="primary">About Us</ButtonLink>
            <ButtonLink href="/contact"  variant="secondary">Start a Conversation</ButtonLink>
          </div>
        </Reveal>
      </div>

      {/* ── Disciplines strip ── */}
      <div className="mt-16 grid gap-px overflow-hidden border border-[#e0e0e0] bg-[#e0e0e0] sm:grid-cols-3 lg:grid-cols-5">
        {disciplines.map((d) => (
          <div key={d.title} className="group bg-white px-6 py-7 transition-colors hover:bg-[#f5f5f7]">
            <d.icon className="h-6 w-6 text-[#0066cc]" aria-hidden />
            <p className="mt-4 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">{d.title}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
