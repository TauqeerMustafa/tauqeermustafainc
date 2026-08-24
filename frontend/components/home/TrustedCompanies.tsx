import { Section, SectionHeader } from "@/components/home/ui";

const technologies = [
  "Microsoft",
  "Google",
  "AWS",
  "Cisco",
  "Docker",
  "PostgreSQL",
];

export default function TrustedCompanies() {
  return (
    <Section className="bg-[#F8FAFC]" labelledBy="trusted-title">
      <SectionHeader
        id="trusted-title"
        eyebrow="Trusted technology stack"
        title="Built with proven enterprise platforms"
        description="We select reliable tools and cloud services that support secure delivery, maintainable systems, and measurable business outcomes."
      />

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {technologies.map((technology) => (
          <div
            key={technology}
            className="flex min-h-20 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-center text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#C9A227]/60 hover:shadow-md"
          >
            {technology}
          </div>
        ))}
      </div>
    </Section>
  );
}
