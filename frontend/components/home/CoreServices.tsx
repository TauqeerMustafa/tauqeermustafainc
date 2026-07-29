import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { services } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { Section } from "./ui";

const tags = ["WEB", "SEC", "AI", "CLOUD", "UX"];

export default function CoreServices() {
  return (
    <Section className="bg-white" labelledBy="core-services-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
              Core Services
            </p>
            <h2
              id="core-services-title"
              className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl"
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
                className={cn("group px-1 py-10 transition sm:px-5", {
                  "border-t border-[#D7DEE8]": index > 0,
                })}
              >
                <span className="inline-flex border border-[#0B5FFF]/30 bg-[#F4F7FC] px-2 py-1 font-mono text-[11px] font-semibold tracking-widest text-[#0A46A8]">
                  {tags[index] ?? "TMI"}
                </span>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#0A1628]">
                  {service.title}
                </h3>
                <p className="mt-4 text-lg text-zinc-600">
                  {service.description}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-center gap-3">
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#0B5FFF]" />
                      <span className="text-base text-zinc-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 font-semibold text-[#0A1628] transition hover:text-[#0B5FFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A46A8]"
                  >
                    Learn More <ArrowRight className="h-4 w-4" />
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
