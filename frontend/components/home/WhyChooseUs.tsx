"use client";

import { Gauge, Lock, Network, Users } from "lucide-react";
import { MStripe, Section } from "./ui";

/* ── bg-surface-2 tile — BMW M uppercase display, theme-flipping ── */

const reasons = [
  { title: "Security designed in, not added later",         description: "Threat modeling happens during discovery, not after launch. Security controls are embedded in the architecture — authentication flows, data handling, access boundaries — so they don't break under real load.",                icon: Lock,    num: "01" },
  { title: "Direct access to the founder on every project", description: "Tauqeer leads every engagement from scoping through deployment. The person who makes architecture decisions is the same person who writes the code and reviews the security posture. No layers, no handoffs.",  icon: Users,   num: "02" },
  { title: "Five disciplines under one roof",               description: "Web engineering, cybersecurity, AI automation, cloud infrastructure, and product design delivered by one team that understands how those capabilities need to interact. No vendor coordination overhead.", icon: Gauge,   num: "03" },
  { title: "Clear scope, honest pricing",                   description: "Fixed-scope engagements with transparent timelines. You pay for the actual work — engineering, security reviews, infrastructure setup — not enterprise markup or account management overhead.",                      icon: Network, num: "04" },
];

export default function WhyChooseUs() {
  return (
    <Section className="bg-surface-2" labelledBy="why-title">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <MStripe />
          <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Why TMI
          </p>
          <h2
            id="why-title"
            className="mt-4 text-[34px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink sm:text-[44px] lg:text-[52px]"
          >
            Built differently. For a reason.
          </h2>
          <p className="mt-6 text-[17px] font-light leading-[1.6] tracking-[-0.01em] text-ink/60 sm:text-[18px]">
            Most agencies either lack security expertise or treat it as a separate audit phase. Most freelancers
            can&apos;t handle the full stack — frontend, backend, infrastructure, threat modeling, and UX — as one
            coherent system. TMI exists because those gaps create real operational risk. We deliver all five
            disciplines with the technical depth they require, led by someone who&apos;s built production systems
            that had to survive real threats and real load.
          </p>
        </div>

        <div className="grid gap-0">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group relative border-b border-ink/10 py-7 transition-colors first:border-t hover:bg-ink/[0.03]"
            >
              {/* BMW hover accent rail */}
              <span
                className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-action transition-transform duration-500 group-hover:scale-y-100"
                aria-hidden
              />
              <div className="flex items-start gap-5 pl-0 sm:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line/15 bg-ink/[0.05] text-action transition-colors group-hover:border-action/50 group-hover:bg-action/10">
                  <reason.icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/35">
                    {reason.num}
                  </span>
                  <h3 className="mt-2 text-[17px] font-bold uppercase leading-[1.25] tracking-[0.01em] text-ink sm:text-[18px]">
                    {reason.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] font-light leading-[1.6] tracking-[-0.01em] text-ink/55 sm:text-[15px]">
                    {reason.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
