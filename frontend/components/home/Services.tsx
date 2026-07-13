import Link from "next/link";
import { ArrowRight, Bot, Code2, ShieldCheck } from "lucide-react";

const services = [
  {
    title: "Enterprise Web Development",
    description:
      "Robust web platforms, customer portals, dashboards, and product systems engineered for scale, speed, and maintainability.",
    href: "/services",
    icon: Code2,
  },
  {
    title: "Cybersecurity",
    description:
      "Security reviews, vulnerability management, hardening guidance, and governance support for digital operations.",
    href: "/services",
    icon: ShieldCheck,
  },
  {
    title: "AI Solutions",
    description:
      "Intelligent workflows, internal copilots, process automation, and data-enabled tools that reduce manual work.",
    href: "/services",
    icon: Bot,
  },
];

export default function Services() {
  return (
    <section className="bg-slate-950 px-6 py-24" aria-labelledby="services-title">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-teal-300">
            Services
          </p>
          <h2 id="services-title" className="mt-3 text-4xl font-bold text-white">
            Enterprise services for secure digital growth
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            From architecture to launch and optimization, we deliver production
            systems that are clear to operate and built to evolve.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group rounded-lg border border-slate-800 bg-slate-900 p-8 transition duration-300 hover:-translate-y-1 hover:border-teal-400/60 hover:shadow-2xl hover:shadow-teal-950/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-7 text-2xl font-bold text-white">
                  {service.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-400">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition group-hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label={`Learn more about ${service.title}`}
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
