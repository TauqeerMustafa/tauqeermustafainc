import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

const projects = [
  {
    title: "Enterprise Operations Portal",
    category: "Web Platform",
    description:
      "A secure role-based portal for leadership dashboards, internal workflows, and operational reporting.",
    impact: "Reduced manual reporting cycles and improved executive visibility.",
  },
  {
    title: "Security Compliance Dashboard",
    category: "Cybersecurity",
    description:
      "A centralized risk tracking interface for vulnerability evidence, remediation ownership, and audit readiness.",
    impact: "Improved remediation prioritization across distributed teams.",
  },
  {
    title: "AI Workflow Assistant",
    category: "AI Automation",
    description:
      "An internal assistant that routes requests, drafts operational responses, and summarizes business data.",
    impact: "Shortened repetitive task handling for customer-facing teams.",
  },
];

export default function PortfolioPreview() {
  return (
    <section className="bg-slate-950 px-6 py-24" aria-labelledby="portfolio-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-teal-300">
              Featured work
            </p>
            <h2 id="portfolio-title" className="mt-3 text-4xl font-bold text-white">
              Production systems with measurable outcomes
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            View Portfolio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.title}
              className="rounded-lg border border-slate-800 bg-slate-900 p-7 transition hover:border-teal-400/60"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-semibold text-cyan-300">
                  {project.category}
                </p>
                <ExternalLink className="h-5 w-5 text-slate-500" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white">
                {project.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-400">
                {project.description}
              </p>
              <p className="mt-6 border-l border-teal-400/50 pl-4 text-sm leading-6 text-slate-300">
                {project.impact}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
