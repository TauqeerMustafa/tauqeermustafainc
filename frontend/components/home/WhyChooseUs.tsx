"use client";

import { Gauge, Lock, Network, Users } from "lucide-react";
import { Section } from "./ui";

const reasons = [
  { title: "Security designed in, not added later",       description: "Every system is reviewed with a security mindset from discovery through deployment — not as a final checklist.",                icon: Lock,    num: "01" },
  { title: "Direct access to the founder on every project", description: "Tauqeer leads every engagement. No account managers, no handoffs — direct line to the person building your system.",  icon: Users,   num: "02" },
  { title: "Five disciplines under one roof",             description: "Web engineering, security, AI, cloud, and design delivered as a single integrated practice — not five separate vendors.", icon: Gauge,   num: "03" },
  { title: "Clear scope, honest pricing",                 description: "No enterprise markup. You pay for the work, not the overhead. Transparent timeline, fixed milestones.",                      icon: Network, num: "04" },
];

export default function WhyChooseUs() {
  return (
    /* Dark tile — near-black canvas */
    <Section className="bg-[#272729]" labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-white">Why TMI</p>
          <h2 id="why-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-white">
            Built differently. For a reason.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#cccccc]">
            A focused team, clear processes, and work that reflects real expertise —
            not the output of a lowest-bid freelancer model.
          </p>
        </div>

        <div className="grid gap-0">
          {reasons.map((reason) => (
            <div key={reason.title} className="border-b border-white/10 py-6 first:border-t">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#2997ff]">
                  <reason.icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0">
                  <span className="text-[14px] font-semibold tracking-[-0.224px] text-white/50">{reason.num}</span>
                  <h3 className="mt-1 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-white">{reason.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#cccccc]">{reason.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
