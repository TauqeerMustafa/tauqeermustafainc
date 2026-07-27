import { Section } from "./ui";

const technologyGroups = [
  {
    label: "Cloud & DevOps",
    description:
      "We build on reliable, scalable infrastructure using modern DevOps practices to ensure systems are resilient and maintainable.",
    items: ["AWS", "Azure", "Docker", "Terraform", "GitHub Actions"],
  },
  {
    label: "Product & Engineering",
    description:
      "Our stack is centered on robust, type-safe technologies that enable us to build high-quality, performant applications.",
    items: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS"],
  },
  {
    label: "Data & Automation",
    description:
      "We leverage powerful data tools and AI to create intelligent systems that automate workflows and provide valuable insights.",
    items: ["PostgreSQL", "Python", "LangChain", "OpenAI API", "Vector DBs"],
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
          A practical stack selected for ownership, not novelty.
        </h2>
        <p className="mt-6 text-lg text-zinc-600">
          Tools are selected for reliability, team ownership, security, and
          long-term maintainability. The stack can flex around the client
          environment without turning the website into a logo wall.
        </p>
      </div>
      <div className="mt-20 grid gap-16 lg:grid-cols-3">
        {technologyGroups.map((group) => (
          <article key={group.label}>
            <h3 className="text-xl font-semibold text-zinc-900">{group.label}</h3>
            <p className="mt-3 text-base text-zinc-600">{group.description}</p>
            <p className="mt-6 text-sm font-medium text-zinc-500">
              Key technologies: {group.items.join(", ")}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}