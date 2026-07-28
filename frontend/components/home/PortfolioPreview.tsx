import { ImagePlaceholder, Section, SectionHeader, TextLink } from "@/components/home/ui";

const projects = [
  {
    title: "Enterprise Operations Portal",
    industry: "Operations",
    challenge:
      "Leadership needed clearer visibility into workflows, reporting, and role-based internal processes.",
    solution:
      "A secure portal structure for dashboards, internal workflows, and executive reporting.",
    technology: ["Next.js", "PostgreSQL", "Role-based access"],
    outcome: "Reduced manual reporting cycles and improved operational visibility.",
  },
  {
    title: "Security Compliance Dashboard",
    industry: "Cybersecurity",
    challenge:
      "Risk evidence, remediation ownership, and audit readiness were scattered across teams.",
    solution:
      "A centralized interface for vulnerability evidence, remediation status, and security review workflows.",
    technology: ["Security workflows", "Analytics", "Admin portal"],
    outcome: "Improved remediation prioritization across distributed teams.",
  },
  {
    title: "AI Workflow Assistant",
    industry: "AI Automation",
    challenge:
      "Customer-facing teams needed faster handling for repetitive requests and operational summaries.",
    solution:
      "An internal assistant for routing requests, drafting responses, and summarizing business data.",
    technology: ["AI workflows", "APIs", "Automation"],
    outcome: "Shortened repetitive task handling for customer-facing teams.",
  },
];

export default function PortfolioPreview() {
  const [featuredProject, ...otherProjects] = projects;

  return (
    <Section className="bg-white" labelledBy="portfolio-title">
      <SectionHeader
        id="portfolio-title"
        eyebrow="Featured work"
        title="Project previews shaped around the business problem"
        description="Portfolio work is presented through the lens of industry, challenge, solution, technology, and outcome rather than generic screenshots."
        action={<TextLink href="/portfolio">View Portfolio</TextLink>}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <article className="overflow-hidden border border-[#D7DEE8] bg-[#F4F7FC] shadow-[0_12px_32px_rgba(17,24,39,0.08)]">
          <ImagePlaceholder src="/images/services/tmi-service-ai-security.jpg"
            title="Project screenshot"
            caption="Local placeholder for product, dashboard, or platform screenshot."
            className="rounded-none border-0 shadow-none"
          />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
              {featuredProject.industry}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#0A1628]">
              {featuredProject.title}
            </h3>
            <dl className="mt-8 grid gap-6">
              <div>
                <dt className="text-sm font-semibold text-[#0A1628]">Challenge</dt>
                <dd className="mt-2 text-sm leading-6 text-[#5F6673]">
                  {featuredProject.challenge}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-[#0A1628]">Solution</dt>
                <dd className="mt-2 text-sm leading-6 text-[#5F6673]">
                  {featuredProject.solution}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-[#0A1628]">Outcome</dt>
                <dd className="mt-2 text-sm leading-6 text-[#5F6673]">
                  {featuredProject.outcome}
                </dd>
              </div>
            </dl>
            <ul className="mt-8 flex flex-wrap gap-2">
              {featuredProject.technology.map((technology) => (
                <li
                  key={technology}
                  className="rounded-none border border-[#D7DEE8] bg-white px-3 py-1 text-xs font-semibold text-[#374151]"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <div className="grid gap-5">
          {otherProjects.map((project) => (
            <article
              key={project.title}
              className="border border-[#D7DEE8] border-l-2 border-l-transparent bg-white p-6 transition hover:border-l-[#0B5FFF] hover:shadow-[0_8px_24px_rgba(17,24,39,0.06)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
                {project.industry}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#0A1628]">
                {project.title}
              </h3>
              <dl className="mt-6 grid gap-4">
                <div>
                  <dt className="text-sm font-semibold text-[#0A1628]">Challenge</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#5F6673]">
                    {project.challenge}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-[#0A1628]">Technology</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {project.technology.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-none bg-[#F4F7FC] px-3 py-1 text-xs font-semibold text-[#374151]"
                      >
                        {technology}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-[#0A1628]">Outcome</dt>
                  <dd className="mt-1 text-sm leading-6 text-[#5F6673]">
                    {project.outcome}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

