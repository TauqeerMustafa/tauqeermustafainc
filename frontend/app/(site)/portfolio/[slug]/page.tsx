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
  "enterprise-operations-portal": "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1600&q=80",
  "security-compliance-dashboard": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
  "ai-workflow-assistant": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  "healthcare-patient-scheduling-platform": "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  "cloud-cost-observability-suite": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
};

const galleryImages = [
  "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
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
    image: coverImageBySlug[project.slug] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
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
        image={coverImageBySlug[project.slug] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
        imageTitle={project.category}
        imageCaption={project.impact}
      >
        <PrimaryButton href="/contact">Plan a Similar Project</PrimaryButton>
      </PageHero>

      <Section className="bg-[#f3f0ee]" labelledBy="project-overview">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeader
            id="project-overview"
            eyebrow="Project impact"
            title={project.impact}
          />
          <Card>
            <h2 className="text-xl font-semibold text-[#141413]">Technology stack</h2>
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
              className="relative aspect-[4/3] overflow-hidden rounded-none border border-[#e2ded9] shadow-sm"
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

      <Section className="bg-[#f3f0ee]" labelledBy="project-next">
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
                className="border border-[#e2ded9] bg-white px-5 py-3 text-sm font-semibold text-[#141413] transition hover:border-[#141413] hover:text-[#2a2a28]"
              >
                {item.title}
              </Link>
            ))}
        </div>
      </Section>
    </>
  );
}
