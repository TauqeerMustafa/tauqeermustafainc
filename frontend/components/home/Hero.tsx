"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Circle } from "lucide-react";

import { imageLibrary } from "@/data/media";

/* ── BMW M Hero — Dark dominant canvas, M-stripe signature, Mastercard radius ── */

const heroStats = [
  { value: "2023",     label: "Established",      detail: "Built from the ground up for modern web." },
  { value: "Zero",     label: "Outsourcing",      detail: "Every line written by our core team." },
  { value: "8–16w",    label: "Delivery cycles",  detail: "From discovery to production deployment." },
];

export default function Hero() {
  return (
    /* BMW M near-black canvas — #1a2129 */
    <section className="relative overflow-hidden bg-[#1a2129] px-5 pb-20 pt-24 sm:px-6 sm:pt-32 lg:pt-40" aria-label="Hero">
      {/* M-stripe — signature brand element at top */}
      <div className="absolute left-0 right-0 top-0 flex h-1.5">
        <span className="flex-1 bg-[#0066b1]" />
        <span className="flex-1 bg-[#1c69d4]" />
        <span className="flex-1 bg-[#e22718]" />
      </div>

      <div className="relative mx-auto max-w-[1200px]">

        {/* ── Centre stack ── */}
        <div className="flex flex-col items-center text-center">

          {/* Eyebrow badge — BMW subtle transparency */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm"
          >
            <Circle className="h-2 w-2 fill-[#1c69d4] text-[#1c69d4]" aria-hidden />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
              Islamabad-based · Globally focused
            </span>
          </motion.div>

          {/* Display headline — BMW 700 weight, UPPERCASE, tight tracking */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-5xl text-[48px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-white sm:text-[64px] lg:text-[80px]"
          >
            Systems that scale.
            <br />
            Security that ships.
          </motion.h1>

          {/* Body copy — BMW 300 weight contrast */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-2xl text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-white/70 sm:text-[19px]"
          >
            We build production-ready platforms for businesses that can't afford downtime.
            Web engineering, AI automation, cloud infrastructure, and security — delivered
            as one integrated team.
          </motion.p>

          {/* CTAs — rectangular BMW utility buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#1c69d4] px-8 py-4 text-[15px] font-bold uppercase tracking-[0.05em] text-white transition-all hover:bg-[#0066b1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] sm:w-auto"
            >
              Start a Project
            </Link>
            <Link
              href="/services"
              className="inline-flex w-full items-center justify-center gap-2 border-2 border-white/20 bg-transparent px-8 py-4 text-[15px] font-bold uppercase tracking-[0.05em] text-white transition-all hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
            >
              Explore Services <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

        {/* ── Hero image — Mastercard oversized radius (40px) ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[40px] sm:aspect-[16/9]">
            <Image
              src={imageLibrary.hero[0]}
              alt="Modern development workspace with production-grade infrastructure"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              priority
              className="object-cover"
            />
            {/* Dark gradient veil — BMW M aesthetic */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a2129]/90 via-[#1a2129]/30 to-transparent" />

            {/* Overlay badges */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2.5 border border-white/20 bg-black/50 px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-md sm:text-[14px]">
                  <span className="flex h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#34c759] opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]"></span>
                  </span>
                  Live in Production
                </span>
                <span className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80 backdrop-blur-sm sm:text-[13px]">
                  Built in Islamabad
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats bar — BMW precision grid, Mastercard radius ── */}
        <div className="mt-12 grid grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm sm:mt-16 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {heroStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="px-6 py-10 text-center"
            >
              <div className="text-[44px] font-bold leading-[1] tracking-[-0.02em] text-white sm:text-[52px]">
                {s.value}
              </div>
              <div className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1c69d4]">
                {s.label}
              </div>
              <div className="mt-2 text-[14px] font-light leading-[1.5] tracking-[-0.01em] text-white/60">
                {s.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
