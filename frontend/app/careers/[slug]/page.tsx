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

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
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
      <PageHero eyebrow="Open role" title={job.title} description={job.summary}>
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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#C9A227]" aria-hidden />
                    <p className="font-medium text-[#374151]">{responsibility}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:w-72">
            <Card>
              <h2 className="text-xl font-semibold text-[#111827]">Apply</h2>
              <p className="mt-4 text-sm leading-6 text-[#6B7280]">
                Applications will connect to backend workflows in a later milestone.
              </p>
              <div className="mt-6">
                <PrimaryButton href="/contact">Contact Hiring Team</PrimaryButton>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
