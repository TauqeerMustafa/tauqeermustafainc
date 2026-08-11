"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

import { services } from "@/lib/site-data";
import { BadgeMuted, Eyebrow, Reveal, Section, fadeLeft, fadeRight } from "./ui";

const tags = ["WEB", "SEC", "AI", "CLOUD", "UX"];

export default function CoreServices() {
  return (
    <Section className="bg-white" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

        <Reveal variant={fadeLeft} className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Eyebrow>Core Services</Eyebrow>
            <h2 id="core-services-title" className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl lg:text-5xl">
              An engineering partner for mission-critical systems.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#525252]">
              We help organizations plan, build, and modernize secure software with a focus
              on enterprise-grade reliability and long-term maintainability.
            </p>
            <div className="mt-8">
              <Link href="/services" className="press inline-flex items-center gap-2 border border-[#0A0A0A] bg-white px-5 py-3 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white">
                All Services <ArrowRight className="h-4 w-4" aria-hidden />
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
              className="group relative border-t border-[#E5E5E5] py-10 px-2 transition-all duration-300 first:border-t-0 sm:px-5"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 bg-[#FAFAFA] transition-opacity duration-300 group-hover:opacity-100" aria-hidden />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <BadgeMuted>{tags[index] ?? "TMI"}</BadgeMuted>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#0A0A0A]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#525252]">
                    {service.shortDescription}
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.outcomes.slice(0, 4).map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-[#171717]">
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#0A0A0A]" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href={`/services/${service.slug}`}
                      className="link-ul inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0A] hover:text-[#404040]"
                    >
                      Learn More <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-5xl font-bold text-[#F0F0F0] transition-colors group-hover:text-[#D4D4D4] select-none" aria-hidden>
                  0{index + 1}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0A0A0A] transition-all duration-500 group-hover:w-full" aria-hidden />
            </motion.article>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
