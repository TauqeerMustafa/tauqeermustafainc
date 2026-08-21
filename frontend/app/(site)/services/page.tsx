import type { Metadata } from "next";
import { Bot, Cloud, Code2, PenTool, ShieldCheck } from "lucide-react";

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
  title: "Services",
  description:
    "Enterprise web development, cybersecurity, AI solutions, cloud engineering, and product design services.",
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

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Enterprise services for secure digital growth."
        description="Choose focused services that support product delivery, operational resilience, cybersecurity posture, and practical AI adoption."
        image="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Full-stack service coverage"
        imageCaption="Web, security, AI, cloud, and design under one delivery team."
      />

      <Section className="bg-[#f3f0ee]" labelledBy="services-list">
        <SectionHeader
          id="services-list"
          eyebrow="Capabilities"
          title="Professional services built for production teams"
          description="Every engagement is scoped around clear outcomes, technical quality, and long-term maintainability."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.slug}>
              <IconFrame icon={iconsBySlug[service.slug] ?? Code2} />
              <h2 className="mt-7 text-xl font-semibold text-[#141413]">
                {service.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#737373]">
                {service.shortDescription}
              </p>
              <div className="mt-8">
                <TextLink href={`/services/${service.slug}`}>
                  View Service
                </TextLink>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
