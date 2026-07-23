import { Section, SectionHeader } from "@/components/home/ui";

const technologyGroups = [
  {
    label: "Cloud & DevOps",
    items: ["AWS", "Azure", "Docker", "Terraform"],
  },
  {
    label: "Product & Engineering",
    items: ["Next.js", "React", "TypeScript", "Node.js"],
  },
  {
    label: "Data & Automation",
    items: ["PostgreSQL", "Python", "APIs", "AI/ML"],
  },
];

export default function Technology() {
  return (
    <Section className="bg-white" labelledBy="technology-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <SectionHeader
          id="technology-title"
          eyebrow="Technology Stack"
          title="A practical stack selected for ownership, not novelty."
          description="Tools are selected for reliability, team ownership, security, and long-term maintainability. The stack can flex around the client environment without turning the website into a logo wall."
        />

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
          {technologyGroups.map((group) => (
            <article key={group.label} className="border-t border-zinc-200 pt-6">
              <h3 className="text-base font-semibold text-zinc-900">
                {group.label}
              </h3>
              <p className="mt-3 text-base text-zinc-600">
                {group.items.join(", ")}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}