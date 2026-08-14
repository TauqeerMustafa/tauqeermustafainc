"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { company } from "@/data/company";
import { imageLibrary } from "@/data/media";
import { Stat } from "./ui";

const heroStats = [
  { value: "2026",  label: "Founded · Islamabad",  detail: "A new agency, built with care. Growing, learning, honest." },
  { value: "Sec↑",  label: "Security-first",        detail: "Every project is reviewed with a security mindset from day one." },
  { value: "1:1",   label: "Founder-led",            detail: "Tauqeer is on every project. Direct access, no middlemen." },
];

const pillars = [
  { icon: Shield, label: "Security-first delivery" },
  { icon: Zap,    label: "AI & automation" },
  { icon: Globe,  label: "Globally available" },
];

export default function Hero() {

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#0F0F14] via-[#161821] to-[#1A1D2E] pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40"
      aria-label="Hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.06),transparent_50%)]" aria-hidden />
      <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '32px 32px'}} aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">

          {/* ── Left column ── */}
          <div className="text-center lg:text-left">

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm lg:mx-0"
            >
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="anim-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#38BDF8]" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0E7FF]">
                Web · Security · AI · Design
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-balance text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[72px]"
              style={{textShadow: '0 2px 24px rgba(0,0,0,0.4)'}}
            >
              Digital products built{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">secure</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left" }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#38BDF8] to-[#818CF8] blur-sm"
                  aria-hidden
                />
              </span>{" "}
              from the ground up.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-8 text-[#C7D2FE] lg:mx-0 xl:text-xl"
            >
              A founder-led digital agency in Islamabad, Pakistan. We help small businesses and startups build web platforms, secure systems, and AI-powered tools that actually work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              {pillars.map((p) => (
                <div key={p.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#E0E7FF] backdrop-blur-sm transition hover:border-[#38BDF8]/30 hover:bg-white/10">
                  <p.icon className="h-4 w-4 text-[#38BDF8]" aria-hidden />
                  {p.label}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link
                href="/contact"
                className="group inline-flex min-h-14 items-center gap-2 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#818CF8] px-8 text-base font-semibold text-white shadow-[0_8px_32px_rgba(56,189,248,0.35)] transition hover:shadow-[0_16px_48px_rgba(56,189,248,0.45)] hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
              >
                Start a Project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/portfolio"
                className="group inline-flex min-h-14 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                View Our Work
              </Link>
            </motion.div>
          </div>

          {/* ── Right: image card ── */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageLibrary.hero[2]}
                  alt="Built in Islamabad, 2026"
                  fill
                  sizes="40vw"
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14]/90 via-[#0F0F14]/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="text-lg font-bold">Built in 2026</p>
                <p className="mt-2 text-sm text-white/80">A lean agency from Islamabad — growing, honest, and security-minded.</p>
              </div>
              <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                Islamabad, Pakistan
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-20 grid gap-px rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-3 overflow-hidden">
          {heroStats.map((s) => (
            <div key={s.label} className="bg-gradient-to-br from-white/[0.03] to-transparent px-7 py-7 transition hover:from-white/[0.08]">
              <div className="relative">
                <Stat value={s.value} label={s.label} detail={s.detail} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
