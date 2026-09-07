import type { Metadata } from "next";

import { Badge, Card, ImagePlaceholder, PageHero, Section, SectionHeader, TextLink } from "@/components/home/ui";
import { projects } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Portfolio",
  description:
    "Selected case studies: enterprise platforms, security dashboards, AI automation, and cloud engineering projects.",
  path: "/portfolio",
  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
});

const coverImageBySlug: Record<string, string> = {
  "enterprise-operations-portal": "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1600&q=80",
  "security-compliance-dashboard": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
  "ai-workflow-assistant": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  "healthcare-patient-scheduling-platform": "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  "cloud-cost-observability-suite": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Selected systems designed for measurable business outcomes."
        description="Explore representative enterprise platforms, security dashboards, and automation systems shaped around maintainability and operational value."
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Outcomes we track"
        imageCaption="Every project is scoped around a measurable business result."
      />

      <Section className="bg-surface" labelledBy="portfolio-list">
        <SectionHeader
          id="portfolio-list"
          eyebrow="Project work"
          title="Production-minded digital systems"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.slug} className="flex flex-col overflow-hidden p-0">
              <div className="relative h-44 w-full overflow-hidden border-b border-line">
                <ImagePlaceholder
                  src={coverImageBySlug[project.slug] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
                  title={project.category}
                  className="h-full"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-sm font-semibold text-ink-2">{project.category}</p>
                <h2 className="mt-4 text-xl font-semibold text-ink">
                  {project.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-ink-muted">{project.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((technology) => (
                    <Badge key={technology}>{technology}</Badge>
                  ))}
                </div>
                <div className="mt-8">
                  <TextLink href={`/portfolio/${project.slug}`}>
                    View Project
                  </TextLink>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
