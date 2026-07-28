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

const coverImageBySlug: Record<string, string> = {
  "enterprise-operations-portal": "/images/dashboard/tmi-dashboard-finance.jpg",
  "security-compliance-dashboard": "/images/services/tmi-service-data-security.jpg",
  "ai-workflow-assistant": "/images/services/tmi-service-ai-security.jpg",
  "healthcare-patient-scheduling-platform": "/images/hero/tmi-hero-code.jpg",
  "cloud-cost-observability-suite": "/images/dashboard/tmi-dashboard-market.jpg",
};

const galleryImages = [
  "/images/raw/tmi (2).jpg",
  "/images/raw/tmi (4).jpg",
  "/images/raw/tmi (9).jpg",
  "/images/raw/tmi (13).jpg",
  "/images/raw/tmi (15).jpg",
  "/images/raw/tmi (17).jpg",
  "/images/raw/tmi (19).jpg",
  "/images/raw/tmi (21).jpg",
];

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
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
        image={coverImageBySlug[project.slug] ?? "/images/hero/tmi-hero-digital.jpg"}
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
