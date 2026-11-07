"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-white pt-28 pb-20 text-center sm:pt-36 sm:pb-28 border-b border-zinc-100" aria-label="Hero">
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-mono font-medium text-zinc-700 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          <span>Qorlune LLC · Enterprise Technology Partner</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl">
          A technology partner for the enterprise.
        </h1>
        <p className="mt-8 text-lg sm:text-xl font-normal leading-relaxed text-zinc-600 max-w-3xl mx-auto">
          We help organizations build, modernize, and maintain secure,
          scalable, and intelligent software systems that drive measurable
          business growth.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Start a Conversation
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Explore Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
