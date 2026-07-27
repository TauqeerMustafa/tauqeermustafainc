import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { services } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { Section } from "./Section";

export default function CoreServices() {
  return (
    <Section className="bg-white" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <h2
              id="core-services-title"
              className="text-3xl font-semibold tracking-tighter text-zinc-900 sm:text-4xl"
            >
              An engineering partner for mission-critical systems.
            </h2>
            <p className="mt-6 text-lg text-zinc-600">
              We help organizations plan, build, and modernize secure software
              with a focus on enterprise-grade reliability and long-term
              maintainability.
            </p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="flex flex-col">
            {services.map((service, index) => (
              <article
                key={service.slug}
                className={cn("py-12", {
                  "border-t border-zinc-200": index > 0,
                })}
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
                <div className="mt-8">
                  <Link href={`/services/${service.slug}`} className="inline-flex items-center font-semibold text-zinc-900 hover:text-zinc-700">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}