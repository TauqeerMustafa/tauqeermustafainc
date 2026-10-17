"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { imageLibrary } from "@/data/media";

const heroSlides = [
  {
    id: "cloud",
    number: "01",
    tag: "CLOUD INFRASTRUCTURE",
    title: "High-Availability Server Architectures",
    caption:
      "Fault-tolerant clusters, automated failover pipelines, and zero-downtime distributed networks.",
    image: imageLibrary.hero[2],
  },
  {
    id: "ai",
    number: "02",
    tag: "AI & AUTOMATION",
    title: "Autonomous Enterprise AI Systems",
    caption:
      "Production LLM orchestration, intelligent agent systems, and automated operational pipelines.",
    image: imageLibrary.services[2],
  },
  {
    id: "security",
    number: "03",
    tag: "ZERO-TRUST DEFENSE",
    title: "Hardened Security Architectures",
    caption:
      "Proactive threat surface modeling, continuous compliance auditing, and cryptographic validation.",
    image: imageLibrary.services[1],
  },
  {
    id: "web",
    number: "04",
    tag: "PRODUCTION SYSTEMS",
    title: "Mission-Critical Web Platforms",
    caption:
      "Sub-second globally edge-rendered platforms with resilient microservices and precision telemetry.",
    image: imageLibrary.hero[0],
  },
];

const AUTOPLAY_INTERVAL = 6000;

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const active = heroSlides[currentSlide];

  return (
    <section
      className="relative overflow-hidden bg-tint-blue px-5 pb-20 pt-24 sm:px-6 sm:pt-32 lg:pt-36"
      aria-label="Hero"
    >
      {/* Ambient background brand washes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-action/[0.07] blur-3xl" />
        <div className="absolute -right-32 top-24 h-[30rem] w-[30rem] rounded-full bg-signal/[0.05] blur-3xl" />
      </div>

      {/* M-stripe — signature brand element at top */}
      <div className="absolute left-0 right-0 top-0 m-stripe" />

      <div className="relative mx-auto max-w-[1240px]">
        {/* ── Center Editorial Stack ── */}
        <div className="flex flex-col items-center text-center">
          
          {/* Eyebrow Label with Mastercard Signal dot */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-ink/75"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            <span>Web Engineering · Cloud Infrastructure · Security · AI Systems</span>
          </motion.div>

          {/* Display Headline — Bold, authoritative typography */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-5xl text-[44px] font-bold uppercase leading-[1.05] tracking-[-0.025em] text-ink sm:text-[64px] lg:text-[80px]"
          >
            Systems that scale.
            <br />
            Security that ships.
          </motion.h1>

          {/* Body copy — Balanced editorial weight */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-2xl text-[17px] font-light leading-[1.65] tracking-[-0.01em] text-ink/75 sm:text-[19px]"
          >
            We build production-ready platforms for businesses that can&apos;t afford downtime.
            Web engineering, AI automation, cloud infrastructure, and security — delivered
            as one integrated team.
          </motion.p>

          {/* CTAs — BMW utility buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 bg-action px-8 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-on-action transition-all hover:bg-action-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:w-auto"
            >
              Start a Project
            </Link>
            <Link
              href="/services"
              className="group inline-flex w-full items-center justify-center gap-2 border-2 border-ink/20 bg-transparent px-8 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-ink transition-all hover:border-ink/50 hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
            >
              Explore Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </motion.div>
        </div>

        {/* ── Cinematic Rendering Showcase with Fading ── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Framed Canvas Stage with edge fading */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[32px] sm:aspect-[16/8] sm:rounded-[40px] border border-line-2/50 bg-ink-black shadow-2xl">
            
            {/* Crossfading Slide Images */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Seamless Edge Fading veils */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas via-canvas/25 to-transparent opacity-95" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-canvas/35 to-transparent" />

            {/* Slide Navigation Overlay Controls (Top Right) */}
            <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous rendering"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next rendering"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Active Slide Caption Content (Bottom Overlay) */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10">
              <div className="max-w-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-action">
                        {active.number}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-ink/70">
                        / {active.tag}
                      </span>
                    </div>
                    <h3 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl lg:text-3xl">
                      {active.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-ink/80 sm:text-base leading-relaxed">
                      {active.caption}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Editorial Pillar Navigation Bar Below Canvas ── */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {heroSlides.map((slide, idx) => {
              const isCurrent = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`group relative text-left transition-all p-3 sm:p-4 rounded-xl border ${
                    isCurrent
                      ? "border-action/40 bg-surface shadow-xs"
                      : "border-line-2/40 bg-transparent hover:border-line-2 hover:bg-surface/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isCurrent ? "text-action" : "text-ink/40 group-hover:text-ink/60"
                      }`}
                    >
                      {slide.number}
                    </span>
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-action" />
                    )}
                  </div>
                  <div
                    className={`mt-1.5 text-xs sm:text-sm font-bold tracking-tight ${
                      isCurrent ? "text-ink" : "text-ink/60 group-hover:text-ink"
                    }`}
                  >
                    {slide.title}
                  </div>

                  {/* Active Slide Progress Line */}
                  {isCurrent && (
                    <motion.div
                      layoutId="activeSlideIndicator"
                      className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-action"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
