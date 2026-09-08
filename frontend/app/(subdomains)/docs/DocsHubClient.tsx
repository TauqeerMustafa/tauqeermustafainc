"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Clock, FileText, CheckCircle2, Shield } from "lucide-react";

import { ALL_DOCS, DOC_CATEGORIES, type DocCategory, searchDocs } from "@/data/docs-registry";
import { MStripe } from "@/components/home/ui";

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
    <div className="space-y-16 pb-16">
      {/* Precision Editorial Hero Section - Generous & Non-Compact */}
      <div className="relative border border-line bg-surface p-10 sm:p-14 lg:p-16 overflow-hidden">
        <MStripe />
        <div className="mt-8 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-m-red">
          <span className="h-1.5 w-1.5 bg-m-red" />
          <span>Institutional Knowledge Base // Regulatory & Legal</span>
        </div>

        <h1 className="mt-5 text-[34px] sm:text-[44px] lg:text-[52px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink">
          Documentation, Policies & Legal Agreements
        </h1>

        <p className="mt-5 max-w-3xl text-[16px] sm:text-[18px] font-light leading-[1.7] text-ink-muted">
          The authoritative public repository of 23 institutional agreements, international data privacy standards (GDPR, CCPA), cybersecurity protocols, and commercial settlement rules.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 border border-m-red/40 bg-m-red/10 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-m-red">
            <CheckCircle2 size={13} className="text-m-red" />
            <span>23 Verified Documents</span>
          </span>
          <span className="inline-flex items-center border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Enterprise Governance
          </span>
          <span className="inline-flex items-center border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Revision 2026.3
          </span>
        </div>

        {/* Precision Search Input with Red Touch */}
        <div className="mt-10 flex items-center border border-line bg-canvas p-3 focus-within:border-m-red transition">
          <Search size={18} className="text-m-red ml-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by policy title, keyword, GDPR, CCPA, NDA, SLA, refund, wire..."
            className="w-full bg-transparent px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-ink outline-none placeholder:text-ink-muted"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[11px] font-mono text-ink-muted hover:text-m-red px-3 uppercase cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4 Category Summary Grid - Spacious BMW M Plates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORY_ORDER.map((catId, index) => {
          const meta = DOC_CATEGORIES[catId];
          const count = ALL_DOCS.filter((d) => d.category === catId).length;
          const isSelected = selectedCategory === catId;

          return (
            <button
              key={catId}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? "all" : catId)}
              className={`group relative p-8 text-left border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-m-red bg-surface shadow-xs"
                  : "border-line bg-card hover:border-m-red/50 hover:bg-surface"
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-0.5 w-full origin-left bg-m-red transition-transform duration-500 ${
                  isSelected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
                aria-hidden
              />
              <div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-m-red">
                    0{index + 1}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {count} {count === 1 ? "Doc" : "Docs"}
                  </span>
                </div>
                <h3 className="mt-5 text-[17px] font-bold uppercase tracking-tight text-ink">
                  {meta.name}
                </h3>
                <p className="mt-3 text-[13px] font-light leading-[1.65] text-ink-muted">
                  {meta.tagline}
                </p>
              </div>

              <span className="mt-6 pt-4 border-t border-line/60 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-m-red flex items-center justify-between">
                <span>{isSelected ? "Category Active" : "Filter Category"}</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Chips - Clean & Uncluttered */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line pb-6 pt-2">
        <span className="font-mono text-[11px] font-bold text-ink-muted uppercase tracking-wider mr-2">
          Scope Filter:
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition border cursor-pointer ${
            selectedCategory === "all"
              ? "bg-m-red text-white border-m-red shadow-xs"
              : "bg-surface text-ink border-line hover:border-m-red hover:text-m-red"
          }`}
        >
          All Policies ({ALL_DOCS.length})
        </button>

        {CATEGORY_ORDER.map((catId) => (
          <button
            key={catId}
            type="button"
            onClick={() => setSelectedCategory(catId)}
            className={`px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition border cursor-pointer ${
              selectedCategory === catId
                ? "bg-m-red text-white border-m-red shadow-xs"
                : "bg-surface text-ink border-line hover:border-m-red hover:text-m-red"
            }`}
          >
            {DOC_CATEGORIES[catId].name}
          </button>
        ))}
      </div>

      {/* Document Grid - Spacious & Cleanly Organized */}
      <div className="space-y-6">
        <div className="flex items-center justify-between font-mono">
          <h2 className="text-[15px] font-bold uppercase tracking-wider text-ink flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-m-red" />
            <span>
              {selectedCategory === "all"
                ? "All Corporate Documents & Legal Standards"
                : DOC_CATEGORIES[selectedCategory].name}
            </span>
          </h2>
          <span className="text-[11px] text-ink-muted uppercase tracking-wider">
            Showing {displayedDocs.length} of {ALL_DOCS.length} documents
          </span>
        </div>

        {displayedDocs.length === 0 ? (
          <div className="border border-line bg-surface p-16 text-center">
            <p className="font-mono text-sm uppercase text-ink-muted">
              No documents matched your query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-m-red font-bold uppercase hover:underline"
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
                  className="group relative border border-line bg-card p-8 sm:p-10 transition-all duration-300 hover:border-m-red hover:bg-surface flex flex-col justify-between"
                >
                  <span
                    className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-m-red transition-transform duration-500 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-m-red border border-m-red/30 bg-m-red/[0.08] px-3 py-1 flex items-center gap-1.5">
                        <FileText size={11} />
                        <span>{meta.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={12} className="text-ink-muted" />
                        <span>{doc.estimatedReadTime}</span>
                      </span>
                    </div>

                    <h3 className="mt-5 text-[20px] font-bold uppercase leading-[1.25] tracking-[-0.01em] text-ink group-hover:text-m-red transition-colors">
                      {doc.title}
                    </h3>
                    <p className="mt-3 text-[14px] font-light leading-[1.7] text-ink-muted">
                      {doc.shortDescription}
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-line flex items-center justify-between font-mono text-[11px] text-ink-muted uppercase">
                    <span>Effective: {doc.lastUpdated}</span>
                    <span className="font-bold text-m-red flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
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
    </div>
  );
}
