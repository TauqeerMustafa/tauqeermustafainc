import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { projects } from "@/lib/site-data";
import { Section, ImagePlaceholder } from "./ui";

export default function FeaturedWork() {
  const featuredProject = projects[0];

  return (
    <Section className="bg-[#F4F7FC]" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="lg:order-2">
          <p
            id="featured-work-title"
            className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]"
          >
            <span className="h-1.5 w-1.5 bg-[#0B5FFF]" aria-hidden="true" />
            Selected Work
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl">
            {featuredProject.title}
          </h2>
          <p className="mt-6 text-lg text-zinc-600">{featuredProject.summary}</p>
          <dl className="mt-8 grid grid-cols-1 gap-px border border-[#D7DEE8] bg-[#D7DEE8] sm:grid-cols-2">
            <div className="bg-white p-5">
              <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0A46A8]">
                Impact
              </dt>
              <dd className="mt-2 text-sm text-zinc-700">{featuredProject.impact}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0A46A8]">
                Category
              </dt>
              <dd className="mt-2 text-sm text-zinc-700">{featuredProject.category}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <Link
              href={`/portfolio/${featuredProject.slug}`}
              className="inline-flex items-center gap-2 font-semibold text-[#0A1628] transition hover:text-[#0B5FFF]"
            >
              View Case Study <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="tmi-corners lg:order-1">
          <ImagePlaceholder
            src="/images/dashboard/tmi-dashboard-growth.jpg"
            title="Featured operations portal"
            caption="Role-based reporting, workflow visibility, and executive decision support."
            className="aspect-h-3 aspect-w-4"
          />
        </div>
      </div>
    </Section>
  );
}
