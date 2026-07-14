import Link from "next/link";
import { Calendar } from "lucide-react";

import { Card, Section, SectionHeader, TextLink } from "@/components/home/ui";

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
    <Section className="bg-white" labelledBy="blogs-title">
      <SectionHeader
        id="blogs-title"
        eyebrow="Latest insights"
        title="Practical guidance for digital leaders"
        action={<TextLink href="/blog">Read All Articles</TextLink>}
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.title}>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              <span className="font-semibold text-[#A67C00]">{post.category}</span>
              <span aria-hidden="true">/</span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {post.date}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-semibold leading-snug text-[#111827]">
              <Link
                href={post.href}
                className="transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
              >
                {post.title}
              </Link>
            </h3>
            <p className="mt-4 text-base leading-7 text-[#6B7280]">
              {post.excerpt}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
