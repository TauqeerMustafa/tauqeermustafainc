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
} from "lucide-react";

import { type UnifiedDoc, DOC_CATEGORIES } from "@/data/docs-registry";
import { Badge, BadgeMuted, MStripe } from "@/components/home/ui";

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
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Top Utilities & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          <Link href="/docs" className="hover:text-action transition">
            Docs
          </Link>
          <span className="text-ink/30">//</span>
          <span className="text-ink-muted">{categoryMeta.name}</span>
          <span className="text-ink/30">//</span>
          <span className="text-ink font-semibold truncate max-w-[200px]">{doc.title}</span>
        </nav>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 uppercase tracking-wider text-ink hover:border-action hover:text-action transition cursor-pointer"
            title="Copy Document Link"
          >
            {copiedLink ? <Check size={12} className="text-action" /> : <Copy size={12} />}
            <span>{copiedLink ? "Copied" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 border border-line bg-surface px-3 py-1.5 uppercase tracking-wider text-ink hover:border-action hover:text-action transition cursor-pointer"
            title="Print Document"
          >
            <Printer size={12} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Header Banner - PageHero Style */}
      <div className="border border-line bg-surface p-8 sm:p-10 relative overflow-hidden">
        <MStripe />
        <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Docs // {categoryMeta.name}
        </p>

        <h1 className="mt-3 text-[28px] sm:text-[38px] lg:text-[44px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink">
          {doc.title}
        </h1>

        <p className="mt-4 max-w-3xl text-[16px] font-light leading-[1.6] text-ink-muted">
          {doc.shortDescription}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>Category: {categoryMeta.name}</Badge>
          <BadgeMuted>Estimated Read: {doc.estimatedReadTime}</BadgeMuted>
          <BadgeMuted>Revision: {doc.lastUpdated}</BadgeMuted>
        </div>
      </div>

      {/* Table of Contents - Clean Precision Bar */}
      {doc.sections.length > 1 && (
        <div className="border border-line bg-surface p-5 font-mono text-[11px]">
          <span className="font-bold uppercase tracking-[0.14em] text-action block mb-3">
            Table of Contents
          </span>
          <div className="flex flex-wrap gap-2">
            {doc.sections.map((section, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                className="px-3 py-1 bg-card border border-line hover:border-action hover:text-action uppercase tracking-wider transition"
              >
                {section.heading}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Document Content - Editorial Article */}
      <article className="border border-line bg-canvas p-7 sm:p-12 shadow-xs space-y-8">
        {doc.intro && (
          <div className="border-l-2 border-action pl-6 py-2 bg-surface p-4 text-[15px] font-light leading-7 text-ink/90">
            {doc.intro}
          </div>
        )}

        {doc.sections.map((section, idx) => (
          <section key={idx} id={`section-${idx}`} className="pt-8 border-t border-line first:border-t-0 first:pt-0">
            <h2 className="mb-4 text-xl font-bold uppercase tracking-tight text-ink">
              {section.heading}
            </h2>
            <div className="space-y-4 text-[15px] leading-8 text-ink/85 font-light">
              {section.body.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        {/* Official Governance Sign-off */}
        <div className="border-t border-line mt-12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-action" />
            <span className="uppercase tracking-wider">Official Policy of Tauqeer Mustafa Inc.</span>
          </div>
          <div>
            <span>Corporate Compliance Desk: </span>
            <a href="mailto:legal@tauqeermustafa.tech" className="text-action hover:underline font-bold">
              legal@tauqeermustafa.tech
            </a>
          </div>
        </div>
      </article>

      {/* Previous / Next Document Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevDoc ? (
          <Link
            href={`/docs/${prevDoc.slug}`}
            className="group relative border border-line bg-card p-5 transition hover:border-action hover:bg-surface flex flex-col"
          >
            <span
              className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden
            />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <ArrowLeft size={11} />
              <span>Previous Document</span>
            </span>
            <span className="mt-2 font-bold uppercase text-sm text-ink truncate group-hover:text-action transition">
              {prevDoc.title}
            </span>
          </Link>
        ) : <div />}

        {nextDoc ? (
          <Link
            href={`/docs/${nextDoc.slug}`}
            className="group relative border border-line bg-card p-5 transition hover:border-action hover:bg-surface flex flex-col sm:text-right"
          >
            <span
              className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden
            />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5 sm:justify-end">
              <span>Next Document</span>
              <ArrowRight size={11} />
            </span>
            <span className="mt-2 font-bold uppercase text-sm text-ink truncate group-hover:text-action transition">
              {nextDoc.title}
            </span>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
