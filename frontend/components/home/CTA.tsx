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

          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2997ff]">
            Start a Conversation
          </p>

          <h2 className="mt-5 text-balance text-[36px] font-semibold leading-[1.11] tracking-[-0.5px] text-white sm:text-[44px] lg:text-[52px]">
            Have a project or a risk you need eyes on?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[17px] leading-[1.47] tracking-[-0.374px] text-[#bbbbbb]">
            Tell us what you're building or defending. We'll tell you plainly whether
            we're the right team for it — no pressure, no sales pitch.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-8 py-3.5 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-white shadow-lg shadow-[#0066cc]/25 transition-all hover:bg-[#0055b3] hover:shadow-xl hover:shadow-[#0066cc]/30"
            >
              Contact Us <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={`mailto:${company.email}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 bg-transparent px-8 py-3.5 text-[17px] font-semibold leading-[1.29] tracking-[-0.374px] text-white transition-all hover:border-white/40 hover:bg-white/10"
            >
              <Mail className="h-4 w-4" aria-hidden /> Email us directly
            </Link>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 text-[14px] text-[#6e6e73] sm:flex-row sm:gap-8">
            <a
              href={`mailto:${company.email}`}
              className="flex items-center gap-2 transition hover:text-[#2997ff]"
            >
              <Mail className="h-4 w-4" aria-hidden /> {company.email}
            </a>
            <a
              href={`tel:${company.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 transition hover:text-[#2997ff]"
            >
              <Phone className="h-4 w-4" aria-hidden /> {company.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
