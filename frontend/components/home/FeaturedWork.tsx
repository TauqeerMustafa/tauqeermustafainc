"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { projects } from "@/lib/site-data";
import { BadgeMuted, Eyebrow, ImagePlaceholder, Reveal, Section, fadeLeft, fadeRight } from "./ui";

export default function FeaturedWork() {
  const fp = projects[0];

  return (
    <Section className="bg-[#FAFAFA]" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        <Reveal variant={fadeLeft} className="tmi-corners lg:order-1">
          <ImagePlaceholder
            src={imageLibrary.dashboard[1]}
            title="Featured operations portal"
            caption="Role-based reporting, workflow visibility, and executive decision support."
          />
        </Reveal>

        <Reveal variant={fadeRight} className="lg:order-2">
          <Eyebrow>Selected Work</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] sm:text-4xl lg:text-5xl">
            {fp.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#525252]">{fp.summary}</p>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-[#E5E5E5] bg-[#E5E5E5]">
            {[
              { label: "Impact",   value: fp.impact },
              { label: "Category", value: fp.category },
            ].map((item) => (
              <div key={item.label} className="group bg-white p-5 transition hover:bg-[#FAFAFA]">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0A0A0A]">{item.label}</dt>
                <dd className="mt-2 text-sm font-medium text-[#171717]">{item.value}</dd>
              </div>
            ))}
          </dl>

          {fp.technologies && (
            <div className="mt-5 flex flex-wrap gap-2">
              {fp.technologies.map((tech: string) => (
                <BadgeMuted key={tech}>{tech}</BadgeMuted>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/portfolio/${fp.slug}`}
              className="press inline-flex items-center gap-2 bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.20)] transition hover:bg-[#262626] hover:-translate-y-0.5"
            >
              View Case Study <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/portfolio"
              className="press inline-flex items-center gap-2 border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold text-[#171717] transition hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            >
              All Projects <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
