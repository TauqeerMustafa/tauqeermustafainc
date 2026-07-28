import { Section } from "./ui";

const technologyGroups = [
  {
    label: "Cloud & DevOps",
    description:
      "We build on reliable, scalable infrastructure using modern DevOps practices to keep systems resilient and maintainable.",
    items: ["AWS", "Azure", "Docker", "Terraform", "GitHub Actions"],
  },
  {
    label: "Product & Engineering",
    description:
      "Our stack is centered on robust, type-safe technologies that let us build high-quality, performant applications.",
    items: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS"],
  },
  {
    label: "Data & Automation",
    description:
      "We use practical data tools and AI to build systems that automate workflows and give teams better visibility.",
    items: ["PostgreSQL", "Python", "LangChain", "OpenAI API", "Vector DBs"],
  },
];

export default function Technology() {
  return (
    <Section className="bg-white" labelledBy="technology-title">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#0A46A8]">
          Stack Notes
        </p>
        <h2
          id="technology-title"
          className="mt-4 text-3xl font-semibold tracking-tight text-[#0A1628] sm:text-4xl"
        >
          A practical stack selected for ownership, not novelty.
        </h2>
        <p className="mt-6 text-lg text-zinc-600">
          Tools are chosen for reliability, team ownership, security, and
          long-term maintainability — flexed around the client environment
          rather than turned into a logo wall.
        </p>
      </div>
      <div className="mt-16 grid divide-y divide-[#D7DEE8] border-y border-[#D7DEE8] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {technologyGroups.map((group) => (
          <article key={group.label} className="px-1 py-8 lg:px-8">
            <h3 className="text-lg font-semibold text-[#0A1628]">{group.label}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{group.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border border-[#D7DEE8] bg-[#F4F7FC] px-2.5 py-1 font-mono text-[11px] font-medium text-[#0A46A8]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
