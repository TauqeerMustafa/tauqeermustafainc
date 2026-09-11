"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";

import { type UnifiedDoc, DOC_CATEGORIES } from "@/data/docs-registry";
import { PageHero, Section, Card, Badge, BadgeMuted } from "@/components/home/ui";

export default function DocReaderClient({
  doc,
  prevDoc,
  nextDoc,
}: {
  doc: UnifiedDoc;
  prevDoc?: UnifiedDoc;
  nextDoc?: UnifiedDoc;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const categoryMeta = DOC_CATEGORIES[doc.category];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <>
      {/* Canonical Hero for the Document */}
      <PageHero
        eyebrow={`Documentation // ${categoryMeta.name}`}
        title={doc.title}
        description={doc.shortDescription}
      >
        <Badge>{categoryMeta.name}</Badge>
        <BadgeMuted>{doc.estimatedReadTime}</BadgeMuted>
        <BadgeMuted>Effective: {doc.lastUpdated}</BadgeMuted>
      </PageHero>

      {/* Clean Document Reader Container */}
      <Section className="bg-canvas py-10 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Top Utilities & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              <Link href="/docs" className="hover:text-action transition flex items-center gap-1">
                <ArrowLeft size={12} />
                <span>All Docs</span>
              </Link>
              <span className="text-ink/30">//</span>
              <span className="text-ink-muted">{categoryMeta.name}</span>
              <span className="text-ink/30">//</span>
              <span className="text-ink font-bold truncate max-w-[240px] sm:max-w-[340px]">{doc.title}</span>
            </nav>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 border border-line bg-surface px-3.5 py-1.5 uppercase tracking-wider text-ink hover:border-action hover:text-action transition cursor-pointer"
                title="Copy Document Link"
              >
                {copiedLink ? <Check size={12} className="text-action" /> : <Copy size={12} />}
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 border border-line bg-surface px-3.5 py-1.5 uppercase tracking-wider text-ink hover:border-action hover:text-action transition cursor-pointer"
                title="Print Document"
              >
                <Printer size={12} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Quick Table of Contents Jump Bar */}
          {doc.sections.length > 1 && (
            <div className="border border-line bg-surface p-6 font-mono text-[11px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-1.5 w-1.5 bg-action" />
                <span className="font-bold uppercase tracking-[0.14em] text-action">
                  Document Sections ({doc.sections.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {doc.sections.map((section, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="px-3 py-1.5 bg-canvas border border-line hover:border-action hover:text-action uppercase tracking-wider transition text-[10px]"
                  >
                    0{idx + 1}. {section.heading}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Document Content Article */}
          <article className="border border-line bg-surface p-8 sm:p-12 lg:p-14 space-y-12">
            {doc.intro && (
              <div className="border-l-2 border-action bg-canvas p-6 sm:p-8 text-[16px] font-light leading-[1.8] text-ink">
                {doc.intro}
              </div>
            )}

            <div className="space-y-12">
              {doc.sections.map((section, idx) => (
                <section
                  key={idx}
                  id={`section-${idx}`}
                  className="pt-10 border-t border-line first:border-t-0 first:pt-0"
                >
                  <h2 className="mb-6 text-xl sm:text-2xl font-bold uppercase tracking-tight text-ink flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-action border border-action/30 bg-action/[0.08] px-2.5 py-0.5">
                      0{idx + 1}
                    </span>
                    <span>{section.heading}</span>
                  </h2>
                  <div className="space-y-4 text-[15px] sm:text-[16px] leading-[1.8] text-ink/90 font-light">
                    {section.body.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Official Governance Sign-off Box */}
            <div className="border-t border-line mt-14 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs text-ink-muted">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-action" />
                <span className="uppercase tracking-wider font-semibold text-ink">
                  Official Corporate Policy // Tauqeer Mustafa Inc.
                </span>
              </div>
              <div>
                <span>Compliance Desk: </span>
                <a
                  href="mailto:legal@tauqeermustafa.tech"
                  className="text-action hover:underline font-bold"
                >
                  legal@tauqeermustafa.tech
                </a>
              </div>
            </div>
          </article>

          {/* Previous / Next Document Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {prevDoc ? (
              <Link
                href={`/docs/${prevDoc.slug}`}
                className="group relative flex flex-col justify-between border border-line bg-surface p-6 sm:p-8 transition-all hover:border-action/60 hover:shadow-[0_12px_40px_rgba(28,105,212,0.10)]"
              >
                <span
                  className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
                  aria-hidden
                />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2">
                  <ArrowLeft size={13} className="text-action" />
                  <span>Previous Policy</span>
                </span>
                <span className="mt-3 font-bold uppercase text-base text-ink group-hover:text-action transition">
                  {prevDoc.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextDoc ? (
              <Link
                href={`/docs/${nextDoc.slug}`}
                className="group relative flex flex-col justify-between border border-line bg-surface p-6 sm:p-8 transition-all hover:border-action/60 hover:shadow-[0_12px_40px_rgba(28,105,212,0.10)] sm:text-right"
              >
                <span
                  className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
                  aria-hidden
                />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2 sm:justify-end">
                  <span>Next Policy</span>
                  <ArrowRight size={13} className="text-action" />
                </span>
                <span className="mt-3 font-bold uppercase text-base text-ink group-hover:text-action transition">
                  {nextDoc.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

