import { Eye, Target } from "lucide-react";

import {
  Card,
  IconFrame,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";

const principles = [
  {
    title: "Mission",
    description:
      "Help organizations ship secure, resilient, and useful software that improves operations and strengthens customer trust.",
    icon: Target,
  },
  {
    title: "Vision",
    description:
      "Become a trusted technology partner for enterprises that need practical engineering, responsible automation, and measurable progress.",
    icon: Eye,
  },
];

export default function AboutPreview() {
  return (
    <Section className="bg-[#F8FAFC]" labelledBy="about-title">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeader
            id="about-title"
            eyebrow="About Tauqeer Mustafa Inc."
            title="Strategy, engineering, and security under one accountable team."
            description="We partner with businesses that need dependable delivery across product strategy, full-stack engineering, cybersecurity, and AI automation. Every engagement is structured around clarity, maintainability, and operational value."
          />
          <div className="mt-8">
            <PrimaryButton href="/about">Learn More</PrimaryButton>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <IconFrame icon={principle.icon} />
              <h3 className="mt-6 text-xl font-semibold text-[#111827]">
                {principle.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">
                {principle.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
