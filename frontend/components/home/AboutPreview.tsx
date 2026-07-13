import Link from "next/link";
import { ArrowRight, Eye, Target } from "lucide-react";

const principles = [
  {
    title: "Mission",
    description:
      "Help organizations ship secure, resilient, and useful software that improves operations and strengthens customer trust.",
    icon: Target,
  },
  {
    title: "Vision",
    description:
      "Become a trusted technology partner for enterprises that need practical engineering, responsible automation, and measurable progress.",
    icon: Eye,
  },
];

export default function AboutPreview() {
  return (
    <section className="bg-slate-900 px-6 py-24" aria-labelledby="about-title">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-300">
            About Tauqeer Mustafa Inc.
          </p>
          <h2 id="about-title" className="mt-3 text-4xl font-bold text-white">
            Strategy, engineering, and security under one accountable team.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            We partner with businesses that need dependable delivery across
            product strategy, full-stack engineering, cybersecurity, and AI
            automation. Every engagement is structured around clarity,
            maintainability, and operational value.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Learn More
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((principle) => {
            const Icon = principle.icon;

            return (
              <article
                key={principle.title}
                className="rounded-lg border border-slate-800 bg-slate-950 p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-white">
                  {principle.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-400">
                  {principle.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
