"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { BadgeMuted, Eyebrow, ImagePlaceholder, Reveal, Section, fadeLeft, fadeRight } from "./ui";

export default function FeaturedWork() {
  return (
    <Section className="bg-gradient-to-b from-[#0F0F14] to-[#161821]" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        <Reveal variant={fadeLeft} className="lg:order-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <ImagePlaceholder
              src={imageLibrary.dashboard[1]}
              title="tauqeermustafa.tech — built by TMI"
              caption="Next.js 16 · FastAPI · Supabase Postgres · Deployed 2026"
            />
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="lg:order-2">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 shrink-0 bg-[#38BDF8]" aria-hidden />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0E7FF]">Our Work</span>
          </div>
          <h2 id="featured-work-title" className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Actively building with our first clients.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#C7D2FE]">
            We launched in 2026 and we&apos;re working through our first client engagements.
            Full case studies will follow as work ships. For now, the most honest thing
            we can show is this site itself — built and deployed end-to-end by our team.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            {[
              { label: "Stack",    value: "Next.js 16 · FastAPI · Postgres" },
              { label: "Category", value: "Web Platform · Full-stack" },
            ].map((item) => (
              <div key={item.label} className="group bg-gradient-to-br from-white/[0.03] to-transparent p-5 transition hover:from-white/[0.08]">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#38BDF8]">{item.label}</dt>
                <dd className="mt-2 text-sm font-medium text-white">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Next.js", "FastAPI", "PostgreSQL", "Docker", "Render", "Vercel"].map((tech) => (
              <span key={tech} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold text-white/70">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#818CF8] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(56,189,248,0.35)] transition hover:shadow-[0_16px_48px_rgba(56,189,248,0.45)] hover:-translate-y-1"
            >
              View Portfolio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:-translate-y-1"
            >
              Start a Project <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
