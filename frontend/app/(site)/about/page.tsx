import type { Metadata } from "next";
import { ArrowRight, Award, Globe2, Users } from "lucide-react";
import Link from "next/link";

import Image from "next/image";
import {
  Card,
  ImagePlaceholder,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/metadata";
import { imageLibrary } from "@/data/media";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "TMI is a digital agency that delivers integrated web engineering, cybersecurity, AI, cloud, and design services. We work with companies that need systems built to last.",
  path: "/about",
  image: imageLibrary.about[0],
});

const principles = [
  {
    title: "Technical depth first",
    description:
      "We don't pitch features before understanding constraints. Discovery starts with the systems that already exist, the risks that matter, and the technical tradeoffs that will shape delivery.",
    icon: Globe2,
  },
  {
    title: "Security as engineering discipline",
    description:
      "Secure defaults, threat modeling, and practical risk decisions are embedded in the delivery process — not added as a final audit. Every system is reviewed with an adversarial mindset before it ships.",
    icon: Award,
  },
  {
    title: "Clear ownership and communication",
    description:
      "Clients work directly with the people building their systems. No account managers buffering technical decisions. Progress is visible, blockers are surfaced early, and tradeoffs are explained in plain language.",
    icon: Users,
  },
];

const timeline = [
  {
    year: "2023",
    title: "Founded",
    description:
      "Tauqeer Mustafa established TMI in Islamabad to deliver integrated engineering and security work for companies that needed systems built with discipline — web platforms, security audits, AI automation, and cloud infrastructure managed as a unified practice.",
  },
  {
    year: "2024",
    title: "First clients",
    description:
      "Early projects centered on secure authentication systems, compliance dashboards for distributed teams, and operational portals for financial services clients. Each engagement reinforced the model: discover the real constraints, design for maintainability, deliver in testable increments.",
  },
  {
    year: "Present",
    title: "Current focus",
    description:
      "TMI now works with startups, growing SaaS companies, and enterprises that need secure platforms built to handle real operational load. Five disciplines — web, security, AI, cloud, design — delivered as one integrated team. Engagements typically run 8–16 weeks, from discovery through launch support.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About TMI"
        title="Built around systems that need to work."
        description="A digital agency delivering integrated web engineering, cybersecurity, AI, cloud, and design services. We work with companies that need platforms built to handle real operational pressure — not just prototypes."
      />

      <Section className="bg-white" labelledBy="story-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div>
            <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">Our Story</p>
            <h2 id="story-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
              Why TMI exists.
            </h2>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
              <p>
                Tauqeer Mustafa founded TMI in 2023 after years of watching companies struggle with the same pattern:
                engineering teams that couldn't talk to security consultants, security audits that arrived too late to matter,
                and platforms built without considering the operational reality they'd face in production.
              </p>
              <p>
                The agency was built around a different model — five disciplines delivered as one integrated practice.
                Web engineering, cybersecurity, AI automation, cloud infrastructure, and product design, handled by a team
                that understands how those capabilities need to work together. No handoffs between vendors. No security
                theater added at the end. Systems designed to handle real load, real threats, and real maintainability constraints.
              </p>
              <p>
                Today, TMI works with startups building their first secure platform, SaaS companies scaling beyond their
                initial architecture, and enterprises that need operational systems rebuilt with modern tooling.
                Engagements run 8–16 weeks on average, from discovery through launch support. Clients work directly with
                Tauqeer — no account managers, no bloated markup, no surprises in scope.
              </p>
              <p>
                We're not trying to be the biggest agency. We're trying to be the one companies return to when the
                work actually matters — when downtime has real cost, when a breach would end the business, when the
                system needs to work under pressure.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[18px]" style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}>
              <Image
                src={imageLibrary.about[0]}
                alt="Tauqeer Mustafa — Founder, TMI"
                width={800}
                height={600}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="h-full w-full object-cover"
              />
            </div>
            <Card>
              <p className="text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">
                Tauqeer Mustafa
              </p>
              <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">
                Founder · Full-stack engineer with a background in security consulting and cloud architecture.
                Leads every engagement from discovery through delivery.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href={company.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] leading-[1.43] tracking-[-0.224px] text-[#0066cc] hover:underline"
                >
                  GitHub <ArrowRight className="inline h-3 w-3" aria-hidden />
                </Link>
                <Link
                  href={company.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] leading-[1.43] tracking-[-0.224px] text-[#0066cc] hover:underline"
                >
                  LinkedIn <ArrowRight className="inline h-3 w-3" aria-hidden />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section className="bg-[#f5f5f7]" labelledBy="timeline-title">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">Timeline</p>
            <h2 id="timeline-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
              How we got here.
            </h2>
          </div>
          <div className="mt-16 space-y-12">
            {timeline.map((item, idx) => (
              <div key={item.year} className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-3 before:w-3 before:rounded-full before:border-2 before:border-[#0066cc] before:bg-white">
                {idx < timeline.length - 1 && (
                  <div className="absolute left-[5px] top-5 h-full w-0.5 bg-[#e0e0e0]" aria-hidden />
                )}
                <span className="inline-block rounded-full border border-[#e0e0e0] bg-white px-3 py-1 text-[14px] font-semibold leading-[1.29] tracking-[-0.224px] text-[#7a7a7a]">
                  {item.year}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">{item.title}</h3>
                <p className="mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-white" labelledBy="principles-title">
        <SectionHeader
          id="principles-title"
          eyebrow="How We Operate"
          title="The principles behind every engagement."
          description="What guides our work when scope changes, timelines shift, or tradeoffs need to be made."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {principles.map((principle) => (
            <Card key={principle.title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#e0e0e0] bg-[#f5f5f7] text-[#0066cc]">
                <principle.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-6 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">
                {principle.title}
              </h3>
              <p className="mt-4 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
                {principle.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-[#f5f5f7]" labelledBy="cta-title">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]">Ready to Start</p>
          <h2 id="cta-title" className="mt-4 text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]">
            Let's talk about what you're building.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
            Tell us about your project. We'll come back with questions, a clear scope, and an honest timeline.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton href="/contact">Start a Conversation</PrimaryButton>
            <Link
              href="/services"
              className="apple-press inline-flex items-center gap-2 rounded-full border border-[#0066cc] bg-transparent px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px] text-[#0066cc] transition-colors hover:bg-[#0066cc] hover:text-white"
            >
              View Services
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
