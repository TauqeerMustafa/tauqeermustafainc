"use client";

import { useState } from "react";
import Image from "next/image";
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
import { MStripe } from "@/components/home/ui";

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
    <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-12 pb-16">
      {/* Top Utilities & Breadcrumb - Spacious */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
          <Link href="/docs" className="hover:text-m-red transition">
            Docs
          </Link>
          <span className="text-ink/30">//</span>
          <span className="text-ink-muted">{categoryMeta.name}</span>
          <span className="text-ink/30">//</span>
          <span className="text-ink font-bold truncate max-w-[280px]">{doc.title}</span>
        </nav>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 border border-line bg-surface px-4 py-2 uppercase tracking-wider text-ink hover:border-m-red hover:text-m-red transition cursor-pointer"
            title="Copy Document Link"
          >
            {copiedLink ? <Check size={13} className="text-m-red" /> : <Copy size={13} />}
            <span>{copiedLink ? "Link Copied" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 border border-line bg-surface px-4 py-2 uppercase tracking-wider text-ink hover:border-m-red hover:text-m-red transition cursor-pointer"
            title="Print Document"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Header Banner - Spacious PageHero Style with Red Touch */}
      <div className="border border-line bg-surface p-10 sm:p-14 relative overflow-hidden">
        <MStripe />
        <div className="mt-6 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-m-red">
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden border border-line bg-card">
            <Image src="/logo.png" alt="Tauqeer Mustafa Inc." fill sizes="24px" className="object-cover" priority />
          </span>
          <span className="h-1.5 w-1.5 bg-m-red" />
          <span>Documentation // {categoryMeta.name}</span>
        </div>

        <h1 className="mt-4 text-[32px] sm:text-[42px] lg:text-[48px] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-ink">
          {doc.title}
        </h1>

        <p className="mt-5 max-w-3xl text-[16px] sm:text-[18px] font-light leading-[1.7] text-ink-muted">
          {doc.shortDescription}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 border border-m-red/40 bg-m-red/10 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-m-red">
            <Bookmark size={12} className="text-m-red" />
            <span>Category: {categoryMeta.name}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 border border-line bg-card px-3.5 py-1.5 font-mono text-[11px] text-ink-muted uppercase tracking-wider">
            <Clock size={12} />
            <span>{doc.estimatedReadTime}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 border border-line bg-card px-3.5 py-1.5 font-mono text-[11px] text-ink-muted uppercase tracking-wider">
            <Calendar size={12} />
            <span>Effective: {doc.lastUpdated}</span>
          </span>
        </div>
      </div>

      {/* Table of Contents - Clean & Organized */}
      {doc.sections.length > 1 && (
        <div className="border border-line bg-surface p-8 font-mono text-[11px]">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 bg-m-red" />
            <span className="font-bold uppercase tracking-[0.16em] text-m-red">
              Document Sections ({doc.sections.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {doc.sections.map((section, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                className="px-4 py-2 bg-card border border-line hover:border-m-red hover:text-m-red uppercase tracking-wider transition text-[11px]"
              >
                {section.heading}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Document Content - Editorial Article with Generous Breathing Room */}
      <article className="border border-line bg-canvas p-8 sm:p-14 lg:p-16 space-y-12">
        {doc.intro && (
          <div className="border-l-4 border-m-red bg-surface p-6 sm:p-8 text-[16px] font-light leading-[1.8] text-ink">
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
                <span className="font-mono text-sm font-bold text-m-red border border-m-red/30 bg-m-red/[0.08] px-2.5 py-0.5">
                  0{idx + 1}
                </span>
                <span>{section.heading}</span>
              </h2>
              <div className="space-y-5 text-[16px] leading-[1.85] text-ink/90 font-light">
                {section.body.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Official Governance Sign-off Box */}
        <div className="border-t border-line mt-16 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 font-mono text-xs text-ink-muted">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-m-red" />
            <span className="uppercase tracking-wider font-semibold text-ink">
              Official Corporate Policy // Tauqeer Mustafa Inc.
            </span>
          </div>
          <div>
            <span>Corporate Compliance Desk: </span>
            <a
              href="mailto:legal@tauqeermustafa.tech"
              className="text-m-red hover:underline font-bold"
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
            className="group relative border border-line bg-card p-6 sm:p-8 transition-all hover:border-m-red hover:bg-surface flex flex-col justify-between"
          >
            <span
              className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-m-red transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2">
              <ArrowLeft size={13} className="text-m-red" />
              <span>Previous Document</span>
            </span>
            <span className="mt-3 font-bold uppercase text-base text-ink group-hover:text-m-red transition">
              {prevDoc.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextDoc ? (
          <Link
            href={`/docs/${nextDoc.slug}`}
            className="group relative border border-line bg-card p-6 sm:p-8 transition-all hover:border-m-red hover:bg-surface flex flex-col justify-between sm:text-right"
          >
            <span
              className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-m-red transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-2 sm:justify-end">
              <span>Next Document</span>
              <ArrowRight size={13} className="text-m-red" />
            </span>
            <span className="mt-3 font-bold uppercase text-base text-ink group-hover:text-m-red transition">
              {nextDoc.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
