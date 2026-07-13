"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const capabilities = [
  "Secure web platforms",
  "AI automation",
  "Enterprise delivery",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-medium text-teal-200">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Enterprise digital engineering partner
          </span>

          <h1 className="mt-8 max-w-5xl text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
            Secure, scalable digital products for ambitious enterprises.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            Tauqeer Mustafa Inc. designs and builds high-performance web
            platforms, cybersecurity programs, and AI automation systems that
            help modern organizations operate with confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Start a Project
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-bold text-white transition hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Explore Services
            </Link>
          </div>

          <dl className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
            {capabilities.map((item) => (
              <div key={item} className="border-l border-teal-300/40 pl-4">
                <dt className="text-sm font-semibold text-white">{item}</dt>
                <dd className="mt-1 text-sm text-slate-400">
                  Built for production teams
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
          className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-teal-950/20 backdrop-blur"
          aria-label="Enterprise delivery metrics"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div>
              <p className="text-sm text-slate-400">Delivery Command Center</p>
              <p className="mt-1 text-2xl font-bold text-white">Live Readiness</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Operational
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {[
              ["Architecture", "Cloud-ready platform blueprint", "96%"],
              ["Security", "Risk controls and hardening", "99%"],
              ["Automation", "Workflow intelligence coverage", "88%"],
            ].map(([label, description, value]) => (
              <div key={label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-white">{label}</p>
                    <p className="mt-1 text-slate-400">{description}</p>
                  </div>
                  <span className="font-bold text-teal-200">{value}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-400"
                    style={{ width: value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
