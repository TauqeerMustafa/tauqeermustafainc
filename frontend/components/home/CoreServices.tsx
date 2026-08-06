"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { services } from "@/lib/site-data";
import { Badge, Eyebrow, Section, useScrollReveal } from "./ui";

const tags = ["WEB", "SEC", "AI", "CLOUD", "UX"];
const tagVariants = ["blue", "red", "blue", "green", "gold"] as const;

export default function CoreServices() {
  const stickyRef = useScrollReveal<HTMLDivElement>();
  const listRef   = useScrollReveal<HTMLDivElement>();

  return (
    <Section className="bg-white" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

        {/* Sticky intro */}
        <div ref={stickyRef} className="sr anim-left lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Eyebrow>Core Services</Eyebrow>
            <h2 id="core-services-title" className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl lg:text-5xl">
              An engineering partner for mission-critical systems.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5F6673]">
              We help organizations plan, build, and modernize secure software with a focus
              on enterprise-grade reliability and long-term maintainability.
            </p>
            <div className="mt-8">
              <Link href="/services" className="press inline-flex items-center gap-2 border border-[#0B5FFF] bg-[#EEF4FF] px-5 py-3 text-sm font-semibold text-[#0A46A8] transition hover:bg-[#0B5FFF] hover:text-white">
                All Services <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        {/* Service list */}
        <div ref={listRef} className="sr anim-right lg:col-span-7">
          {services.map((service, index) => (
            <article
              key={service.slug}
              className={`group relative border-t border-[#D7DEE8] py-10 px-2 transition-all duration-300 first:border-t-0 sm:px-5 d-${index}`}
            >
              {/* hover bg */}
              <div className="pointer-events-none absolute inset-0 opacity-0 bg-gradient-to-r from-[#F0F5FF] to-transparent transition-opacity duration-300 group-hover:opacity-100" aria-hidden />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Badge variant={tagVariants[index] ?? "blue"}>{tags[index] ?? "TMI"}</Badge>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#0A1628]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#5F6673]">
                    {service.description}
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-[#374151]">
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#0B5FFF]" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href={`/services/${service.slug}`}
                      className="link-ul inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A1628] transition hover:text-[#0B5FFF]"
                    >
                      Learn More <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
                {/* number */}
                <span className="shrink-0 font-mono text-5xl font-bold text-[#E8EEF7] transition-colors group-hover:text-[#BFCFFF] select-none" aria-hidden>
                  0{index + 1}
                </span>
              </div>

              {/* Animated bottom line */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0B5FFF] transition-all duration-500 group-hover:w-full" aria-hidden />
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
