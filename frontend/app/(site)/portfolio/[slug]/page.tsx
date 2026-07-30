import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Badge,
  Card,
  ImagePlaceholder,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { projects } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

const coverImageBySlug: Record<string, string> = {
  "enterprise-operations-portal": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-dashboard-finance_w2mvtk.jpg",
  "security-compliance-dashboard": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-data-security_oxjb4l.jpg",
  "ai-workflow-assistant": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442690/tmi-service-ai-security_lgghxl.jpg",
  "healthcare-patient-scheduling-platform": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-code_ub9idm.jpg",
  "cloud-cost-observability-suite": "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-dashboard-market_pttc2n.jpg",
};

const galleryImages = [
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-dashboard-finance_w2mvtk.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-dashboard-growth_pfmdpk.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-dashboard-market_pttc2n.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-data-security_oxjb4l.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-cyber-shield_cly3ur.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442690/tmi-service-ai-security_lgghxl.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-code_ub9idm.jpg",
  "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-network_ecqwdg.jpg",
];

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) return {};

  return buildMetadata({
    title: project.title,
    description: project.summary,
    path: `/portfolio/${project.slug}`,
    image: coverImageBySlug[project.slug] ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  const projectIndex = projects.findIndex((item) => item.slug === slug);

  return (
    <>
      <PageHero
        eyebrow={project.category}
        title={project.title}
        description={project.summary}
        image={coverImageBySlug[project.slug] ?? "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg"}
        imageTitle={project.category}
        imageCaption={project.impact}
      >
        <PrimaryButton href="/contact">Plan a Similar Project</PrimaryButton>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="project-overview">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeader
            id="project-overview"
            eyebrow="Project impact"
            title={project.impact}
          />
          <Card>
            <h2 className="text-xl font-semibold text-[#0A1628]">Technology stack</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <Badge key={technology}>{technology}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section className="bg-white" labelledBy="project-gallery">
        <SectionHeader
          id="project-gallery"
          eyebrow="Gallery"
          title="Representative interface areas"
          description="Illustrative views of the workflow areas this system covers."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {project.gallery.map((item, i) => (
            <div
              key={item}
              className="relative aspect-[4/3] overflow-hidden rounded-none border border-[#E5E7EB] shadow-sm"
            >
              <ImagePlaceholder
                src={galleryImages[(projectIndex * 4 + i) % galleryImages.length]}
                title={item}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#F8FAFC]" labelledBy="project-next">
        <SectionHeader
          id="project-next"
          eyebrow="More work"
          title="Other projects"
        />
        <div className="mt-10 flex flex-wrap gap-4">
          {projects
            .filter((item) => item.slug !== project.slug)
            .slice(0, 3)
            .map((item) => (
              <Link
                key={item.slug}
                href={`/portfolio/${item.slug}`}
                className="border border-[#D7DEE8] bg-white px-5 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#0B5FFF] hover:text-[#0A46A8]"
              >
                {item.title}
              </Link>
            ))}
        </div>
      </Section>
    </>
  );
}
