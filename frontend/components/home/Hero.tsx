"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { company } from "@/data/company";
import { imageLibrary } from "@/data/media";
import { Eyebrow, Stat, fadeUp } from "./ui";

const yearsInBusiness = new Date().getFullYear() - Number(company.founded);

const heroStats = [
  { value: `${yearsInBusiness}+`, label: "Years in operation", detail: `Delivering software since ${company.founded}` },
  { value: "20+",                 label: "Countries served",   detail: "Active client engagements worldwide" },
  { value: "97%",                 label: "Client retention",   detail: "Long-term partnerships, not one-off projects" },
];

const pillars = [
  { icon: Shield, label: "Security-first delivery" },
  { icon: Zap,    label: "AI & automation" },
  { icon: Globe,  label: "Global-ready systems" },
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      className="tmi-grid relative overflow-hidden border-b border-[#E5E5E5] bg-white pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-32"
      aria-label="Hero"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">

          {/* ── Left column ── */}
          <div className="text-center lg:text-left">

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto inline-flex items-center gap-2.5 border border-[#D4D4D4] bg-white px-4 py-2 lg:mx-0"
            >
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="anim-ping absolute inline-flex h-full w-full rounded-full bg-[#0A0A0A] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0A0A0A]" />
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A0A0A]">
                TMI // Security · Compliance · Digital Systems
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-balance text-5xl font-semibold leading-[1.04] tracking-tight text-[#0A0A0A] sm:text-6xl lg:text-[68px]"
            >
              Technology systems built for{" "}
              <span className="relative inline-block">
                <span className="relative z-10">serious</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={mounted ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left" }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-[#0A0A0A]"
                  aria-hidden
                />
              </span>{" "}
              business outcomes.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-8 text-[#525252] lg:mx-0 xl:text-xl"
            >
              We help organizations build, modernize, and maintain secure, scalable,
              and intelligent software systems that drive measurable business growth —
              across AI automation, cybersecurity, and brand identity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              {pillars.map((p) => (
                <div key={p.label} className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-3 py-1.5 text-sm font-medium text-[#171717] transition hover:border-[#0A0A0A]">
                  <p.icon className="h-3.5 w-3.5 text-[#0A0A0A]" aria-hidden />
                  {p.label}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                href="/contact"
                className="press inline-flex min-h-13 items-center gap-2 bg-[#0A0A0A] px-7 text-base font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:bg-[#262626] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
              >
                Start a Conversation <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/portfolio"
                className="press inline-flex min-h-13 items-center gap-2 border border-[#0A0A0A] px-7 text-base font-semibold text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A0A0A]"
              >
                View Our Work
              </Link>
            </motion.div>
          </div>

          {/* ── Right: image card ── */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.97 }}
            animate={mounted ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="tmi-corners relative overflow-hidden border border-[#E5E5E5] shadow-[0_32px_80px_rgba(0,0,0,0.14)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageLibrary.hero[2]}
                  alt="Global-ready delivery"
                  fill
                  sizes="40vw"
                  priority
                  className="object-cover grayscale transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg font-semibold">Global-ready delivery</p>
                <p className="mt-1 text-sm text-white/70">Secure systems designed to operate across markets and time zones.</p>
              </div>
              <div className="absolute right-4 top-4 border border-white/25 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                20+ Countries
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-14 grid gap-px border border-[#E5E5E5] bg-[#E5E5E5] sm:grid-cols-3">
          {heroStats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-6">
              <div className="tmi-corners relative">
                <Stat value={s.value} label={s.label} detail={s.detail} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
