"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Cloud,
  Code,
} from "lucide-react";

import { imageLibrary } from "@/data/media";

const heroSlides = [
  {
    id: "cloud",
    category: "CLOUD INFRASTRUCTURE",
    title: "High-Availability Server Architectures",
    caption:
      "Fault-tolerant clusters, automated failovers, and Kubernetes orchestration engineered for zero downtime.",
    image: imageLibrary.hero[2],
    icon: Cloud,
  },
  {
    id: "ai",
    category: "AI & AUTOMATION",
    title: "Autonomous Enterprise AI Systems",
    caption:
      "Production LLM pipelines, autonomous multi-agent systems, and real-time inference workflows.",
    image: imageLibrary.services[2],
    icon: Cpu,
  },
  {
    id: "security",
    category: "CYBERSECURITY FIRST",
    title: "Zero-Trust Architecture & Threat Defense",
    caption:
      "Proactive threat modeling, continuous automated auditing, and hardened enterprise application shields.",
    image: imageLibrary.services[1],
    icon: ShieldCheck,
  },
  {
    id: "web",
    category: "WEB PLATFORMS",
    title: "Next-Gen Web Applications",
    caption:
      "Sub-second response times with resilient microservices, distributed edge caching, and precision UX.",
    image: imageLibrary.hero[0],
    icon: Code,
  },
];

const AUTOPLAY_INTERVAL = 5500;

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
      className="relative overflow-hidden bg-tint-blue px-5 pb-16 pt-24 sm:px-6 sm:pt-28 lg:pb-24 lg:pt-36"
      aria-label="Hero"
    >
      {/* Ambient background brand washes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-action/[0.08] blur-3xl" />
        <div className="absolute right-0 top-20 h-[30rem] w-[30rem] rounded-full bg-signal/[0.06] blur-3xl" />
      </div>

      {/* M-stripe — signature brand element at top */}
      <div className="absolute left-0 right-0 top-0 m-stripe" />

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          
          {/* ── Left Column: Redesigned Content & Typography ── */}
          <div className="flex flex-col items-start text-left lg:col-span-6 xl:col-span-7">
            
            {/* Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-action/25 bg-action/[0.07] px-4 py-1.5 text-xs font-semibold tracking-wider text-action shadow-xs backdrop-blur-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-action opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-action" />
              </span>
              <span className="uppercase">Enterprise Web, Cloud &amp; AI</span>
            </motion.div>

            {/* Display Headline — Refined editorial typography */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-[38px] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[54px] lg:text-[62px] xl:text-[68px]"
            >
              Systems that scale.
              <span className="mt-2 block bg-gradient-to-r from-action via-[#0d59c4] to-[#cf4500] bg-clip-text text-transparent dark:from-[#3b82f6] dark:via-[#60a5fa] dark:to-[#f97316]">
                Security that ships.
              </span>
            </motion.h1>

            {/* Subtitle / Body Copy — High legibility & balanced contrast */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-[16px] font-normal leading-[1.68] tracking-[-0.01em] text-ink/80 sm:text-[18px]"
            >
              We build production-ready platforms for businesses that can&apos;t afford downtime.
              Web engineering, AI automation, cloud infrastructure, and security — delivered
              as one integrated team.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-action px-8 py-4 text-[14px] font-bold uppercase tracking-[0.05em] text-on-action shadow-md transition-all hover:bg-action-strong hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                Start a Project
              </Link>
              <Link
                href="/services"
                className="group inline-flex items-center justify-center gap-2 border-2 border-ink/20 bg-surface/80 px-7 py-4 text-[14px] font-bold uppercase tracking-[0.05em] text-ink backdrop-blur-xs transition-all hover:border-ink/50 hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Explore Services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </motion.div>

            {/* Trust Metrics Pill Strip */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3 border-t border-line-2/40 pt-6"
            >
              <div>
                <div className="text-xl font-bold tracking-tight text-ink sm:text-2xl">99.99%</div>
                <div className="mt-0.5 text-xs font-medium text-ink/65">Uptime SLA</div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Zero-Trust</div>
                <div className="mt-0.5 text-xs font-medium text-ink/65">Security Core</div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-ink sm:text-2xl">Autonomous</div>
                <div className="mt-0.5 text-xs font-medium text-ink/65">AI Pipelines</div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column: Interactive Rendering Showcase Slideshow ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:col-span-6 xl:col-span-5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-line-2/50 bg-ink-black shadow-2xl sm:aspect-[16/11]">
              
              {/* Animated Slides */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={active.image}
                    alt={active.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                    priority
                    className="object-cover"
                  />
                  {/* Subtle darkening gradient overlays for text readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                </motion.div>
              </AnimatePresence>

              {/* Top Meta Bar */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-md">
                  {(() => {
                    const IconComponent = active.icon;
                    return <IconComponent className="h-3.5 w-3.5 text-action" aria-hidden />;
                  })()}
                  <span>{active.category}</span>
                </div>

                <div className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-mono font-medium text-white/90 backdrop-blur-md">
                  0{currentSlide + 1} / 0{heroSlides.length}
                </div>
              </div>

              {/* Bottom Caption & Controls */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {active.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-white/80 sm:text-sm leading-relaxed line-clamp-2">
                      {active.caption}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Bar & Indicators */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/15">
                  {/* Slide Indicators */}
                  <div className="flex items-center gap-1.5">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                        className={`h-1.5 transition-all rounded-full ${
                          idx === currentSlide
                            ? "w-7 bg-white"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Previous / Next Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous slide"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next slide"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
