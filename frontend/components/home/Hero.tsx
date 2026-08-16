"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";

import { imageLibrary } from "@/data/media";

const heroStats = [
  { value: "2026",     label: "Established",      detail: "Built from the ground up for modern web." },
  { value: "Zero",     label: "Outsourcing",      detail: "Every line written by our core team." },
  { value: "8–16w",    label: "Delivery cycles",  detail: "From discovery to production deployment." },
];

export default function Hero() {
  return (
    /* Light tile — white canvas, full-bleed */
    <section className="bg-[#ffffff] px-5 pb-[80px] pt-24 sm:px-6 sm:pt-32 lg:pt-40" aria-label="Hero">
      <div className="mx-auto max-w-[980px]">

        {/* ── Centre stack ── */}
        <div className="flex flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[#0066cc]/20 bg-[#0066cc]/5 px-4 py-2"
          >
            <Zap className="h-4 w-4 text-[#0066cc]" aria-hidden />
            <span className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[#0066cc]">
              Islamabad-based · Globally focused
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-4xl text-balance text-[44px] font-semibold leading-[1.09] tracking-[-0.374px] text-[#1d1d1f] sm:text-[56px] sm:leading-[1.07] lg:text-[64px] lg:leading-[1.06] lg:tracking-[-0.5px]"
          >
            Systems that scale. Security that ships.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-pretty text-[19px] font-[400] leading-[1.32] tracking-[-0.374px] text-[#6e6e73] sm:text-[21px] sm:leading-[1.29] lg:text-[24px] lg:leading-[1.25]"
          >
            We build production-ready platforms for businesses that can't afford downtime. Web engineering, AI automation, cloud infrastructure, and security — delivered as one integrated team.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="apple-press inline-flex w-full items-center justify-center rounded-full bg-[#0066cc] px-6 py-3 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-white shadow-lg shadow-[#0066cc]/25 transition-all hover:bg-[#0055b3] hover:shadow-xl hover:shadow-[#0066cc]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] sm:w-auto"
            >
              Start a Project
            </Link>
            <Link
              href="/services"
              className="apple-press inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#d2d2d7] bg-transparent px-6 py-3 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-[#1d1d1f] transition-all hover:border-[#1d1d1f] hover:bg-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1d1f] sm:w-auto"
            >
              Explore Services <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

        {/* ── Hero image — refined presentation ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] sm:aspect-[16/9]">
            <Image
              src={imageLibrary.hero[0]}
              alt="Modern development workspace with production-grade infrastructure"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 980px"
              priority
              className="object-cover"
              style={{ boxShadow: "rgba(0,0,0,0.15) 0px 8px 40px, rgba(0,0,0,0.1) 0px 2px 8px" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-[14px] font-semibold text-[#1d1d1f] shadow-xl backdrop-blur-md sm:text-[15px]">
                  <span className="flex h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#34c759] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]"></span>
                  </span>
                  Live in Production
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-md sm:text-[14px]">
                  Built in Islamabad
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats bar ── */}
        <div className="mt-12 grid grid-cols-1 divide-y divide-[#d2d2d7] overflow-hidden rounded-[18px] border border-[#d2d2d7] bg-white shadow-sm sm:mt-16 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {heroStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="px-6 py-8 text-center"
            >
              <div className="text-[36px] font-semibold leading-[1.11] tracking-[-0.5px] text-[#1d1d1f] sm:text-[42px]">{s.value}</div>
              <div className="mt-2 text-[15px] font-semibold leading-[1.27] tracking-[-0.224px] text-[#0066cc] sm:text-[16px]">{s.label}</div>
              <div className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#86868b]">{s.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
