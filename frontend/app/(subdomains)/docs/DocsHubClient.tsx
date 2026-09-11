"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Clock, FileText, CheckCircle2, Shield, Sparkles } from "lucide-react";

import { ALL_DOCS, DOC_CATEGORIES, type DocCategory, searchDocs } from "@/data/docs-registry";
import { PageHero, Section, Card, Badge, BadgeMuted } from "@/components/home/ui";

const CATEGORY_ORDER: DocCategory[] = ["legal", "security", "commercial", "operations"];

export default function DocsHubClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | "all">("all");

  const filtered = search.trim() ? searchDocs(search) : ALL_DOCS;
  const displayedDocs =
    selectedCategory === "all"
      ? filtered
      : filtered.filter((d) => d.category === selectedCategory);

  return (
    <>
      {/* Canonical Main Web Hero */}
      <PageHero
        eyebrow="Institutional Knowledge Base // Corporate Governance"
        title="Documentation & Legal Policies"
        description="The authoritative corporate repository of 23 institutional agreements, international data privacy standards (GDPR, CCPA), cybersecurity protocols, and commercial settlement rules."
      >
        <Badge>23 Verified Documents</Badge>
        <BadgeMuted>Enterprise Governance</BadgeMuted>
        <BadgeMuted>Revision 2026.3</BadgeMuted>
      </PageHero>

      {/* Main Catalog Section */}
      <Section className="bg-canvas py-12 sm:py-16">
        <div className="space-y-10">
          {/* Search & Scope Filters Bar */}
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH 23 POLICIES, GDPR, CCPA, PAYMENT, NDA, SLA, REFUND, WIRE..."
                className="w-full bg-surface border border-line pl-11 pr-16 py-3.5 font-mono text-xs uppercase tracking-wider text-ink outline-none transition placeholder:text-ink-muted focus:border-action"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink-muted hover:text-action cursor-pointer px-2 py-1 bg-card border border-line"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
              <span className="font-mono text-[11px] font-semibold text-ink-muted uppercase tracking-wider mr-2">
                Scope Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition border cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-action text-on-action border-action"
                    : "bg-surface text-ink-muted border-line hover:border-action/40 hover:text-ink"
                }`}
              >
                All Policies ({ALL_DOCS.length})
              </button>

              {CATEGORY_ORDER.map((catId) => {
                const count = ALL_DOCS.filter((d) => d.category === catId).length;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => setSelectedCategory(catId)}
                    className={`px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition border cursor-pointer ${
                      selectedCategory === catId
                        ? "bg-action text-on-action border-action"
                        : "bg-surface text-ink-muted border-line hover:border-action/40 hover:text-ink"
                    }`}
                  >
                    <span>{DOC_CATEGORIES[catId].name}</span>
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold uppercase text-ink flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-action" />
              <span>
                {selectedCategory === "all"
                  ? "All Corporate Documents & Legal Standards"
                  : DOC_CATEGORIES[selectedCategory].name}
              </span>
            </span>
            <span className="text-ink-muted uppercase tracking-wider">
              Showing {displayedDocs.length} of {ALL_DOCS.length} documents
            </span>
          </div>

          {/* Document Cards Grid */}
          {displayedDocs.length === 0 ? (
            <div className="border border-line bg-surface p-16 text-center">
              <Search className="mx-auto h-8 w-8 text-ink-muted mb-3" aria-hidden />
              <p className="font-mono text-sm uppercase text-ink font-bold">
                No documents matched your query
              </p>
              <p className="text-xs text-ink-muted font-light mt-1">
                Try a different keyword or reset filters to view all policies.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-action font-bold uppercase hover:underline"
              >
                <span>Reset Search & Filters</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedDocs.map((doc) => {
                const meta = DOC_CATEGORIES[doc.category];

                return (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    className="group relative flex flex-col justify-between border border-line bg-surface p-8 transition-all duration-300 hover:border-action/60 hover:shadow-[0_12px_40px_rgba(28,105,212,0.12)]"
                  >
                    <span
                      className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
                      aria-hidden
                    />
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-action border border-action/20 bg-action/[0.08] px-2.5 py-1 flex items-center gap-1.5">
                          <FileText size={11} />
                          <span>{meta.name}</span>
                        </span>
                        <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={12} className="text-ink-muted" />
                          <span>{doc.estimatedReadTime}</span>
                        </span>
                      </div>

                      <h2 className="mt-5 text-[20px] font-bold uppercase leading-[1.25] tracking-tight text-ink group-hover:text-action transition-colors">
                        {doc.title}
                      </h2>
                      <p className="mt-3 text-[14px] font-light leading-[1.65] text-ink-muted">
                        {doc.shortDescription}
                      </p>
                    </div>

                    <div className="mt-8 pt-5 border-t border-line flex items-center justify-between font-mono text-[11px] text-ink-muted uppercase">
                      <span>Effective: {doc.lastUpdated}</span>
                      <span className="font-bold text-action flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                        <span>Read Document</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

