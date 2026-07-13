import { Gauge, Lock, Network, Users } from "lucide-react";

const reasons = [
  {
    title: "Enterprise-first architecture",
    description:
      "Systems are designed with reliability, observability, access control, and long-term maintainability in mind.",
    icon: Network,
  },
  {
    title: "Security built into delivery",
    description:
      "Threat awareness, secure defaults, and clear remediation planning are included throughout the project lifecycle.",
    icon: Lock,
  },
  {
    title: "Fast, transparent execution",
    description:
      "Clear milestones, disciplined communication, and pragmatic decisions keep teams aligned from discovery to launch.",
    icon: Gauge,
  },
  {
    title: "Business-aware engineering",
    description:
      "Technical choices are tied to operational impact, user needs, and the commercial goals behind the product.",
    icon: Users,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-slate-950 px-6 py-24" aria-labelledby="why-title">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-teal-300">
            Why choose us
          </p>
          <h2 id="why-title" className="mt-3 text-4xl font-bold text-white">
            Practical expertise for high-stakes digital work
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <article
                key={reason.title}
                className="rounded-lg border border-slate-800 bg-slate-900 p-7 transition hover:border-cyan-400/60"
              >
                <Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
                <h3 className="mt-6 text-xl font-bold text-white">
                  {reason.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {reason.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
