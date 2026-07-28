import { Badge, Card, ImagePlaceholder, PageHero, Section, SectionHeader, TextLink } from "@/components/home/ui";
import { projects } from "@/lib/site-data";

const coverImageBySlug: Record<string, string> = {
  "enterprise-operations-portal": "/images/dashboard/tmi-dashboard-finance.jpg",
  "security-compliance-dashboard": "/images/services/tmi-service-data-security.jpg",
  "ai-workflow-assistant": "/images/services/tmi-service-ai-security.jpg",
  "healthcare-patient-scheduling-platform": "/images/hero/tmi-hero-code.jpg",
  "cloud-cost-observability-suite": "/images/dashboard/tmi-dashboard-market.jpg",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Selected systems designed for measurable business outcomes."
        description="Explore representative enterprise platforms, security dashboards, and automation systems shaped around maintainability and operational value."
        image="/images/dashboard/tmi-dashboard-growth.jpg"
        imageTitle="Outcomes we track"
        imageCaption="Every project is scoped around a measurable business result."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="portfolio-list">
        <SectionHeader
          id="portfolio-list"
          eyebrow="Project work"
          title="Production-minded digital systems"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.slug} className="flex flex-col overflow-hidden p-0">
              <div className="relative h-44 w-full overflow-hidden border-b border-[#D7DEE8]">
                <ImagePlaceholder
                  src={coverImageBySlug[project.slug] ?? "/images/hero/tmi-hero-digital.jpg"}
                  title={project.category}
                  className="h-full"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-sm font-semibold text-[#0A46A8]">{project.category}</p>
                <h2 className="mt-4 text-xl font-semibold text-[#0A1628]">
                  {project.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-[#6B7280]">{project.summary}</p>
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
