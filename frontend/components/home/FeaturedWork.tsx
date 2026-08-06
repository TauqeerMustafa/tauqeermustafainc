"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { projects } from "@/lib/site-data";
import { Badge, Eyebrow, ImagePlaceholder, Section, useScrollReveal } from "./ui";

export default function FeaturedWork() {
  const fp = projects[0];
  const textRef = useScrollReveal<HTMLDivElement>();
  const imgRef  = useScrollReveal<HTMLDivElement>();

  return (
    <Section className="bg-[#F4F7FC]" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

        {/* Image */}
        <div ref={imgRef} className="sr anim-left tmi-corners lg:order-1">
          <ImagePlaceholder
            src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-dashboard-growth_pfmdpk.jpg"
            title="Featured operations portal"
            caption="Role-based reporting, workflow visibility, and executive decision support."
          />
        </div>

        {/* Text */}
        <div ref={textRef} className="sr anim-right lg:order-2">
          <Eyebrow>Selected Work</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl lg:text-5xl">
            {fp.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5F6673]">{fp.summary}</p>

          {/* Meta grid */}
          <dl className="mt-8 grid grid-cols-2 gap-px border border-[#D7DEE8] bg-[#D7DEE8]">
            {[
              { label: "Impact",   value: fp.impact },
              { label: "Category", value: fp.category },
            ].map((item) => (
              <div key={item.label} className="group bg-white p-5 transition hover:bg-[#F0F5FF]">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#0A46A8]">{item.label}</dt>
                <dd className="mt-2 text-sm font-medium text-[#374151]">{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* Tags */}
          {fp.tags && (
            <div className="mt-5 flex flex-wrap gap-2">
              {fp.tags.map((tag: string) => (
                <Badge key={tag} variant="blue">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/portfolio/${fp.slug}`}
              className="press inline-flex items-center gap-2 bg-[#0B5FFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(11,95,255,0.28)] transition hover:bg-[#0A46A8] hover:-translate-y-0.5"
            >
              View Case Study <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/portfolio"
              className="press inline-flex items-center gap-2 border border-[#D7DEE8] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:border-[#0B5FFF] hover:text-[#0B5FFF]"
            >
              All Projects <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
