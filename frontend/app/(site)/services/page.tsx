import type { Metadata } from "next";
import { Bot, Cloud, Code2, PenTool, ShieldCheck } from "lucide-react";

import {
  Card,
  IconFrame,
  PageHero,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";
import { services } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Enterprise web development, cybersecurity, AI solutions, cloud engineering, and product design services.",
  path: "/services",
  image: "/images/services/tmi-service-cyber-shield.jpg",
});

const iconsBySlug: Record<string, typeof Code2> = {
  "enterprise-web-development": Code2,
  cybersecurity: ShieldCheck,
  "ai-solutions": Bot,
  "cloud-engineering": Cloud,
  "ui-ux-product-design": PenTool,
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Enterprise services for secure digital growth."
        description="Choose focused services that support product delivery, operational resilience, cybersecurity posture, and practical AI adoption."
        image="/images/services/tmi-service-cyber-shield.jpg"
        imageTitle="Full-stack service coverage"
        imageCaption="Web, security, AI, cloud, and design under one delivery team."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="services-list">
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
              <h2 className="mt-7 text-xl font-semibold text-[#0A1628]">
                {service.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">
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
