"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Globe, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { company } from "@/data/company";
import { Eyebrow, Stat } from "./ui";

const yearsInBusiness = new Date().getFullYear() - Number(company.founded);

const heroStats = [
  { value: `${yearsInBusiness}+`, label: "Years in operation", detail: `Delivering enterprise software since ${company.founded}` },
  { value: "20+",                 label: "Countries served",   detail: "Active client engagements worldwide" },
  { value: "97%",                 label: "Client retention",   detail: "Long-term partnerships, not one-off projects" },
];

const pillars = [
  { icon: Shield, label: "Security-first delivery" },
  { icon: Zap,    label: "AI & automation" },
  { icon: Globe,  label: "Global-ready systems" },
];

/* Animated counter hook */
function useCounter(target: number, duration = 1400, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame: number;
    const begin = performance.now();
    function tick(now: number) {
      const p = Math.min((now - begin) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return val;
}

export default function Hero() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      className="tmi-grid relative overflow-hidden border-b border-[#D7DEE8] bg-gradient-to-b from-[#FAFBFF] via-white to-[#F4F7FC] pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-32"
      aria-label="Hero"
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#0B5FFF] opacity-[0.04] blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 right-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#0B5FFF] opacity-[0.03] blur-[100px]" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">

          {/* ── Left column ── */}
          <div className="text-center lg:text-left">

            {/* Badge */}
            <div className="anim-hero-badge d-0 mx-auto inline-flex items-center gap-2.5 border border-[#0B5FFF]/25 bg-white/90 px-4 py-2 shadow-sm backdrop-blur lg:mx-0">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="anim-ping absolute inline-flex h-full w-full bg-[#0B5FFF] opacity-60" />
                <span className="relative inline-flex h-2 w-2 bg-[#0B5FFF]" />
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
                TMI // Security · Compliance · Digital Systems
              </span>
            </div>

            {/* H1 */}
            <h1 className="anim-hero-h1 d-1 mt-8 text-balance text-5xl font-semibold leading-[1.04] tracking-tight text-[#0A1628] sm:text-6xl lg:text-[70px]">
              Technology systems built for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#0B5FFF]">serious</span>
                <span
                  className="anim-line absolute -bottom-1 left-0 right-0 h-1 bg-[#0B5FFF] d-3"
                  aria-hidden
                />
              </span>{" "}
              business outcomes.
            </h1>

            {/* Body */}
            <p className="anim-hero-body d-2 mx-auto mt-8 max-w-2xl text-pretty text-lg leading-8 text-[#5F6673] lg:mx-0 xl:text-xl">
              We help organizations build, modernize, and maintain secure, scalable,
              and intelligent software systems that drive measurable business growth —
              across AI automation, cybersecurity, and brand identity.
            </p>

            {/* Pillars */}
            <div className="anim-hero-body d-3 mx-auto mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {pillars.map((p) => (
                <div key={p.label} className="flex items-center gap-2 border border-[#D7DEE8] bg-white/90 px-3 py-1.5 text-sm font-medium text-[#374151] shadow-sm backdrop-blur transition hover:border-[#0B5FFF]">
                  <p.icon className="h-3.5 w-3.5 text-[#0B5FFF]" aria-hidden />
                  {p.label}
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div className="anim-hero-buttons d-4 mx-auto mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/contact"
                className="press anim-glow inline-flex min-h-13 items-center gap-2 bg-[#0B5FFF] px-7 text-base font-semibold text-white shadow-[0_8px_28px_rgba(11,95,255,0.30)] transition hover:bg-[#0A46A8] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(11,95,255,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A46A8]"
              >
                Start a Conversation <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/portfolio"
                className="press inline-flex min-h-13 items-center gap-2 border border-[#0A1628] px-7 text-base font-semibold text-[#0A1628] transition hover:bg-[#0A1628] hover:text-white hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A46A8]"
              >
                View Our Work
              </Link>
            </div>
          </div>

          {/* ── Right: image card ── */}
          <div className="anim-hero-image d-2 hidden lg:block">
            <div className="tmi-corners relative overflow-hidden border border-[#D7DEE8] shadow-[0_32px_80px_rgba(10,22,40,0.14)]">
              <div className="relative aspect-[4/3]">
                <Image
                  src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-globe_qob1ag.jpg"
                  alt="Global-ready delivery"
                  fill
                  sizes="40vw"
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/70 via-[#0A1628]/15 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-lg font-semibold">Global-ready delivery</p>
                <p className="mt-1 text-sm text-white/75">Secure systems designed to operate across markets and time zones.</p>
              </div>
              {/* floating badges */}
              <div className="absolute right-4 top-4 border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                🌍 20+ Countries
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div ref={statsRef} className="mt-14 grid gap-px border border-[#D7DEE8] bg-[#D7DEE8] sm:grid-cols-3">
          {heroStats.map((s, i) => (
            <div
              key={s.label}
              className={`anim-hero-stat bg-white/90 px-6 py-6 backdrop-blur d-${i + 4}`}
            >
              <div className="tmi-corners relative">
                <Stat value={statsVisible ? s.value : "—"} label={s.label} detail={s.detail} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
