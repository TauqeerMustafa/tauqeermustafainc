import { Bot, Code2, ShieldCheck } from "lucide-react";

import {
  Card,
  IconFrame,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/home/ui";

const services = [
  {
    title: "Enterprise Web Development",
    description:
      "Robust web platforms, customer portals, dashboards, and product systems engineered for scale, speed, and maintainability.",
    href: "/services",
    icon: Code2,
  },
  {
    title: "Cybersecurity",
    description:
      "Security reviews, vulnerability management, hardening guidance, and governance support for digital operations.",
    href: "/services",
    icon: ShieldCheck,
  },
  {
    title: "AI Solutions",
    description:
      "Intelligent workflows, internal copilots, process automation, and data-enabled tools that reduce manual work.",
    href: "/services",
    icon: Bot,
  },
];

export default function Services() {
  return (
    <Section className="bg-white" labelledBy="services-title">
      <SectionHeader
        id="services-title"
        eyebrow="Services"
        title="Enterprise services for secure digital growth"
        description="From architecture to launch and optimization, we deliver production systems that are clear to operate and built to evolve."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title}>
            <IconFrame icon={service.icon} />
            <h3 className="mt-7 text-xl font-semibold text-[#111827]">
              {service.title}
            </h3>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              {service.description}
            </p>
            <div className="mt-8">
              <TextLink
                href={service.href}
                ariaLabel={`Learn more about ${service.title}`}
              >
                Learn More
              </TextLink>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
