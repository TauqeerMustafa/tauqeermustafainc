import { ArrowRight } from "lucide-react";

import { Section, SectionHeader } from "@/components/home/ui";
import { services } from "@/lib/site-data";

export default function Services() {
  return (
    <Section className="bg-white" labelledBy="services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeader
            id="services-title"
            eyebrow="Core Services"
            title="An engineering partner for mission-critical systems."
            description="We help organizations plan, build, and modernize secure software with a focus on enterprise-grade reliability and long-term maintainability."
            className="lg:sticky lg:top-24"
          />
        </div>
        <div className="lg:col-span-7">
          <div className="flex flex-col gap-12">
            {services.map((service) => (
              <article
                key={service.slug}
                className="border-t border-zinc-200 pt-12"
              >
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {service.title}
                </h3>
                <p className="mt-4 text-lg text-zinc-600">
                  {service.description}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-center gap-3">
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                      <span className="text-base text-zinc-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
