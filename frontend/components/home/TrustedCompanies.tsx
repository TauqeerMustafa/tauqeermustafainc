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
    <section className="bg-slate-950 px-6 py-16" aria-labelledby="trusted-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-300">
              Trusted technology stack
            </p>
            <h2 id="trusted-title" className="mt-3 text-3xl font-bold text-white">
              Built with proven enterprise platforms
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            We select reliable tools and cloud services that support secure
            delivery, maintainable systems, and measurable business outcomes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {technologies.map((technology) => (
            <div
              key={technology}
              className="flex min-h-20 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-4 text-center text-sm font-semibold text-slate-200 transition hover:border-teal-400/60 hover:bg-slate-900/70"
            >
              {technology}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
