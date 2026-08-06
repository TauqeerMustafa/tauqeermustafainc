"use client";

import { Eyebrow, ImagePlaceholder, Pill, Section, useScrollReveal } from "./ui";

const technologyGroups = [
  {
    label: "Cloud & DevOps",
    description: "We build on reliable, scalable infrastructure using modern DevOps practices to keep systems resilient and maintainable.",
    items: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Vercel"],
    color: "text-[#0B5FFF]",
  },
  {
    label: "Product & Engineering",
    description: "Our stack is centered on robust, type-safe technologies that let us build high-quality, performant applications.",
    items: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL", "REST APIs"],
    color: "text-[#7C3AED]",
  },
  {
    label: "Data & Automation",
    description: "We use practical data tools and AI to build systems that automate workflows and give teams better visibility.",
    items: ["PostgreSQL", "Python", "LangChain", "OpenAI API", "Vector DBs", "Celery", "Redis"],
    color: "text-[#059669]",
  },
];

export default function Technology() {
  const textRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>();

  return (
    <Section className="bg-white" labelledBy="technology-title">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div ref={textRef} className="sr anim-left">
          <Eyebrow>Stack Notes</Eyebrow>
          <h2 id="technology-title" className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl lg:text-5xl">
            A practical stack selected for ownership, not novelty.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5F6673]">
            Tools are chosen for reliability, team ownership, security, and long-term
            maintainability — flexed around the client environment rather than turned into a logo wall.
          </p>
        </div>
        <ImagePlaceholder
          src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-bg-abstract_a8lsu9.jpg"
          title="Infrastructure & tooling"
          caption="A stack picked for maintainability, not trend-chasing."
          className="hidden lg:block"
        />
      </div>

      <div ref={gridRef} className="sr anim-up mt-16 grid divide-y divide-[#D7DEE8] border border-[#D7DEE8] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {technologyGroups.map((group, i) => (
          <article key={group.label} className={`group relative overflow-hidden px-6 py-8 lg:px-8 d-${i}`}>
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-[#F0F5FF] to-transparent" aria-hidden />
            <h3 className={`relative text-sm font-mono font-semibold uppercase tracking-widest ${group.color}`}>{group.label}</h3>
            <p className="relative mt-3 text-sm leading-6 text-[#5F6673]">{group.description}</p>
            <ul className="relative mt-6 flex flex-wrap gap-2">
              {group.items.map((item, j) => (
                <li key={item} className={`anim-scale d-${j % 5}`}>
                  <Pill>{item}</Pill>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
