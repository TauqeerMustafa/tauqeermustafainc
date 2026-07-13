import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const posts = [
  {
    title: "How Enterprise Teams Should Plan Secure Web Platforms",
    category: "Engineering",
    date: "July 3, 2026",
    excerpt:
      "A practical framework for aligning architecture, access control, performance, and long-term maintainability before development begins.",
    href: "/blog",
  },
  {
    title: "AI Automation That Actually Improves Operations",
    category: "Automation",
    date: "June 21, 2026",
    excerpt:
      "What to automate first, how to measure value, and why responsible rollout matters for internal AI systems.",
    href: "/blog",
  },
  {
    title: "Security Signals Leaders Should Watch Every Month",
    category: "Cybersecurity",
    date: "June 7, 2026",
    excerpt:
      "A concise operating view of vulnerabilities, access exposure, remediation aging, and incident readiness.",
    href: "/blog",
  },
];

export default function LatestBlogs() {
  return (
    <section className="bg-slate-950 px-6 py-24" aria-labelledby="blogs-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-teal-300">
              Latest insights
            </p>
            <h2 id="blogs-title" className="mt-3 text-4xl font-bold text-white">
              Practical guidance for digital leaders
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Read All Articles
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-lg border border-slate-800 bg-slate-900 p-7 transition hover:border-teal-400/60"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="font-semibold text-cyan-300">{post.category}</span>
                <span aria-hidden="true">/</span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {post.date}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-bold leading-snug text-white">
                <Link
                  href={post.href}
                  className="transition hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-400">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
