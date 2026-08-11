"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { company } from "@/data/company";
import { Eyebrow, Reveal, scaleIn } from "./ui";

export default function CTA() {
  return (
    <section className="tmi-dot-grid bg-white px-5 py-16 sm:px-6 sm:py-20 lg:py-28">
      <Reveal variant={scaleIn} className="mx-auto max-w-4xl">
        <div className="tmi-corners relative overflow-hidden border border-[#262626] bg-[#171717] p-8 text-center shadow-[0_24px_64px_rgba(0,0,0,0.18)] sm:p-12 lg:p-16">
          <Eyebrow light>Start a Conversation</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Have a project or a risk you need eyes on?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/60">
            Tell us what you are building or defending. We will tell you plainly whether
            we are the right team for it — no pressure, no sales pitch.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="press inline-flex min-h-13 items-center gap-2 bg-white px-8 text-base font-semibold text-[#0A0A0A] shadow-[0_8px_24px_rgba(255,255,255,0.12)] transition hover:bg-white/90 hover:-translate-y-0.5"
            >
              Contact Us <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={`mailto:${company.email}`}
              className="press inline-flex min-h-13 items-center gap-2 border border-white/30 px-8 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" aria-hidden /> Email us directly
            </Link>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-white/15 pt-8 sm:flex-row sm:gap-8 text-sm text-white/60">
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 transition hover:text-white">
              <Mail className="h-4 w-4" aria-hidden /> {company.email}
            </a>
            <a href={`tel:${company.phone}`} className="flex items-center gap-2 transition hover:text-white">
              <Phone className="h-4 w-4" aria-hidden /> {company.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
