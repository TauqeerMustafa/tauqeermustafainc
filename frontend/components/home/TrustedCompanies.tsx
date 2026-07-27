import { Section, SectionHeader, ImagePlaceholder } from "./ui";

const technologyGroups = [
  {
    label: "Cloud",
    items: ["AWS", "Azure", "Supabase", "Docker"],
  },
  {
    label: "Product",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    label: "Data",
    items: ["PostgreSQL", "APIs", "Analytics", "Automation"],
  },
];

export default function TrustedCompanies() {
  return (
    <Section className="bg-white" labelledBy="technology-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
        <SectionHeader
          id="technology-title"
          eyebrow="Technology"
          title="A practical stack selected for ownership, not novelty"
          description="Tools are selected for reliability, team ownership, security, and long-term maintainability. The stack can flex around the client environment without turning the website into a logo wall."
        />

        <ImagePlaceholder
          title="Technology environment"
          caption="Local placeholder for cloud, product, data, and operations imagery."
        />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {technologyGroups.map((group) => (
          <article key={group.label} className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88A2A]">
              {group.label}
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900"
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
