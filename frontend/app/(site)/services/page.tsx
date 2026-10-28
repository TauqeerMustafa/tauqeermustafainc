import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, ChevronRight, Cloud, Code2, Layers, PenTool, ShieldCheck, Sparkles } from "lucide-react";

import {
  Card,
  PageHero,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";
import { IconFrame } from "@/components/home/IconFrame";
import { getServices } from "@/lib/site-content";
import { buildMetadata } from "@/lib/metadata";

// Render fresh so services edited in /admin appear immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Engineering & Security Services Directory",
  description:
    "Comprehensive directory of enterprise web engineering, cybersecurity consulting, custom AI automation, cloud architecture, and product design capabilities.",
  path: "/services",
  image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80",
});

const iconsBySlug: Record<string, typeof Code2> = {
  "enterprise-web-development": Code2,
  cybersecurity: ShieldCheck,
  "ai-solutions": Bot,
  "cloud-engineering": Cloud,
  "ui-ux-product-design": PenTool,
};

const badgeBySlug: Record<string, string> = {
  "enterprise-web-development": "Full-Stack & SaaS",
  cybersecurity: "High-Assurance & Defense",
  "ai-solutions": "Agents & Automation",
  "cloud-engineering": "Infrastructure & DevSecOps",
  "ui-ux-product-design": "Ergonomics & Systems",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="Capabilities Directory"
        title="Engineering that scales. Security that holds."
        description="We define, architect, and deliver every layer of mission-critical software. Explore our full breakdown of services, technical divisions, and concrete deliverables below."
        image="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Production Capability Matrix"
        imageCaption="Web Engineering, Cybersecurity, AI Automation, Cloud SRE, and Product Design."
      />

      {/* Quick Navigation Jump Bar */}
      <section className="sticky top-[4.5rem] z-40 border-y border-ink/10 bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto px-5 py-3 sm:px-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/40">
            JUMP TO:
          </span>
          {services.map((service, idx) => (
            <a
              key={service.slug}
              href={`#${service.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 bg-surface px-3 py-1 font-mono text-[11px] font-medium text-ink/75 transition hover:border-action hover:text-action"
            >
              <span>0{idx + 1}.</span>
              <span>{service.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Detailed Services Hierarchy */}
      <div className="divide-y divide-ink/10">
        {services.map((service, index) => {
          const IconComponent = iconsBySlug[service.slug] ?? Code2;
          const badge = badgeBySlug[service.slug] ?? "Capability";

          return (
            <Section
              key={service.slug}
              id={service.slug}
              className={index % 2 === 0 ? "bg-canvas" : "bg-surface"}
              labelledBy={`service-heading-${service.slug}`}
            >
              <div className="max-w-[1200px] mx-auto">
                {/* Service Header Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-action/30 bg-action/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-action">
                        <Sparkles className="h-3 w-3" />
                        {badge}
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-ink/40">
                        Capability 0{index + 1}
                      </span>
                    </div>

                    <h2
                      id={`service-heading-${service.slug}`}
                      className="mt-4 text-[30px] font-bold uppercase leading-[1.1] tracking-tight text-ink sm:text-[38px]"
                    >
                      {service.title}
                    </h2>
                    <p className="mt-4 text-[17px] font-light leading-relaxed text-ink/70">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 pt-2">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 rounded-none border border-ink/20 bg-transparent px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-wider text-ink transition hover:border-action hover:bg-action hover:text-on-action"
                    >
                      Specifications
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-none bg-action px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-wider text-on-action transition hover:bg-action-strong"
                    >
                      Consult
                    </Link>
                  </div>
                </div>

                {/* Sub-Services Divisions Grid */}
                {service.divisions && service.divisions.length > 0 && (
                  <div className="mt-12">
                    <div className="mb-6 flex items-center justify-between border-b border-ink/10 pb-3">
                      <h3 className="font-mono text-[12px] font-bold uppercase tracking-widest text-ink/50">
                        Technical Divisions & Deliverables
                      </h3>
                      <span className="font-mono text-[11px] text-ink/40">
                        {service.divisions.length} Divisions Available
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {service.divisions.map((division, dIdx) => (
                        <div
                          key={division.title}
                          className="group relative flex flex-col justify-between border border-ink/10 bg-canvas p-6 transition-all hover:border-action/50 hover:shadow-lg sm:p-8"
                        >
                          <div>
                            {/* Division Index & Title */}
                            <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-4">
                              <span className="font-mono text-[12px] font-bold text-action">
                                {service.title} &gt; Div 0{dIdx + 1}
                              </span>
                              <span className="rounded bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/60">
                                Production Deliverables
                              </span>
                            </div>

                            <h4 className="mt-4 text-[20px] font-bold uppercase tracking-tight text-ink group-hover:text-action transition-colors">
                              {division.title}
                            </h4>

                            <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
                              {division.description}
                            </p>

                            {/* Concrete Deliverable List with > Indicators */}
                            <div className="mt-6 border-t border-ink/5 pt-4">
                              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                                Included Specifications:
                              </p>
                              <ul className="mt-3 space-y-2">
                                {division.deliverables.map((item) => (
                                  <li
                                    key={item}
                                    className="flex items-start gap-2 text-[14px] leading-snug text-ink/85"
                                  >
                                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Tech Stack Tags */}
                          {division.techStack && division.techStack.length > 0 && (
                            <div className="mt-6 border-t border-ink/10 pt-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40 mr-1">
                                  Stack:
                                </span>
                                {division.techStack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded border border-ink/10 bg-ink/[0.03] px-2 py-0.5 font-mono text-[10px] font-medium text-ink/70"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Outcomes Summary */}
                <div className="mt-8 rounded-none border border-ink/10 bg-surface p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-action">
                        Key Outcome Commitment
                      </p>
                      <p className="mt-1 text-[14px] text-ink/70">
                        Every engagement includes architecture documentation, security hardening, and production verification.
                      </p>
                    </div>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-wider text-action hover:underline"
                    >
                      View Deep Specs & FAQs
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}
