"use client";

import { Gauge, Lock, Network, Users } from "lucide-react";
import { GlowCard, Section, SectionHeader } from "./ui";
import { IconFrame } from "./IconFrame";

const reasons = [
  { title: "Security built in from day one",                description: "Every project is reviewed with a security mindset. Secure defaults, not bolt-ons.",                                          icon: Lock,    num: "01" },
  { title: "You talk to the founder, not an account manager", description: "Tauqeer is on every project. No middlemen, no handoffs — direct line to the person doing the work.",                             icon: Users,   num: "02" },
  { title: "Fast-moving delivery",                        description: "Small team, no bureaucracy. We move fast and stay focused on what matters.",                               icon: Gauge,   num: "03" },
  { title: "Honest pricing for real businesses",            description: "No enterprise markup. You pay for the work, not the overhead — startup-friendly rates, every time.",                                icon: Network, num: "04" },
];

export default function WhyChooseUs() {
  return (
    <Section className="bg-gradient-to-b from-[#1A1D2E] to-[#0F0F14]" labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 shrink-0 bg-[#38BDF8]" aria-hidden />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E0E7FF]">Why Choose TMI</span>
          </div>
          <h2 id="why-title" className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why TMI works differently
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#C7D2FE]">
            A different way to work — and reasons it&apos;s actually better for you.
          </p>
        </div>

        <div className="grid gap-0">
          {reasons.map((reason) => (
            <GlowCard key={reason.title} className="border-t-0 border-x-0 !border-b border-white/10 first:border-t py-6 !rounded-none">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#38BDF8]">
                  <reason.icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0">
                  <span className="font-mono text-xs font-semibold text-white/50">{reason.num}</span>
                  <h3 className="mt-1 text-lg font-bold text-white">{reason.title}</h3>
                  <p className="mt-2 text-base leading-7 text-[#C7D2FE]">{reason.description}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </Section>
  );
}
