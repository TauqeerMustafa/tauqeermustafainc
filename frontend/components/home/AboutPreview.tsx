"use client";

import { CheckCircle2, Code2, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

import { imageLibrary } from "@/data/media";
import { ButtonLink, MStripe, Reveal, Section, fadeLeft, fadeRight, stagger, viewportOnce } from "./ui";

/* ── bg-surface tile, 24px radius imagery, BMW typography — theme-flipping ── */

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

export default function AboutPreview() {
  return (
    <Section className="bg-surface" labelledBy="about-title">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-start lg:gap-20">

        <Reveal variant={fadeLeft} className="order-2 lg:order-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-[24px]">
                <Image
                  src={imageLibrary.hero[1]}
                  alt="Development environment with production monitoring"
                  width={500}
                  height={375}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-[24px]">
                <Image
                  src={imageLibrary.services[2]}
                  alt="AI and neural network architecture"
                  width={500}
                  height={375}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[24px]">
              <Image
                src={imageLibrary.services[3]}
                alt="Cloud infrastructure and data centers"
                width={1000}
                height={428}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="aspect-[21/9] w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="order-1 lg:order-2">
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Who We Are
          </p>
          <h2
            id="about-title"
            className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[42px]"
          >
            Built for businesses that need systems to work under pressure.
          </h2>

          <div className="mt-6 space-y-5 text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink-muted">
            <p>
              TMI delivers web platforms, security consulting, and AI automation as one integrated team.
              Instead of hiring three vendors who can&apos;t talk to each other, you work with senior
              engineers who understand how those capabilities need to interact — security constraints inform
              architecture from day one, infrastructure choices shape feature scope, and UX reflects the
              actual data model.
            </p>
            <p>
              Clients work directly with the engineers who write the code, review the threat model, and deploy
              to production. No sales handoff, no account managers, no surprises when scope meets reality. The
              systems we build are designed for long-term maintenance — documented, tested, and structured so
              the next engineer (ours or yours) can understand what&apos;s happening.
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
                className="group flex items-start gap-4 rounded-[24px] border border-line bg-card p-4 transition-colors hover:border-action/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-line-2 bg-surface text-action transition-colors group-hover:border-action group-hover:bg-action group-hover:text-on-action">
                  <cap.icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-[15px] font-bold uppercase leading-[1.3] tracking-[0.02em] text-ink">
                    {cap.title}
                  </p>
                  <p className="mt-1.5 text-[14px] font-light leading-[1.5] tracking-[-0.01em] text-ink-muted">
                    {cap.detail}
                  </p>
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
                className="flex items-start gap-3 text-[15px] font-light leading-[1.55] tracking-[-0.01em] text-ink-2"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
                {principle}
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/about" variant="primary">About Us</ButtonLink>
            <ButtonLink href="/services" variant="secondary">All Services</ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
