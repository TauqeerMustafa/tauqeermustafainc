"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Clock, FileText } from "lucide-react";

import { ALL_DOCS, DOC_CATEGORIES, type DocCategory, searchDocs } from "@/data/docs-registry";
import { Badge, BadgeMuted, MStripe } from "@/components/home/ui";

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
    <div className="space-y-12">
      {/* Precision Editorial Hero Section */}
      <div className="relative border border-line bg-surface p-8 sm:p-12 overflow-hidden">
        <MStripe />
        <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Knowledge Base // Regulatory & Legal
        </p>
        <h1 className="mt-4 text-[32px] sm:text-[42px] lg:text-[48px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink">
          Documentation, Policies & Legal Agreements
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] sm:text-[17px] font-light leading-[1.6] text-ink-muted">
          Authoritative directory of 23 institutional agreements, international privacy mandates (GDPR, CCPA), cybersecurity protocols, and commercial transaction terms.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>23 Verified Documents</Badge>
          <BadgeMuted>Enterprise Governance</BadgeMuted>
          <BadgeMuted>Revision 2026.3</BadgeMuted>
        </div>

        {/* Precision Search Input */}
        <div className="mt-8 flex items-center border border-line bg-canvas p-2 focus-within:border-action transition">
          <Search size={16} className="text-action ml-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by policy title, keyword, GDPR, payment, NDA, SLA..."
            className="w-full bg-transparent px-3 py-1 font-mono text-xs uppercase tracking-wider text-ink outline-none placeholder:text-ink-muted"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[11px] font-mono text-ink-muted hover:text-ink px-2 uppercase cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4 Category Summary Grid - Pure BMW M Plates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORY_ORDER.map((catId, index) => {
          const meta = DOC_CATEGORIES[catId];
          const count = ALL_DOCS.filter((d) => d.category === catId).length;
          const isSelected = selectedCategory === catId;

          return (
            <button
              key={catId}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? "all" : catId)}
              className={`group relative p-6 text-left border transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-action bg-surface"
                  : "border-line bg-card hover:border-action/50 hover:bg-surface"
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-0.5 w-full origin-left bg-action transition-transform duration-500 ${
                  isSelected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
                aria-hidden
              />
              <div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-action">
                    0{index + 1}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    {count} {count === 1 ? "Doc" : "Docs"}
                  </span>
                </div>
                <h3 className="mt-4 text-[15px] font-bold uppercase tracking-tight text-ink">
                  {meta.name}
                </h3>
                <p className="mt-2 text-[12px] font-light leading-[1.6] text-ink-muted line-clamp-2">
                  {meta.tagline}
                </p>
              </div>

              <span className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-action flex items-center gap-1.5">
                <span>{isSelected ? "Category Active" : "Filter Category"}</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Chips - Monospace Precision Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
        <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider mr-2">
          Scope:
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition border cursor-pointer ${
            selectedCategory === "all"
              ? "bg-action text-on-action border-action"
              : "bg-surface text-ink border-line hover:border-action"
          }`}
        >
          All Policies ({ALL_DOCS.length})
        </button>

        {CATEGORY_ORDER.map((catId) => (
          <button
            key={catId}
            type="button"
            onClick={() => setSelectedCategory(catId)}
            className={`px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition border cursor-pointer ${
              selectedCategory === catId
                ? "bg-action text-on-action border-action"
                : "bg-surface text-ink border-line hover:border-action"
            }`}
          >
            {DOC_CATEGORIES[catId].name}
          </button>
        ))}
      </div>

      {/* Document Grid - Editorial Structure */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono">
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-ink">
            {selectedCategory === "all"
              ? "Verified Knowledge Base"
              : DOC_CATEGORIES[selectedCategory].name}
          </h2>
          <span className="text-[11px] text-ink-muted uppercase tracking-wider">
            Showing {displayedDocs.length} {displayedDocs.length === 1 ? "document" : "documents"}
          </span>
        </div>

        {displayedDocs.length === 0 ? (
          <div className="border border-line bg-surface p-12 text-center">
            <p className="font-mono text-xs uppercase text-ink-muted">
              No documents matched your query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-action font-bold uppercase hover:underline"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDocs.map((doc) => {
              const meta = DOC_CATEGORIES[doc.category];

              return (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="group relative border border-line bg-card p-6 transition-all duration-300 hover:border-action/40 hover:bg-surface flex flex-col justify-between"
                >
                  <span
                    className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-action border border-action/30 bg-action/[0.06] px-2.5 py-0.5 flex items-center gap-1">
                        <FileText size={10} />
                        <span>{meta.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider flex items-center gap-1">
                        <Clock size={11} />
                        <span>{doc.estimatedReadTime}</span>
                      </span>
                    </div>

                    <h3 className="mt-4 text-[17px] font-bold uppercase leading-[1.2] tracking-[-0.01em] text-ink group-hover:text-action transition-colors">
                      {doc.title}
                    </h3>
                    <p className="mt-2 text-[13px] font-light leading-[1.6] text-ink-muted line-clamp-2">
                      {doc.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between font-mono text-[11px] text-ink-muted uppercase">
                    <span>Updated: {doc.lastUpdated}</span>
                    <span className="font-bold text-action flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Read Policy</span>
                      <ArrowRight size={12} />
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
