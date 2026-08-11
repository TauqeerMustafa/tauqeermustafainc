import type { Metadata } from "next";
import { CheckCircle2, Compass, ShieldCheck, Users } from "lucide-react";

import {
  Card,
  IconFrame,
  ImagePlaceholder,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Since 2006, Tauqeer Mustafa Inc. has helped organizations build secure, scalable software across web development, cybersecurity, AI, cloud engineering, and design.",
  path: "/about",
  image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
});

const values = [
  {
    title: "Clarity before velocity",
    description:
      "We define outcomes, constraints, and ownership before engineering effort scales.",
    icon: Compass,
  },
  {
    title: "Security in the process",
    description:
      "Secure defaults, review checkpoints, and practical risk decisions are built into delivery.",
    icon: ShieldCheck,
  },
  {
    title: "Accountable partnership",
    description:
      "Clients get transparent communication, practical recommendations, and measurable progress.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Two decades of focused engineering work."
        description="Since 2006, Tauqeer Mustafa Inc. has helped organizations plan, build, and improve secure software systems with a practical blend of product thinking, full-stack engineering, cybersecurity, and automation."
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Our operating environment"
        imageCaption="Founded 2006 · Islamabad, Pakistan"
      >
        <PrimaryButton href="/contact">Start a Conversation</PrimaryButton>
      </PageHero>

      <Section className="bg-white" labelledBy="about-mission">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 id="about-mission" className="text-xl font-semibold text-[#0A0A0A]">Our mission</h2>
            <p className="mt-4 text-base leading-7 text-[#737373]">{company.mission}</p>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold text-[#0A0A0A]">Our vision</h2>
            <p className="mt-4 text-base leading-7 text-[#737373]">{company.vision}</p>
          </Card>
        </div>
      </Section>

      <Section className="bg-[#FAFAFA]" labelledBy="about-values">
        <SectionHeader
          id="about-values"
          eyebrow="Operating principles"
          title="Structured delivery with enterprise discipline"
          description="Our work is organized around clarity, maintainability, and decisions that can stand up to real operational pressure."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <IconFrame icon={value.icon} />
              <h2 className="mt-6 text-xl font-semibold text-[#0A0A0A]">
                {value.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#737373]">
                {value.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-white" labelledBy="about-method">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-8">
            <SectionHeader
              id="about-method"
              eyebrow="How we work"
              title="From strategy to production with less ambiguity"
              description="We keep engagements grounded in concrete milestones, technical constraints, and the business reason behind every major decision."
            />
            <ImagePlaceholder
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
              title="Discovery to delivery"
              caption="Milestones stay visible from the first conversation to launch."
              className="hidden lg:block"
            />
          </div>
          <div className="grid gap-4">
            {[
              "Discovery that turns goals into technical scope",
              "Architecture plans that support secure delivery",
              "Implementation with reviewable milestones",
              "Launch support focused on production readiness",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-none border border-[#E5E5E5] bg-white p-5 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0A0A0A]" aria-hidden />
                <p className="text-sm font-medium leading-6 text-[#171717]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
