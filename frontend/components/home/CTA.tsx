"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { company } from "@/data/company";
import { Eyebrow, useScrollReveal } from "./ui";

export default function CTA() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section className="tmi-dot-grid bg-white px-5 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div ref={ref} className="sr anim-scale mx-auto max-w-4xl">
        <div className="tmi-corners relative overflow-hidden border border-[#1B2A45] bg-[#0A1628] p-8 text-center shadow-[0_32px_80px_rgba(10,22,40,0.30)] sm:p-12 lg:p-16">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0B5FFF] opacity-10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-[#0B5FFF] opacity-10 blur-3xl" aria-hidden />

          <Eyebrow light>Start a Conversation</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Have a project or a risk you need eyes on?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-zinc-300">
            Tell us what you are building or defending. We will tell you plainly whether
            we are the right team for it — no pressure, no sales pitch.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="press anim-glow inline-flex min-h-13 items-center gap-2 bg-[#0B5FFF] px-8 text-base font-semibold text-white shadow-[0_8px_28px_rgba(11,95,255,0.40)] transition hover:bg-[#0A46A8] hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(11,95,255,0.50)]"
            >
              Contact Us <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={`mailto:${company.email}`}
              className="press inline-flex min-h-13 items-center gap-2 border border-white/25 px-8 text-base font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10 hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" aria-hidden /> Email us directly
            </Link>
          </div>

          {/* Quick contact row */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:gap-8 text-sm text-zinc-400">
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 transition hover:text-white">
              <Mail className="h-4 w-4" aria-hidden /> {company.email}
            </a>
            <a href={`tel:${company.phone}`} className="flex items-center gap-2 transition hover:text-white">
              <Phone className="h-4 w-4" aria-hidden /> {company.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
