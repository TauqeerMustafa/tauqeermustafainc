import type { Metadata } from "next";
import { HeartHandshake, LineChart, Users } from "lucide-react";

import {
  Card,
  IconFrame,
  PageHero,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";
import { jobs } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description: "Open roles at Tauqeer Mustafa Inc. across engineering, security, design, and delivery.",
  path: "/careers",
  image: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-bg-hexagon_clrisv.jpg",
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
        image="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-bg-hexagon_clrisv.jpg"
        imageTitle="How we work together"
        imageCaption="Small, focused teams with transparent milestones."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="open-positions">
        <SectionHeader id="open-positions" eyebrow="Open positions" title="Current roles" />
        <div className="mt-14 grid gap-6">
          {jobs.map((job) => (
            <Card key={job.slug}>
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0A46A8]">
                    {job.location} / {job.type}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[#0A1628]">{job.title}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[#6B7280]">
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
              <h2 className="mt-6 text-xl font-semibold text-[#0A1628]">{benefit.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
