import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { projects } from "@/lib/site-data";
import { Section, ImagePlaceholder } from "./ui";

export default function FeaturedWork() {
  const featuredProject = projects[0];

  return (
    <Section className="bg-zinc-50" labelledBy="featured-work-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="lg:order-2">
          <p
            id="featured-work-title"
            className="text-sm font-semibold uppercase tracking-widest text-zinc-500"
          >
            Featured Work
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {featuredProject.title}
          </h2>
          <p className="mt-6 text-lg text-zinc-600">{featuredProject.summary}</p>
          <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 text-base sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-zinc-900">Impact</dt>
              <dd className="mt-1 text-zinc-600">{featuredProject.impact}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Category</dt>
              <dd className="mt-1 text-zinc-600">{featuredProject.category}</dd>
            </div>
          </dl>
          <div className="mt-8">
            <Link
              href={`/portfolio/${featuredProject.slug}`}
              className="inline-flex items-center font-semibold text-zinc-900 hover:text-zinc-700"
            >
              View Case Study <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="lg:order-1">
          <ImagePlaceholder src="/images/dashboard/tmi-dashboard-growth.jpg"
            title="Featured operations portal"
            caption="Role-based reporting, workflow visibility, and executive decision support."
            className="aspect-h-3 aspect-w-4"
          />
        </div>
      </div>
    </Section>
  );
}

