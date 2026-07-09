import Link from "next/link";

const services = [
  {
    title: "Enterprise Web Development",
    description:
      "Modern, scalable and secure web applications built for businesses.",
  },
  {
    title: "Cybersecurity",
    description:
      "Security assessments, vulnerability management and consulting.",
  },
  {
    title: "AI & Automation",
    description:
      "AI powered business automation and intelligent digital solutions.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white">

      {/* Hero Section */}

      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6">

        <div className="max-w-3xl">

          <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            Enterprise Web Development • Cybersecurity • AI
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
            Building Enterprise
            <span className="text-blue-500">
              {" "}Digital Solutions{" "}
            </span>
            For Modern Businesses
          </h1>

          <p className="mt-8 text-lg leading-8 text-slate-400">
            We build secure, scalable and modern enterprise software
            for organizations worldwide.
          </p>

          <div className="mt-10 flex gap-4">

            <Link
              href="/contact"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
            >
              Get Started
            </Link>

            <Link
              href="/services"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800"
            >
              Explore Services
            </Link>

          </div>

        </div>

      </section>

      {/* Services Section */}

      <section className="mx-auto max-w-7xl px-6 py-24">

        <h2 className="text-center text-4xl font-bold">
          Our Services
        </h2>

        <p className="mt-4 text-center text-slate-400">
          Professional enterprise solutions for modern businesses.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {services.map((service) => (

            <div
              key={service.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-8 transition hover:border-blue-500"
            >

              <h3 className="text-2xl font-semibold">
                {service.title}
              </h3>

              <p className="mt-4 text-slate-400">
                {service.description}
              </p>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}