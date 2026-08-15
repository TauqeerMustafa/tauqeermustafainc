"use client";

import { Gauge, Lock, Network, Users } from "lucide-react";
import { Section } from "./ui";

const reasons = [
  { title: "Security designed in, not added later",       description: "Threat modeling happens during discovery, not after launch. Security controls are embedded in the architecture — authentication flows, data handling, access boundaries — so they don't break under real load.",                icon: Lock,    num: "01" },
  { title: "Direct access to the founder on every project", description: "Tauqeer leads every engagement from scoping through deployment. The person who makes architecture decisions is the same person who writes the code and reviews the security posture. No layers, no handoffs.",  icon: Users,   num: "02" },
  { title: "Five disciplines under one roof",             description: "Web engineering, cybersecurity, AI automation, cloud infrastructure, and product design delivered by one team that understands how those capabilities need to interact. No vendor coordination overhead.", icon: Gauge,   num: "03" },
  { title: "Clear scope, honest pricing",                 description: "Fixed-scope engagements with transparent timelines. You pay for the actual work — engineering, security reviews, infrastructure setup — not enterprise markup or account management overhead.",                      icon: Network, num: "04" },
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
            Most agencies either lack security expertise or treat it as a separate audit phase. Most freelancers
            can't handle the full stack — frontend, backend, infrastructure, threat modeling, and UX — as one
            coherent system. TMI exists because those gaps create real operational risk. We deliver all five
            disciplines with the technical depth they require, led by someone who's built production systems
            that had to survive real threats and real load.
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
