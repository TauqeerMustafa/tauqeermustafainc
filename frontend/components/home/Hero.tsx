"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { imageLibrary } from "@/data/media";

const heroStats = [
  { value: "5",      label: "Service lines",   detail: "Web, security, AI, cloud, and product design." },
  { value: "Sec+",   label: "Security-first",  detail: "Security built into every engagement from day one." },
  { value: "Direct", label: "Founder-led",     detail: "One team. Every project. No account managers." },
];

export default function Hero() {
  return (
    /* Light tile — white canvas, full-bleed */
    <section className="bg-[#ffffff] px-5 pb-[80px] pt-24 sm:px-6 sm:pt-32 lg:pt-40" aria-label="Hero">
      <div className="mx-auto max-w-[980px]">

        {/* ── Centre stack ── */}
        <div className="flex flex-col items-center text-center">

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f] sm:text-[21px] sm:leading-[1.19] sm:tracking-[0.231px]"
          >
            Tauqeer Mustafa Inc.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-4xl text-balance text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f] sm:text-[48px] sm:leading-[1.08] lg:text-[56px] lg:leading-[1.07] lg:tracking-[-0.28px]"
          >
            Engineering that ships. Security that holds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-pretty text-[19px] font-[400] leading-[1.21] tracking-[-0.374px] text-[#1d1d1f] sm:text-[21px] sm:leading-[1.19] lg:text-[28px] lg:leading-[1.14] lg:tracking-[0.196px]"
          >
            A digital agency delivering integrated web, AI, cloud, and security work for companies that need systems built to last.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href="/contact"
              className="apple-press inline-flex w-full items-center justify-center rounded-full bg-[#0066cc] px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-white transition-colors hover:bg-[#0071e3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] sm:w-auto"
            >
              Start a Project
            </Link>
            <Link
              href="/portfolio"
              className="apple-press inline-flex w-full items-center justify-center gap-1 rounded-full border border-[#0066cc] bg-transparent px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-[#0066cc] transition-colors hover:bg-[#0066cc] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] sm:w-auto"
            >
              View Our Work <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

        {/* ── Hero image — product shadow only ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 overflow-hidden sm:mt-16"
        >
          <div className="relative aspect-[4/3] sm:aspect-[16/9]">
            <Image
              src={imageLibrary.hero[2]}
              alt="TMI — digital agency, Islamabad"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 980px"
              priority
              className="object-cover"
              style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#1d1d1f] backdrop-blur-sm sm:px-4 sm:text-[14px]">
                Islamabad
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Stats bar ── */}
        <div className="mt-10 grid grid-cols-1 divide-y divide-[#e0e0e0] border-t border-[#e0e0e0] sm:mt-12 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {heroStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 py-6 text-center sm:px-6 sm:py-8"
            >
              <div className="text-[32px] font-semibold leading-[1.13] tracking-[-0.374px] text-[#1d1d1f] sm:text-[40px] sm:leading-[1.1]">{s.value}</div>
              <div className="mt-1 text-[15px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f] sm:text-[17px]">{s.label}</div>
              <div className="mt-1 text-[13px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a] sm:text-[14px]">{s.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
