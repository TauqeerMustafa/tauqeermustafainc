import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { IconFrame } from "@/components/home/IconFrame";
import { FaqAccordion } from "@/components/services/FaqAccordion";
import { services } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { faqSchema } from "@/lib/faq-schema";

const imageBySlug: Record<string, string> = {
  "enterprise-web-development": "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  cybersecurity: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80",
  "ai-solutions": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  "cloud-engineering": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  "ui-ux-product-design": "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80",
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

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
  const service = services.find((item) => item.slug === slug);

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
    { name: "Home", url: "https://tauqeermustafa.tech" },
    { name: "Services", url: "https://tauqeermustafa.tech/services" },
    { name: service.title, url: `https://tauqeermustafa.tech/services/${service.slug}` },
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
        <PrimaryButton href="/contact">Discuss This Service</PrimaryButton>
      </PageHero>

      <Section className="bg-[#FAFAFA]" labelledBy="service-outcomes">
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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0A0A0A]" aria-hidden />
                    <p className="font-medium text-[#171717]">{outcome}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="hover:translate-y-0">
            <h2 className="text-xl font-semibold text-[#0A0A0A]">Other services</h2>
            <p className="mt-3 text-sm leading-6 text-[#737373]">
              Most engagements combine more than one capability &mdash; explore the rest of what we offer.
            </p>
            <ul className="mt-6 space-y-3">
              {services
                .filter((item) => item.slug !== service.slug)
                .map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/services/${item.slug}`}
                      className="block border-t border-[#E5E5E5] pt-3 text-sm font-semibold text-[#0A0A0A] transition hover:text-[#262626]"
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
        <Section className="bg-white" labelledBy="service-process">
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
                <h3 className="mt-4 font-semibold text-[#0A0A0A]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#737373]">{step.detail}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {service.faqs && (
        <Section className="bg-[#FAFAFA]" labelledBy="service-faqs">
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
