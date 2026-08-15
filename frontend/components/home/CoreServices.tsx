"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

import { services } from "@/lib/site-data";
import { Reveal, Section, fadeLeft, fadeRight } from "./ui";

const tags = ["WEB", "SEC", "AI", "CLOUD", "UX"];

export default function CoreServices() {
  return (
    /* Dark tile — near-black canvas */
    <Section className="bg-[#272729]" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

        <Reveal variant={fadeLeft} className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-white">Core Services</p>
            <h2 id="core-services-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-white">
              A capable partner for your next digital project.
            </h2>
            <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#cccccc]">
              We help small businesses and startups plan, build, and ship secure software —
              five focused service lines, delivered by a team that actually cares.
            </p>
            <div className="mt-8">
              <Link
                href="/services"
                className="apple-press inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-white transition-colors hover:bg-[#0071e3]"
              >
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
              className="group relative border-t border-white/10 py-10 px-2 transition-all duration-300 first:border-t-0 sm:px-5 hover:bg-white/[0.02]"
            >
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[14px] font-semibold tracking-[-0.224px] text-white/70">
                    {tags[index] ?? "TMI"}
                  </span>
                  <h3 className="mt-4 text-[28px] font-semibold leading-[1.14] tracking-[0.196px] text-white">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#cccccc]">
                    {service.shortDescription}
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.outcomes.slice(0, 4).map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-[17px] leading-[1.47] tracking-[-0.374px] text-white">
                        <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-[#2997ff]" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#2997ff] hover:underline"
                    >
                      Learn More <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
                <span className="shrink-0 text-[56px] font-semibold leading-[1.07] tracking-[-0.28px] text-white/5 transition-colors group-hover:text-white/10 select-none" aria-hidden>
                  0{index + 1}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0066cc] transition-all duration-500 group-hover:w-full" aria-hidden />
            </motion.article>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
