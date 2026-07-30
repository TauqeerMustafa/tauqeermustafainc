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
  {
    label: "Security",
    items: ["Threat Modeling", "IAM", "Vulnerability Scanning", "Audit Logging"],
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
          src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-bg-abstract_a8lsu9.jpg"
          title="Technology environment"
          caption="Cloud, product, data, and security tooling chosen for long-term ownership."
        />
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {technologyGroups.map((group) => (
          <article key={group.label} className="border-t border-gray-200 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88A2A]">
              {group.label}
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-none border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900"
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

