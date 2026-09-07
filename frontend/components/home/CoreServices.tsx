"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

import { services } from "@/lib/site-data";
import { MStripe, Reveal, Section, fadeLeft, fadeRight } from "./ui";

/* ── bg-surface-2 tile — BMW M precision ledger, theme-flipping ── */

const tags = ["WEB", "SEC", "AI", "CLOUD", "UX"];

export default function CoreServices() {
  return (
    <Section className="bg-surface-2" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

        <Reveal variant={fadeLeft} className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <MStripe />
            <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
              Core Services
            </p>
            <h2
              id="core-services-title"
              className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[48px]"
            >
              Five capabilities. One integrated team.
            </h2>
            <p className="mt-6 text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink/60 sm:text-[18px]">
              From secure authentication flows to production-grade infrastructure, we deliver systems that handle
              operational load. Web platforms built for maintainability. Security audits that catch real threats.
              Cloud architecture designed for the workload you&apos;ll actually run, not the demo that launched.
            </p>
            <div className="mt-9">
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 bg-action px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-on-action transition-colors hover:bg-action-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                All Services
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="lg:col-span-7">
          {services.map((service, index) => (
            <motion.article
              key={service.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border-t border-ink/10 px-2 py-10 transition-colors duration-300 first:border-t-0 hover:bg-ink/[0.03] sm:px-5"
            >
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center rounded-full border border-ink/15 bg-ink/[0.06] px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/70">
                    {tags[index] ?? "TMI"}
                  </span>
                  <h3 className="mt-4 text-[24px] font-bold uppercase leading-[1.15] tracking-[-0.01em] text-ink sm:text-[28px]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[16px] font-light leading-[1.6] tracking-[-0.01em] text-ink/60 sm:text-[17px]">
                    {service.shortDescription}
                  </p>
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {service.outcomes.slice(0, 4).map((outcome) => (
                      <li
                        key={outcome}
                        className="flex items-start gap-2.5 text-[15px] font-light leading-[1.55] tracking-[-0.01em] text-ink/85"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href={`/services/${service.slug}`}
                      className="group/link inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-action transition-colors hover:text-ink"
                    >
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" aria-hidden />
                    </Link>
                  </div>
                </div>
                <span
                  className="shrink-0 select-none text-[52px] font-bold leading-[1] tracking-[-0.02em] text-ink/[0.06] transition-colors group-hover:text-ink/[0.12] sm:text-[64px]"
                  aria-hidden
                >
                  0{index + 1}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-action transition-all duration-500 group-hover:w-full" aria-hidden />
            </motion.article>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
