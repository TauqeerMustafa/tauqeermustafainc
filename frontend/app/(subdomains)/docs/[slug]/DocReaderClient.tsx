"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Printer,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

import { type UnifiedDoc, DOC_CATEGORIES } from "@/data/docs-registry";

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <nav className="flex items-center gap-2 text-xs font-mono text-ink-muted">
          <Link href="/docs" className="hover:text-action transition">
            Docs
          </Link>
          <span className="text-ink/30">/</span>
          <span className="text-ink-muted uppercase">{categoryMeta.name}</span>
          <span className="text-ink/30">/</span>
          <span className="text-ink font-semibold truncate max-w-[200px]">{doc.title}</span>
        </nav>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 border border-line-2 bg-surface px-3 py-1 text-ink hover:border-action hover:text-action transition cursor-pointer"
            title="Copy Document Link"
          >
            {copiedLink ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copiedLink ? "Link Copied" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 border border-line-2 bg-surface px-3 py-1 text-ink hover:border-action hover:text-action transition cursor-pointer"
            title="Print Document"
          >
            <Printer size={12} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Document Header */}
      <div className="border-b border-line pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action border border-action/30 bg-action/10 px-2.5 py-0.5">
            {categoryMeta.name}
          </span>
          <span className="font-mono text-xs text-ink-muted flex items-center gap-1">
            <Clock size={12} />
            <span>{doc.estimatedReadTime}</span>
          </span>
          <span className="text-ink/30">�</span>
          <span className="font-mono text-xs text-ink-muted">Last updated: {doc.lastUpdated}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-ink">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-2xl">
          {doc.shortDescription}
        </p>
      </div>

      {/* Table of Contents Pill Bar */}
      {doc.sections.length > 1 && (
        <div className="border border-line-2 bg-surface p-4 text-xs font-mono">
          <span className="font-bold uppercase text-ink/70 block mb-2">Table of Contents</span>
          <div className="flex flex-wrap gap-2">
            {doc.sections.map((section, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                className="px-2.5 py-1 bg-card border border-line hover:border-action hover:text-action transition"
              >
                {section.heading}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Document Body */}
      <article className="space-y-8 text-ink">
        {doc.intro && (
          <div className="border-l-4 border-action bg-surface p-6 text-sm text-ink leading-relaxed">
            {doc.intro}
          </div>
        )}

        {doc.sections.map((section, idx) => (
          <section key={idx} id={`section-${idx}`} className="space-y-3 pt-4 border-t border-line/70">
            <h2 className="text-lg font-bold uppercase text-ink">{section.heading}</h2>
            <div className="space-y-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
              {section.body.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        {/* Corporate Certification Footer */}
        <div className="border border-line-2 bg-surface p-6 mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-action" />
            <span>Official Policy of Tauqeer Mustafa Inc.</span>
          </div>
          <div>
            <span>Questions? </span>
            <a href="mailto:legal@tauqeermustafa.tech" className="text-action hover:underline font-bold">
              legal@tauqeermustafa.tech
            </a>
          </div>
        </div>
      </article>

      {/* Next / Prev Document Navigation */}
      <div className="pt-8 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevDoc ? (
          <Link
            href={`/docs/${prevDoc.slug}`}
            className="border border-line-2 bg-card p-4 transition hover:border-action hover:bg-surface flex flex-col"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1">
              <ArrowLeft size={11} />
              <span>Previous Document</span>
            </span>
            <span className="mt-1 font-bold text-sm text-ink truncate">{prevDoc.title}</span>
          </Link>
        ) : <div />}

        {nextDoc ? (
          <Link
            href={`/docs/${nextDoc.slug}`}
            className="border border-line-2 bg-card p-4 transition hover:border-action hover:bg-surface flex flex-col sm:text-right"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1 sm:justify-end">
              <span>Next Document</span>
              <ArrowRight size={11} />
            </span>
            <span className="mt-1 font-bold text-sm text-ink truncate">{nextDoc.title}</span>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
