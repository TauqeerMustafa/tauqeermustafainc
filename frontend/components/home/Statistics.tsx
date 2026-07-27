import { ImagePlaceholder } from "@/components/home/ui";

const standards = [
  {
    label: "Discovery",
    description: "Business goals, constraints, users, and security requirements are mapped before delivery begins.",
  },
  {
    label: "Architecture",
    description: "Systems are planned around reliability, access control, maintainability, and operational ownership.",
  },
  {
    label: "Delivery",
    description: "Implementation moves through clear milestones, reviewable work, and production-minded validation.",
  },
  {
    label: "Support",
    description: "Launch plans include handover, monitoring expectations, and a practical path for iteration.",
  },
];

export default function Statistics() {
  return (
    <section
      className="border-y border-[#E5E7EB] bg-[#F4F4F2] px-5 py-18 sm:px-6 sm:py-24"
      aria-labelledby="standards-title"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7400]">
            Delivery standards
          </p>
          <h2
            id="standards-title"
            className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-[#111827] sm:text-4xl lg:text-5xl"
          >
            Quality is a delivery system, not a last-minute checklist.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5F6673]">
            The process is designed to make scope, security, architecture,
            implementation, and handover visible at the right time.
          </p>
        </div>

        <ImagePlaceholder src="/images/dashboard/tmi-dashboard-finance.jpg"
          title="Delivery timeline"
          caption="Local placeholder for process, roadmap, and production-readiness visuals."
        />
      </div>

      <div className="mx-auto mt-14 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {standards.map((standard, index) => (
          <article key={standard.label} className="border-t border-[#CFCFC7] pt-5">
            <p className="text-sm font-semibold text-[#9A7400]">
              0{index + 1}
            </p>
            <h3 className="mt-4 text-xl font-semibold text-[#111827]">
              {standard.label}
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#5F6673]">
              {standard.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

