import type { Metadata } from "next";
import { HeartHandshake, LineChart, Users } from "lucide-react";

import {
  Card,
  PageHero,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";
import { IconFrame } from "@/components/home/IconFrame";
import { jobs } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description: "Open roles at Tauqeer Mustafa Inc. across engineering, security, design, and delivery.",
  path: "/careers",
  image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
});

const benefits = [
  { title: "Meaningful work", description: "Solve practical business and technical problems.", icon: LineChart },
  { title: "Clear collaboration", description: "Work with focused teams and transparent milestones.", icon: Users },
  { title: "Responsible pace", description: "Deliver with discipline, quality, and sustainable planning.", icon: HeartHandshake },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join a team focused on serious enterprise delivery."
        description="We look for pragmatic people who care about clarity, technical quality, client trust, and software that works in production."
        image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
        imageTitle="How we work together"
        imageCaption="Small, focused teams with transparent milestones."
      />

      <Section className="bg-[#f3f0ee]" labelledBy="open-positions">
        <SectionHeader id="open-positions" eyebrow="Open positions" title="Current roles" />
        <div className="mt-14 grid gap-6">
          {jobs.map((job) => (
            <Card key={job.slug}>
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2a2a28]">
                    {job.location} / {job.type}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[#141413]">{job.title}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[#737373]">
                    {job.summary}
                  </p>
                </div>
                <TextLink href={`/careers/${job.slug}`}>View Role</TextLink>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-white" labelledBy="career-benefits">
        <SectionHeader id="career-benefits" eyebrow="Benefits" title="A practical environment for strong work" />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <IconFrame icon={benefit.icon} />
              <h2 className="mt-6 text-xl font-semibold text-[#141413]">{benefit.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#737373]">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
