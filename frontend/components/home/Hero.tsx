"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* ── Clean Editorial Hero — pure monochrome canvas, M-stripe signature, zero images, zero tints ── */

export default function Hero() {
  return (
    /* bg-canvas: pure black in dark mode, pure cream in light mode */
    <section className="relative overflow-hidden bg-canvas px-5 pb-16 pt-20 sm:px-6 sm:pt-28 sm:pb-24 lg:pt-32" aria-label="Hero">
      {/* M-stripe — signature brand element at top (literal tricolor — never theme-flipped) */}
      <div className="absolute left-0 right-0 top-0 m-stripe" />

      <div className="relative mx-auto max-w-[1200px]">

        {/* ── Centre stack ── */}
        <div className="flex flex-col items-center text-center">

          {/* Display headline — Bold UPPERCASE, tight tracking */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl text-[44px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[60px] lg:text-[76px]"
          >
            Systems that scale.
            <br />
            Security that ships.
          </motion.h1>

          {/* Body copy — tight beneath headline with no large empty gap */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-2xl text-[17px] font-light leading-[1.55] tracking-[-0.01em] text-ink/75 sm:text-[18px]"
          >
            We build production-ready platforms for businesses that can&apos;t afford downtime.
            Web engineering, AI automation, cloud infrastructure, and security — delivered
            as one integrated team.
          </motion.p>

          {/* CTAs — clean rectangular utility buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 bg-action px-8 py-3.5 text-[14px] font-bold uppercase tracking-[0.06em] text-on-action transition-all hover:bg-action-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:w-auto"
            >
              Start a Project
            </Link>
            <Link
              href="/services"
              className="inline-flex w-full items-center justify-center gap-2 border-2 border-ink/20 bg-transparent px-8 py-3.5 text-[14px] font-bold uppercase tracking-[0.06em] text-ink transition-all hover:border-ink/40 hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
            >
              Explore Services <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
