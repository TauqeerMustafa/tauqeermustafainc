import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Section } from "@/components/home/ui";
import { getJob, getJobs } from "@/lib/site-content";
import { buildMetadata } from "@/lib/metadata";
import JobApplyForm from "@/components/careers/JobApplyForm";

// Render fresh so roles edited in /admin appear immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return buildMetadata({
    title: job.title,
    description: job.summary,
    path: `/careers/${job.slug}`,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [job, allJobs] = await Promise.all([getJob(slug), getJobs()]);
  if (!job) notFound();

  const related = allJobs.filter((j) => j.slug !== job.slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="relative bg-[#000]">
        <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
            alt="Team collaboration"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[980px] px-5 pb-10 sm:px-6 sm:pb-14">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold tracking-[-0.12px] text-white backdrop-blur-sm">
              Open Role
            </span>
            <h1 className="mt-3 text-[44px] font-semibold leading-[1.08] tracking-[-0.374px] text-white sm:text-[52px]">
              {job.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-[14px] text-white/80">
                <MapPin className="h-4 w-4" aria-hidden />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5 text-[14px] text-white/80">
                <Briefcase className="h-4 w-4" aria-hidden />
                {job.type}
              </span>
              <span className="flex items-center gap-1.5 text-[14px] text-white/80">
                <Clock className="h-4 w-4" aria-hidden />
                Open now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <Section className="bg-white" labelledBy="job-detail">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Left: Role detail */}
          <div id="job-detail">
            {/* Summary */}
            <p className="text-[21px] leading-[1.38] tracking-[-0.374px] text-[#6a6a6a]">
              {job.summary}
            </p>

            {/* Responsibilities */}
            <div className="mt-12">
              <h2 className="text-[28px] font-semibold leading-[1.14] tracking-[-0.374px] text-[#141413]">
                What you'll deliver
              </h2>
              <div className="mt-6 space-y-3">
                {job.responsibilities.map((r) => (
                  <div key={r} className="flex items-start gap-3 rounded-[12px] border border-[#e2ded9] bg-[#f3f0ee] px-5 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1c69d4]" aria-hidden />
                    <p className="text-[17px] leading-[1.47] tracking-[-0.374px] text-[#141413]">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What we offer */}
            <div className="mt-12">
              <h2 className="text-[28px] font-semibold leading-[1.14] tracking-[-0.374px] text-[#141413]">
                What you get
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Direct collaboration with the founder on every engagement",
                  "Work that ships to real production systems",
                  "Flexible remote-first working arrangements",
                  "Honest, substantive feedback on your work",
                  "Engagements that value depth over volume",
                  "Clear scope and well-defined deliverables",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[12px] border border-[#e2ded9] bg-white px-5 py-4">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#1c69d4]" aria-hidden />
                    <p className="text-[14px] leading-[1.43] tracking-[-0.224px] text-[#141413]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who fits well */}
            <div className="mt-12">
              <h2 className="text-[28px] font-semibold leading-[1.14] tracking-[-0.374px] text-[#141413]">
                Who fits this role
              </h2>
              <p className="mt-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#6a6a6a]">
                We work best with people who communicate clearly when things are uncertain, hold themselves to a high technical standard without being difficult to work with, and care about whether the system actually works — not just whether it passed review. Experience matters, but so does intellectual honesty about the limits of what you know.
              </p>
            </div>
          </div>

          {/* Right: Apply form (sticky) */}
          <div>
            <div className="sticky top-20">
              <div className="rounded-[24px] border border-[#e2ded9] bg-[#f3f0ee] p-6 sm:p-8">
                <h2 className="text-[24px] font-semibold leading-[1.17] tracking-[-0.374px] text-[#141413]">
                  Apply for this role
                </h2>
                <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#6a6a6a]">
                  Tell us about yourself and why you're a fit. We read every application and respond within 5 business days.
                </p>
                <JobApplyForm jobTitle={job.title} jobSlug={job.slug} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Related roles */}
      {related.length > 0 && (
        <Section className="bg-[#f3f0ee]" labelledBy="related-roles">
          <h2
            id="related-roles"
            className="text-[28px] font-semibold leading-[1.14] tracking-[-0.374px] text-[#141413]"
          >
            Other open roles
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/careers/${r.slug}`}
                className="group flex flex-col justify-between rounded-[24px] border border-[#e2ded9] bg-white p-6 transition hover:border-[#1c69d4]"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#e2ded9] bg-[#f3f0ee] px-3 py-1 text-[12px] font-semibold tracking-[-0.12px] text-[#6a6a6a]">
                      {r.location}
                    </span>
                    <span className="rounded-full border border-[#e2ded9] bg-[#f3f0ee] px-3 py-1 text-[12px] font-semibold tracking-[-0.12px] text-[#6a6a6a]">
                      {r.type}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[21px] font-semibold leading-[1.19] tracking-[-0.374px] text-[#141413] transition group-hover:text-[#1c69d4]">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#6a6a6a]">
                    {r.summary}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-[14px] font-semibold text-[#1c69d4]">
                  View role <ArrowRight className="h-4 w-4" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
