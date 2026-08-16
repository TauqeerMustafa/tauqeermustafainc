"use client";

import { CheckCircle2, Code2, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { imageLibrary } from "@/data/media";
import { ButtonLink, Reveal, Section, fadeLeft, fadeRight, stagger, viewportOnce } from "./ui";

const capabilities = [
  { title: "Web & API platforms", detail: "Next.js, React, FastAPI, PostgreSQL — production infrastructure", icon: Code2 },
  { title: "Security engineering", detail: "Threat modeling, penetration testing, compliance audits", icon: Shield },
  { title: "AI & automation", detail: "LLM integration, intelligent workflows, operational agents", icon: Sparkles },
];

const principles = [
  "Every system architected with security from the start",
  "Senior engineers on every engagement — no junior outsourcing",
  "Clear scope, honest timelines, no hidden fees",
  "Direct communication — no account managers",
];

const miniStats = [
  { value: "3+",      label: "Core services" },
  { value: "PK",      label: "Headquarters" },
  { value: "24/7",    label: "Uptime focus" },
];

export default function AboutPreview() {
  return (
    /* Parchment tile */
    <Section className="bg-[#f5f5f7]" labelledBy="about-title">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-start lg:gap-20">

        <Reveal variant={fadeLeft} className="order-2 lg:order-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-[18px]">
                <img
                  src={imageLibrary.hero[1]}
                  alt="Development environment with production monitoring"
                  className="aspect-[4/3] h-full w-full object-cover"
                  style={{ boxShadow: "rgba(0,0,0,0.12) 0px 4px 24px" }}
                />
              </div>
              <div className="overflow-hidden rounded-[18px]">
                <img
                  src={imageLibrary.services[2]}
                  alt="AI and neural network architecture"
                  className="aspect-[4/3] h-full w-full object-cover"
                  style={{ boxShadow: "rgba(0,0,0,0.12) 0px 4px 24px" }}
                />
              </div>
            </div>
            <div className="overflow-hidden rounded-[18px]">
              <img
                src={imageLibrary.services[3]}
                alt="Cloud infrastructure and data centers"
                className="aspect-[21/9] w-full object-cover"
                style={{ boxShadow: "rgba(0,0,0,0.12) 0px 4px 24px" }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-[#d2d2d7] overflow-hidden rounded-[18px] border border-[#d2d2d7] bg-white shadow-sm">
            {miniStats.map((s) => (
              <div key={s.label} className="px-4 py-6 text-center">
                <p className="text-[32px] font-semibold leading-[1.13] tracking-[-0.374px] text-[#1d1d1f]">{s.value}</p>
                <p className="mt-1 text-[13px] font-semibold leading-[1.38] tracking-[-0.224px] text-[#86868b]">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0066cc]/20 bg-[#0066cc]/5 px-3 py-1.5">
            <span className="text-[13px] font-semibold leading-[1.38] tracking-[-0.224px] text-[#0066cc]">
              Who We Are
            </span>
          </div>
          <h2 id="about-title" className="mt-5 text-[40px] font-semibold leading-[1.1] tracking-[-0.5px] text-[#1d1d1f] sm:text-[44px]">
            Built for businesses that need systems to work under pressure.
          </h2>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#6e6e73]">
            <p>
              TMI is a digital agency in Islamabad that delivers web platforms, security consulting, and AI automation
              as one integrated team. Instead of hiring three vendors who can't talk to each other, you work with senior
              engineers who understand how those capabilities need to interact — security constraints inform architecture
              from day one, infrastructure choices shape feature scope, and UX reflects the actual data model.
            </p>
            <p>
              Most projects run 8–16 weeks, from discovery through deployment. Clients work directly with the engineers
              who write the code, review the threat model, and deploy to production. No sales handoff, no account managers,
              no surprises when scope meets reality. The systems we build are designed for long-term maintenance — documented,
              tested, and structured so the next engineer (ours or yours) can understand what's happening.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={stagger(0.08)}
            className="mt-10 space-y-3"
          >
            {capabilities.map((cap) => (
              <motion.div
                key={cap.title}
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                className="flex items-start gap-4 rounded-[14px] border border-[#d2d2d7] bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc]">
                  <cap.icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-[#1d1d1f]">{cap.title}</p>
                  <p className="mt-1 text-[15px] leading-[1.4] tracking-[-0.224px] text-[#86868b]">{cap.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={stagger(0.06)}
            className="mt-8 space-y-3"
          >
            {principles.map((principle) => (
              <motion.li
                key={principle}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-start gap-3 text-[16px] leading-[1.5] tracking-[-0.224px] text-[#1d1d1f]"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#34c759]" aria-hidden />
                {principle}
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/about" variant="primary">Learn More About Us</ButtonLink>
            <ButtonLink href="/services" variant="secondary">View All Services</ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
