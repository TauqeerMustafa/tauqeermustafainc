import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { communityGuidelines } from "@/data/community";
import { buildMetadata } from "@/lib/metadata";
import { PageHero, Section } from "@/components/home/ui";

export const metadata: Metadata = buildMetadata({
  title: "Community Guidelines | TMI Community",
  description: "The principles that keep the TMI community useful, generous, and safe for everyone.",
  path: "/community/guidelines",
});

const checklist = [
  "Lead with context",
  "Credit the people and sources behind your work",
  "Use descriptive titles and relevant tags",
  "Keep sensitive information out of public threads",
  "Report issues privately so they can be handled with care",
];

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHero
        eyebrow="Community Handbook // Standards & Etiquette"
        title="Community Guidelines"
        description="The principles that keep the TMI community useful, generous, and safe for everyone. Simple by design, creating the conditions for great exchange."
      >
        <Link
          href="/community"
          className="inline-flex items-center gap-2 border border-line bg-surface px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-action hover:text-action transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Discussions</span>
        </Link>
      </PageHero>

      <Section className="bg-canvas py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
            {/* Guidelines List */}
            <div className="border-t border-line">
              {communityGuidelines.map((item) => (
                <article
                  key={item.number}
                  className="grid gap-4 border-b border-line py-8 sm:grid-cols-[64px_minmax(0,1fr)]"
                >
                  <span className="font-mono text-sm font-bold text-action">
                    {item.number}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight text-ink">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="border border-line bg-surface p-6">
                <div className="flex items-center gap-2 text-action mb-4">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Quick Checklist
                  </span>
                </div>
                <ul className="space-y-3">
                  {checklist.map((item) => (
                    <li key={item} className="flex gap-2.5 text-xs text-ink-muted leading-snug">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-line bg-surface p-6 text-xs text-ink-muted leading-relaxed">
                <p>
                  Need to flag something? Start with a private note through our{" "}
                  <Link
                    href="/support/contact"
                    className="font-semibold text-action underline underline-offset-4 hover:text-action-strong"
                  >
                    contact directory
                  </Link>
                  . We review every report with care.
                </p>
              </div>
            </aside>
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-16 border border-line bg-surface p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action block mb-1">
                Ready to Participate?
              </span>
              <p className="text-lg sm:text-xl font-bold uppercase text-ink max-w-xl">
                Bring a question, a work-in-progress, or a hard-won engineering lesson.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-action text-on-action font-mono text-xs font-bold uppercase hover:bg-action-strong transition shrink-0"
            >
              <span>Explore Conversations</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

