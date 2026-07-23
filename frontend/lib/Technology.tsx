import { Section } from "@/components/home/ui";

const technologyAreas = [
  {
    name: "Cloud & Infrastructure",
    description:
      "We build on reliable, scalable cloud infrastructure to ensure systems are secure, observable, and ready for growth.",
    tools: "AWS, Azure, Docker, Terraform, Vercel",
  },
  {
    name: "Application & API",
    description:
      "Our stack is centered on modern, maintainable technologies that enable fast, secure, and high-quality product development.",
    tools: "Next.js, TypeScript, Node.js, Python, GraphQL",
  },
  {
    name: "Data & Intelligence",
    description:
      "We use proven data storage and processing tools to build intelligent systems that are both powerful and practical to operate.",
    tools: "PostgreSQL, Vector DBs, LLM APIs, dbt",
  },
];

export default function Technology() {
  return (
    <Section className="bg-white" labelledBy="technology-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="technology-title"
          className="text-3xl font-semibold tracking-tighter text-zinc-900 sm:text-4xl"
        >
          A practical stack for long-term ownership.
        </h2>
        <p className="mt-6 text-lg text-zinc-600">
          We select technologies for reliability, security, and maintainability.
          Our goal is to deliver systems that your team can confidently operate
          and evolve long after our engagement ends.
        </p>
      </div>

      <div className="mt-16 grid gap-12 border-t border-zinc-200 pt-16 lg:grid-cols-3 lg:gap-8">
        {technologyAreas.map((area) => (
          <article key={area.name}>
            <h3 className="text-lg font-semibold text-zinc-900">
              {area.name}
            </h3>
            <p className="mt-2 text-base text-zinc-600">{area.description}</p>
            <p className="mt-4 text-sm font-medium text-zinc-500">
              {area.tools}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}