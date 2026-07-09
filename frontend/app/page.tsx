import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-6">
        <div className="max-w-3xl">
          <span className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
            Enterprise Web Development • Cybersecurity • AI Solutions
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
            Building Enterprise
            <span className="text-blue-500"> Digital Solutions </span>
            For Modern Businesses
          </h1>

          <p className="mt-8 text-lg leading-8 text-slate-400">
            We design, develop, and secure enterprise-grade applications that
            help businesses grow faster, operate securely, and scale with
            confidence.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
            >
              Get Started
            </Link>

            <Link
              href="/services"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-800"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}