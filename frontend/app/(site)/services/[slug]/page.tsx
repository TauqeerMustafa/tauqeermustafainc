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
import { services } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

const imageBySlug: Record<string, string> = {
  "enterprise-web-development": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-code_ub9idm.jpg",
  cybersecurity: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-cyber-shield_cly3ur.jpg",
  "ai-solutions": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442690/tmi-service-ai-security_lgghxl.jpg",
  "cloud-engineering": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-global-network_cuiryi.jpg",
  "ui-ux-product-design": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-bg-particles_pcaegw.jpg",
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
    image: imageBySlug[service.slug] ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg",
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

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.description}
        image={imageBySlug[service.slug] ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg"}
        imageTitle={service.title}
        imageCaption={service.shortDescription}
      >
        <PrimaryButton href="/contact">Discuss This Service</PrimaryButton>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="service-outcomes">
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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0B5FFF]" aria-hidden />
                    <p className="font-medium text-[#374151]">{outcome}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="hover:translate-y-0">
            <h2 className="text-xl font-semibold text-[#0A1628]">Other services</h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Most engagements combine more than one capability &mdash; explore the rest of what we offer.
            </p>
            <ul className="mt-6 space-y-3">
              {services
                .filter((item) => item.slug !== service.slug)
                .map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/services/${item.slug}`}
                      className="block border-t border-[#E5E7EB] pt-3 text-sm font-semibold text-[#0A1628] transition hover:text-[#0A46A8]"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </Section>
    </>
  );
}
