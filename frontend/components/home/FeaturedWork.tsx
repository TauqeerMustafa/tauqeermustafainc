"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { ImagePlaceholder, Reveal, Section, fadeLeft, fadeRight } from "./ui";

export default function FeaturedWork() {
  return (
    /* Parchment tile — light alternate canvas */
    <Section className="bg-[#f5f5f7]" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        <Reveal variant={fadeLeft} className="lg:order-1">
          <div className="overflow-hidden">
            <ImagePlaceholder
              src={imageLibrary.dashboard[1]}
              title="tauqeermustafa.tech — built by TMI"
              caption="Next.js 16 · FastAPI · Supabase Postgres · Deployed 2026"
            />
          </div>
        </Reveal>

        <Reveal variant={fadeRight} className="lg:order-2">
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">Our Work</p>
          <h2 id="featured-work-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            Actively building with our first clients.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
            We launched in 2026 and we&apos;re working through our first client engagements.
            Full case studies will follow as work ships. For now, the most honest thing
            we can show is this site itself — built and deployed end-to-end by our team.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-[#e0e0e0] bg-[#e0e0e0]">
            {[
              { label: "Stack",    value: "Next.js 16 · FastAPI · Postgres" },
              { label: "Category", value: "Web Platform · Full-stack" },
            ].map((item) => (
              <div key={item.label} className="bg-white p-5">
                <dt className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[#0066cc]">{item.label}</dt>
                <dd className="mt-2 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Next.js", "FastAPI", "PostgreSQL", "Docker", "Render", "Vercel"].map((tech) => (
              <span key={tech} className="inline-flex items-center rounded-full border border-[#e0e0e0] bg-white px-3 py-1 text-[14px] leading-[1.29] tracking-[-0.224px] text-[#7a7a7a]">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="apple-press inline-flex items-center gap-2 rounded-full bg-[#0066cc] px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-white transition-colors hover:bg-[#0071e3]"
            >
              View Portfolio <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="apple-press inline-flex items-center gap-2 rounded-full border border-[#0066cc] bg-transparent px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-[#0066cc] transition-colors hover:bg-[#0066cc] hover:text-white"
            >
              Start a Project
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
