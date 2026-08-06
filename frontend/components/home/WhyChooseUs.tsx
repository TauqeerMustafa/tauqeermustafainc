"use client";

import { Gauge, Lock, Network, Users } from "lucide-react";
import { GlowCard, IconFrame, Section, SectionHeader, useScrollReveal } from "./ui";

const reasons = [
  { title: "Architecture before acceleration", description: "Reliability, observability, access control, and ownership are considered before implementation scales.", icon: Network, num: "01" },
  { title: "Security built into delivery",      description: "Threat awareness, secure defaults, and remediation planning are included throughout the project lifecycle.", icon: Lock,    num: "02" },
  { title: "Transparent execution",             description: "Milestones, risks, tradeoffs, and decisions stay visible so teams can move without ambiguity.", icon: Gauge,   num: "03" },
  { title: "Business-aware engineering",        description: "Technical choices are tied to operational impact, user needs, and the commercial goals behind the product.", icon: Users,   num: "04" },
];

export default function WhyChooseUs() {
  const listRef = useScrollReveal<HTMLDivElement>();

  return (
    <Section className="bg-[#F8F9FA]" labelledBy="why-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

        <SectionHeader
          id="why-title"
          eyebrow="Why Teams Choose Us"
          title="Reasons clients keep coming back"
          description="Beyond process, this is what tends to matter most to the people we work with day to day."
        />

        <div ref={listRef} className="sr anim-right grid gap-0">
          {reasons.map((reason, i) => (
            <GlowCard key={reason.title} className={`border-t-0 border-x-0 !border-b border-[#E5E7EB] first:border-t py-6 d-${i}`}>
              <div className="flex items-start gap-4 sm:gap-6">
                <IconFrame icon={reason.icon} />
                <div className="min-w-0">
                  <span className="font-mono text-xs font-semibold text-[#B88A2A]">{reason.num}</span>
                  <h3 className="mt-1 text-lg font-semibold text-[#0A1628]">{reason.title}</h3>
                  <p className="mt-2 text-base leading-7 text-[#5F6673]">{reason.description}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </Section>
  );
}
