import { Badge, Card, PageHero, Section, SectionHeader, TextLink } from "@/components/home/ui";
import { projects } from "@/lib/site-data";

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Selected systems designed for measurable business outcomes."
        description="Explore representative enterprise platforms, security dashboards, and automation systems shaped around maintainability and operational value."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="portfolio-list">
        <SectionHeader
          id="portfolio-list"
          eyebrow="Project work"
          title="Production-minded digital systems"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.slug}>
              <p className="text-sm font-semibold text-[#A67C00]">{project.category}</p>
              <h2 className="mt-4 text-xl font-semibold text-[#111827]">
                {project.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">
                {project.summary}
              </p>
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
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
