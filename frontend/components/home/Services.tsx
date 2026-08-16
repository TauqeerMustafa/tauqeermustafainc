import {
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  Headphones,
  Palette,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import {
  ButtonLink,
  Card,
  ImagePlaceholder,
  Section,
  SectionHeader,
  TextLink
} from "./ui";
import { IconFrame } from "./IconFrame";

const services = [
  {
    title: "Enterprise Web Development",
    description:
      "High-performance web platforms and digital portals built for reliability, governance, and long-term product growth.",
    href: "/services",
    icon: Code2,
    features: [
      "Scalable application architecture",
      "Secure customer and admin portals",
      "Performance-focused frontends",
      "API and system integrations",
    ],
  },
  {
    title: "Custom Software Development",
    description:
      "Purpose-built systems that align with operations, reduce friction, and support complex organizational workflows.",
    href: "/services",
    icon: Cpu,
  },
  {
    title: "Artificial Intelligence",
    description:
      "Practical AI systems for workflow automation, internal assistants, and decision support.",
    href: "/services",
    icon: BrainCircuit,
  },
  {
    title: "Cybersecurity",
    description:
      "Security services that strengthen environments, reduce risk exposure, and improve operational resilience.",
    href: "/services",
    icon: ShieldCheck,
  },
  {
    title: "Cloud Solutions",
    description:
      "Cloud architecture and migration planning for availability, cost control, and scalability.",
    href: "/services",
    icon: Cloud,
  },
  {
    title: "UI/UX Design",
    description:
      "Enterprise-grade interface design for clear, accessible, and efficient digital experiences.",
    href: "/services",
    icon: Palette,
  },
  {
    title: "Business Automation",
    description:
      "Automation programs that connect systems, streamline approvals, and improve team execution speed.",
    href: "/services",
    icon: Workflow,
  },
  {
    title: "Managed IT Services",
    description:
      "Ongoing technology management that keeps business systems supported and ready to evolve.",
    href: "/services",
    icon: Headphones,
  },
];

const process = ["Diagnose", "Design", "Build", "Operate"];

export default function Services() {
  const [featuredService, ...supportingServices] = services;

  return (
    <Section
      className="border-y border-[#e2ded9] bg-[#f3f0ee]"
      labelledBy="services-title"
    >
      <SectionHeader
        id="services-title"
        eyebrow="Services"
        title="Serious technology delivery without the template-agency noise"
        description="Services are organized around the decisions that matter in production: architecture, security, maintainability, user experience, and operational ownership."
        action={<ButtonLink href="/services" variant="outline">All Services</ButtonLink>}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <article className="border border-[#d8d4d1] border-t-2 border-t-[#1c69d4] bg-white p-6 shadow-[0_10px_28px_rgba(17,24,39,0.06)] sm:p-8">
          <IconFrame icon={featuredService.icon} className="bg-[#f3f0ee]" />

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#0066b1]">
            Featured service
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#141413] sm:text-4xl">
            {featuredService.title}
          </h3>
          <p className="mt-5 text-base leading-7 text-[#5a5a5a]">
            {featuredService.description}
          </p>

          <ul className="mt-8 grid gap-4">
            {featuredService.features?.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm leading-6 text-[#3a3a38]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-none bg-[#1c69d4]" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ButtonLink
              href={featuredService.href}
              variant="primary"
            >
              Explore Web Delivery
            </ButtonLink>
          </div>
        </article>

        <div className="grid gap-8">
          <ImagePlaceholder src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-cyber-shield_cly3ur.jpg"
            title="Service delivery system"
            caption="Architecture, UX, security, and cloud planning aligned before implementation scales."
          />

          <div className="grid gap-x-6 gap-y-0 sm:grid-cols-2">
            {supportingServices.map((service) => (
              <Card key={service.title} className="border-x-0 border-b-0 p-5 shadow-none hover:shadow-none sm:p-6">
                <div className="flex items-start gap-4">
                  <IconFrame icon={service.icon} />
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#141413]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#5a5a5a]">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <TextLink
                    href={service.href}
                  >
                    Learn More
                  </TextLink>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-4 border-t border-[#e2ded9] pt-8 sm:grid-cols-2 lg:grid-cols-4">
        {process.map((step, index) => (
          <div key={step} className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#d8d4d1] bg-white text-sm font-semibold text-[#0066b1]">
              0{index + 1}
            </span>
            <p className="text-sm font-semibold text-[#141413]">{step}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

