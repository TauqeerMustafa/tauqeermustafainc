import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";

import {
  Card,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { IconFrame } from "@/components/home/IconFrame";
import { FaqAccordion } from "@/components/services/FaqAccordion";
import { getService, getServices } from "@/lib/site-content";
import { buildMetadata } from "@/lib/metadata";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { faqSchema } from "@/lib/faq-schema";

// Render fresh so services edited in /admin appear immediately.
export const dynamic = "force-dynamic";

const imageBySlug: Record<string, string> = {
  "enterprise-web-development": "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  cybersecurity: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80",
  "ai-solutions": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  "cloud-engineering": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  "ui-ux-product-design": "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) return {};

  return buildMetadata({
    title: service.title,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
    image: imageBySlug[service.slug] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([getService(slug), getServices()]);

  if (!service) {
    notFound();
  }

  // Generate structured data for SEO
  const serviceSchemaData = serviceSchema({
    name: service.title,
    description: service.description,
    slug: service.slug,
  });

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "https://qorlune.co.uk" },
    { name: "Services", url: "https://qorlune.co.uk/services" },
    { name: service.title, url: `https://qorlune.co.uk/services/${service.slug}` },
  ]);

  // Convert service FAQs to schema format if they exist
  const faqSchemaData = service.faqs
    ? faqSchema(
        service.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))
      )
    : null;

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {faqSchemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
        />
      )}
      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.description}
        image={imageBySlug[service.slug] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
        imageTitle={service.title}
        imageCaption={service.shortDescription}
      >
      </PageHero>

      {service.divisions && service.divisions.length > 0 && (
        <Section className="bg-canvas" labelledBy="service-divisions">
          <SectionHeader
            id="service-divisions"
            eyebrow="Architecture & Scope"
            title="Technical Divisions & Concrete Deliverables"
            description="Every service engagement is partitioned into distinct technical divisions with rigorous deliverable specifications."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {service.divisions.map((division, dIdx) => (
              <div
                key={division.title}
                className="group relative flex flex-col justify-between border border-ink/10 bg-surface p-6 transition-all hover:border-action/50 hover:shadow-lg sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-ink/10 pb-4">
                    <span className="font-mono text-[12px] font-bold text-action">
                      {service.title} &gt; Div 0{dIdx + 1}
                    </span>
                    <span className="rounded bg-ink/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/60">
                      Standard Module
                    </span>
                  </div>

                  <h3 className="mt-4 text-[20px] font-bold uppercase tracking-tight text-ink group-hover:text-action transition-colors">
                    {division.title}
                  </h3>

                  <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
                    {division.description}
                  </p>

                  <div className="mt-6 border-t border-ink/5 pt-4">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                      Included Deliverables:
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
        </Section>
      )}

      <Section className="bg-surface" labelledBy="service-outcomes">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeader
              id="service-outcomes"
              eyebrow="Outcomes"
              title="What this engagement can include"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {service.outcomes.map((outcome) => (
                <Card key={outcome} className="hover:translate-y-0">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-ink" aria-hidden />
                    <p className="font-medium text-ink">{outcome}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="hover:translate-y-0">
            <h2 className="text-xl font-semibold text-ink">Other services</h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              Most engagements combine more than one capability &mdash; explore the rest of what we offer.
            </p>
            <ul className="mt-6 space-y-3">
              {allServices
                .filter((item) => item.slug !== service.slug)
                .map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/services/${item.slug}`}
                      className="block border-t border-line pt-3 text-sm font-semibold text-ink transition hover:text-ink-2"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </Section>

      {service.process && (
        <Section className="bg-canvas" labelledBy="service-process">
          <SectionHeader
            id="service-process"
            eyebrow="How we work"
            title="Our process for this engagement"
            description="A consistent approach, adapted to your specific scope and timeline."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, index) => (
              <Card key={step.title} className="hover:translate-y-0">
                <div className="flex items-center gap-3">
                  <IconFrame icon={() => <span className="text-sm font-bold">{index + 1}</span>} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{step.detail}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {service.faqs && (
        <Section className="bg-surface" labelledBy="service-faqs">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeader
              id="service-faqs"
              eyebrow="Common questions"
              title="Frequently asked questions"
              description="If your question isn't covered here, reach out and we'll answer it directly."
              action={<PrimaryButton href="/contact">Ask a question</PrimaryButton>}
            />
            <FaqAccordion faqs={service.faqs} />
          </div>
        </Section>
      )}
    </>
  );
}
