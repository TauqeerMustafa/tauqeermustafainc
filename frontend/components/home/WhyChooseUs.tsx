"use client";

import { Gauge, Lock, Network, Users } from "lucide-react";
import { Section } from "./ui";

const reasons = [
  { title: "Security built in from day one",                description: "Every project is reviewed with a security mindset. Secure defaults, not bolt-ons.",                                          icon: Lock,    num: "01" },
  { title: "You talk to the founder, not an account manager", description: "Tauqeer is on every project. No middlemen, no handoffs — direct line to the person doing the work.",                             icon: Users,   num: "02" },
  { title: "Fast-moving delivery",                        description: "Small team, no bureaucracy. We move fast and stay focused on what matters.",                               icon: Gauge,   num: "03" },
  { title: "Honest pricing for real businesses",            description: "No enterprise markup. You pay for the work, not the overhead — startup-friendly rates, every time.",                                icon: Network, num: "04" },
];

export default function WhyChooseUs() {
  return (
    /* Parchment tile — light alternate canvas */
    <Section className="bg-[#f5f5f7]" labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">Why Choose TMI</p>
          <h2 id="why-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            Why TMI works differently
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
            A different way to work — and reasons it&apos;s actually better for you.
          </p>
        </div>

        <div className="grid gap-0">
          {reasons.map((reason) => (
            <div key={reason.title} className="border-b border-[#e0e0e0] py-6 first:border-t">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#0066cc]">
                  <reason.icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0">
                  <span className="text-[14px] font-semibold tracking-[-0.224px] text-[#7a7a7a]">{reason.num}</span>
                  <h3 className="mt-1 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">{reason.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">{reason.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
