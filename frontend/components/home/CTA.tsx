"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { company } from "@/data/company";
import { Reveal, scaleIn } from "./ui";

export default function CTA() {
  return (
    /* BMW M dark canvas with M-stripe accent */
    <section className="bg-[#1a2129] px-5 py-20 sm:px-6 sm:py-24 lg:py-32">
      <Reveal variant={scaleIn} className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d] px-8 py-12 text-center shadow-2xl sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          {/* M-stripe top accent */}
          <div className="absolute left-0 right-0 top-0 flex h-1">
            <span className="flex-1 bg-[#0066b1]" />
            <span className="flex-1 bg-[#1c69d4]" />
            <span className="flex-1 bg-[#e22718]" />
          </div>

          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1c69d4]">
            Start a Conversation
          </p>

          <h2 className="mt-5 text-balance text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-white sm:text-[42px] lg:text-[48px]">
            Have a project or a risk you need eyes on?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-white/65 sm:text-[18px]">
            Tell us what you&apos;re building or defending. We&apos;ll tell you plainly whether
            we&apos;re the right team for it — no pressure, no sales pitch.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex w-full items-center justify-center gap-2 bg-[#1c69d4] px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0066b1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] sm:w-auto"
            >
              Get a Quote
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href={`mailto:${company.email}`}
              className="inline-flex w-full items-center justify-center gap-2 border-2 border-white/25 bg-transparent px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-white/50 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden /> Email Us
            </Link>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 text-[14px] font-light text-white/50 sm:flex-row sm:gap-8">
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-2 transition-colors hover:text-[#1c69d4]"
            >
              <Mail className="h-4 w-4" aria-hidden /> {company.email}
            </a>
            <a
              href={`tel:${company.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 transition-colors hover:text-[#1c69d4]"
            >
              <Phone className="h-4 w-4" aria-hidden /> {company.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
