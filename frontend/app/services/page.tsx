import { Bot, Code2, ShieldCheck } from "lucide-react";

import {
  Card,
  IconFrame,
  PageHero,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";
import { services } from "@/lib/site-data";

const icons = [Code2, ShieldCheck, Bot];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Enterprise services for secure digital growth."
        description="Choose focused services that support product delivery, operational resilience, cybersecurity posture, and practical AI adoption."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="services-list">
        <SectionHeader
          id="services-list"
          eyebrow="Capabilities"
          title="Professional services built for production teams"
          description="Every engagement is scoped around clear outcomes, technical quality, and long-term maintainability."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card key={service.slug}>
              <IconFrame icon={icons[index]} />
              <h2 className="mt-7 text-xl font-semibold text-[#111827]">
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
