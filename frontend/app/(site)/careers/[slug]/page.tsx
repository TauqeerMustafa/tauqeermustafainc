import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import {
  Badge,
  Card,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { jobs } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = jobs.find((item) => item.slug === slug);

  if (!job) return {};

  return buildMetadata({
    title: job.title,
    description: job.summary,
    path: `/careers/${job.slug}`,
    image: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-bg-matrix_w1xjjh.jpg",
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = jobs.find((item) => item.slug === slug);

  if (!job) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow="Open role"
        title={job.title}
        description={job.summary}
        image="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-bg-matrix_w1xjjh.jpg"
        imageTitle={job.title}
        imageCaption={`${job.location} · ${job.type}`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{job.location}</Badge>
          <Badge>{job.type}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="job-responsibilities">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <SectionHeader
              id="job-responsibilities"
              eyebrow="Responsibilities"
              title="What you will help deliver"
            />
            <div className="mt-10 grid gap-4">
              {job.responsibilities.map((responsibility) => (
                <Card key={responsibility} className="hover:translate-y-0">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0B5FFF]" aria-hidden />
                    <p className="font-medium text-[#374151]">{responsibility}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:w-72">
            <Card>
              <h2 className="text-xl font-semibold text-[#0A1628]">Apply</h2>
              <p className="mt-4 text-sm leading-6 text-[#6B7280]">
                Send your resume and a short note on relevant experience to our
                hiring team, referencing this role.
              </p>
              <div className="mt-6">
                <PrimaryButton
                  href={`mailto:careers@tauqeermustafa.tech?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                >
                  Apply via Email
                </PrimaryButton>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
