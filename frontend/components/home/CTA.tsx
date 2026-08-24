import { CheckCircle2 } from "lucide-react";

import { PrimaryButton, Section } from "@/components/home/ui";

const outcomes = [
  "Clear technical roadmap",
  "Secure delivery process",
  "Production-ready execution",
];

export default function CTA() {
  return (
    <Section className="bg-[#F8FAFC]" labelledBy="cta-title">
      <div className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-12 shadow-sm md:px-10 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#A67C00]">
              Enterprise call to action
            </p>
            <h2
              id="cta-title"
              className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl"
            >
              Ready to build a secure digital platform with a serious delivery team?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6B7280]">
              Bring us your product goals, operational constraints, and security
              requirements. We will help turn them into a practical execution plan.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-center gap-2 text-sm font-semibold text-[#111827]"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#C9A227]" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <PrimaryButton href="/contact">Schedule Consultation</PrimaryButton>
        </div>
      </div>
    </Section>
  );
}
