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
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
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
        image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80"
        imageTitle={job.title}
        imageCaption={`${job.location} · ${job.type}`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{job.location}</Badge>
          <Badge>{job.type}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#FAFAFA]" labelledBy="job-responsibilities">
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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0A0A0A]" aria-hidden />
                    <p className="font-medium text-[#171717]">{responsibility}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:w-72">
            <Card>
              <h2 className="text-xl font-semibold text-[#0A0A0A]">Apply</h2>
              <p className="mt-4 text-sm leading-6 text-[#737373]">
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
