import { notFound } from "next/navigation";

import {
  Badge,
  Card,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { projects } from "@/lib/site-data";

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

  return (
    <>
      <PageHero
        eyebrow={project.category}
        title={project.title}
        description={project.summary}
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
            <h2 className="text-xl font-semibold text-[#111827]">Technology stack</h2>
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
          title="Responsive project views"
          description="Representative interface areas for the project, prepared as structured placeholders for future case-study imagery."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {project.gallery.map((item) => (
            <div
              key={item}
              className="flex aspect-[4/3] items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-sm font-semibold text-[#6B7280] shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
