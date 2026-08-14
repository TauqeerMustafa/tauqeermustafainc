"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

import { services } from "@/lib/site-data";
import { BadgeMuted, Eyebrow, Reveal, Section, fadeLeft, fadeRight } from "./ui";

const tags = ["WEB", "SEC", "AI", "CLOUD", "UX"];

export default function CoreServices() {
  return (
    <Section className="bg-gradient-to-b from-[#161821] to-[#1A1D2E]" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

        <Reveal variant={fadeLeft} className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 shrink-0 bg-[#38BDF8]" aria-hidden />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0E7FF]">Core Services</span>
            </div>
            <h2 id="core-services-title" className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              A capable partner for your next digital project.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#C7D2FE]">
              We help small businesses and startups plan, build, and ship secure software —
              five focused service lines, delivered by a team that actually cares.
            </p>
            <div className="mt-8">
              <Link href="/services" className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#38BDF8]/30 hover:bg-white/10 hover:-translate-y-1">
                All Services <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
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
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-7 backdrop-blur-sm transition-all duration-300 first:border-t mb-4 hover:border-[#38BDF8]/30 hover:shadow-[0_16px_48px_rgba(56,189,248,0.15)]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.08),transparent_70%)] transition-opacity duration-300 group-hover:opacity-100" aria-hidden />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-semibold text-[#38BDF8]">
                    {tags[index] ?? "TMI"}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#C7D2FE]">
                    {service.shortDescription}
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.outcomes.slice(0, 4).map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-white">
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#38BDF8]" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href={`/services/${service.slug}`}
                      className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-[#38BDF8] hover:text-[#60C9FF]"
                    >
                      Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" aria-hidden />
                    </Link>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-5xl font-bold text-white/5 transition-colors group-hover:text-white/10 select-none" aria-hidden>
                  0{index + 1}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#38BDF8] to-[#818CF8] transition-all duration-500 group-hover:w-full" aria-hidden />
            </motion.article>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
