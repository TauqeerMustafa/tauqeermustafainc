"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  Lock,
  CreditCard,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

import { ALL_DOCS, DOC_CATEGORIES, type DocCategory, searchDocs } from "@/data/docs-registry";

const CATEGORY_ICONS: Record<DocCategory, typeof Shield> = {
  legal: Shield,
  security: Lock,
  commercial: CreditCard,
  operations: Compass,
};

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
      {/* Hero Section */}
      <div className="border border-line-2 bg-surface p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-action flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Corporate Knowledge Base</span>
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold uppercase tracking-tight text-ink">
            Documentation, Policies & Legal Agreements
          </h1>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">
            Review official commercial agreements, institutional payment terms, information security standards, and global regulatory compliance notices.
          </p>

          {/* Search Input Box */}
          <div className="mt-8 flex items-center border border-line-2 bg-card p-2 shadow-xs focus-within:border-action transition">
            <Search size={18} className="text-action ml-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by policy name, keyword, GDPR, payment, NDA..."
              className="w-full bg-transparent px-3 py-1 font-mono text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-mono text-ink-muted hover:text-ink px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Category Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['legal', 'security', 'commercial', 'operations'] as DocCategory[]).map((catId) => {
          const meta = DOC_CATEGORIES[catId];
          const Icon = CATEGORY_ICONS[catId];
          const count = ALL_DOCS.filter((d) => d.category === catId).length;
          const isSelected = selectedCategory === catId;

          return (
            <button
              key={catId}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? "all" : catId)}
              className={`p-5 text-left border transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-action bg-surface ring-2 ring-action"
                  : "border-line-2 bg-card hover:border-line hover:bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center bg-action/10 text-action border border-action/30">
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase text-action">
                    {count} Docs
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-bold uppercase text-ink">{meta.name}</h3>
                <p className="mt-1 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {meta.tagline}
                </p>
              </div>

              <span className="mt-4 font-mono text-[11px] font-bold uppercase text-action flex items-center gap-1">
                <span>{isSelected ? "Viewing Category" : "Filter Category"}</span>
                <ArrowRight size={12} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
        <span className="font-mono text-xs text-ink-muted uppercase mr-2">Show:</span>
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1 font-mono text-xs font-bold uppercase transition border cursor-pointer ${
            selectedCategory === "all"
              ? "bg-action text-on-action border-action"
              : "bg-surface text-ink border-line hover:border-action"
          }`}
        >
          All Policies ({ALL_DOCS.length})
        </button>

        {(['legal', 'security', 'commercial', 'operations'] as DocCategory[]).map((catId) => (
          <button
            key={catId}
            type="button"
            onClick={() => setSelectedCategory(catId)}
            className={`px-3 py-1 font-mono text-xs font-bold uppercase transition border cursor-pointer ${
              selectedCategory === catId
                ? "bg-action text-on-action border-action"
                : "bg-surface text-ink border-line hover:border-action"
            }`}
          >
            {DOC_CATEGORIES[catId].name}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-tight text-ink">
            {selectedCategory === "all"
              ? "All Verified Documents"
              : DOC_CATEGORIES[selectedCategory].name}
          </h2>
          <span className="font-mono text-xs text-ink-muted">
            Showing {displayedDocs.length} {displayedDocs.length === 1 ? "document" : "documents"}
          </span>
        </div>

        {displayedDocs.length === 0 ? (
          <div className="border border-line-2 bg-surface p-12 text-center">
            <p className="font-mono text-sm text-ink-muted">No documents matched your query.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-action font-bold uppercase hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDocs.map((doc) => {
              const meta = DOC_CATEGORIES[doc.category];
              const Icon = CATEGORY_ICONS[doc.category];

              return (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="group border border-line-2 bg-card p-6 transition hover:border-action hover:bg-surface flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action border border-action/30 px-2 py-0.5 flex items-center gap-1">
                        <Icon size={10} />
                        <span>{meta.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted flex items-center gap-1">
                        <Clock size={11} />
                        <span>{doc.estimatedReadTime}</span>
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-ink group-hover:text-action transition">
                      {doc.title}
                    </h3>
                    <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-2">
                      {doc.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between font-mono text-xs text-ink-muted">
                    <span>Updated: {doc.lastUpdated}</span>
                    <span className="font-bold text-action uppercase flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
