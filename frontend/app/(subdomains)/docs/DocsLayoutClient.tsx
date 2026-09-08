"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ExternalLink,
  Menu,
  X,
  FileText,
  ChevronRight,
} from "lucide-react";

import ThemeToggle from "@/components/layout/ThemeToggle";
import { ALL_DOCS, DOC_CATEGORIES, type DocCategory, searchDocs } from "@/data/docs-registry";

const CATEGORY_ORDER: DocCategory[] = ["legal", "security", "commercial", "operations"];

export default function DocsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = searchQuery.trim() ? searchDocs(searchQuery).slice(0, 8) : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Precision Editorial Header with M-Stripe Rail */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-xl">
        <div className="m-stripe" aria-hidden="true" />
        <div className="mx-auto flex min-h-[4.75rem] max-w-[1440px] items-center justify-between gap-6 px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative flex h-10 w-10 cursor-pointer items-center justify-center border border-line bg-surface text-ink transition hover:border-m-red"
              aria-label="Toggle Documentation Sidebar"
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>

            {/* Brand Logo & Title */}
            <Link
              href="/docs"
              className="inline-flex min-h-11 shrink-0 items-center gap-3.5 text-[15px] font-bold uppercase tracking-[0.01em] text-ink transition-opacity hover:opacity-85"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-line bg-surface">
                <Image
                  src="/tmi-logo-primary.jpg"
                  alt="Tauqeer Mustafa Inc."
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-bold tracking-tight text-ink uppercase text-[15px]">
                  Tauqeer Mustafa Inc.
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-m-red mt-0.5">
                  // Documentation & Policies
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Trigger */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between border border-line bg-surface px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-ink/60 hover:border-m-red hover:text-ink transition cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Search size={14} className="text-m-red" />
                <span>Search 23 Policies, Legal Rules & Playbooks...</span>
              </span>
              <kbd className="border border-line px-2 py-0.5 text-[9px] bg-card text-ink-muted font-mono">
                CTRL+K
              </kbd>
            </button>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center border border-line bg-surface text-ink-muted hover:text-m-red cursor-pointer"
              aria-label="Search documents"
            >
              <Search size={16} />
            </button>

            <a
              href="https://billing.tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink/70 hover:text-m-red transition px-3.5 py-2 border border-line bg-surface"
            >
              Billing
            </a>

            <a
              href="https://tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink/70 hover:text-m-red transition px-3.5 py-2 border border-line bg-surface"
            >
              <span>Main Site</span>
              <ExternalLink size={11} />
            </a>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container - Spacious & Non-Compact */}
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 flex-1 w-full flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 lg:w-80 shrink-0 py-10 pr-8 border-r border-line self-start sticky top-[4.75rem] max-h-[calc(100vh-4.75rem)] overflow-y-auto">
          <div className="mb-8 border-b border-line pb-5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-m-red flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-m-red" />
              Policy Directory
            </p>
            <p className="text-[13px] font-light text-ink-muted mt-1.5 leading-relaxed">
              23 verified corporate frameworks, data policies, and operational playbooks.
            </p>
          </div>

          <nav className="space-y-8">
            {CATEGORY_ORDER.map((catId, index) => {
              const meta = DOC_CATEGORIES[catId];
              const docs = ALL_DOCS.filter((d) => d.category === catId);

              return (
                <div key={catId} className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink border-b border-line pb-2">
                    <span>0{index + 1} // {meta.name}</span>
                    <span className="text-m-red font-mono text-[10px]">{docs.length}</span>
                  </div>

                  <ul className="pt-1.5 space-y-1 font-mono text-[11px]">
                    {docs.map((doc) => {
                      const docPath = `/docs/${doc.slug}`;
                      const isActive = pathname === docPath;

                      return (
                        <li key={doc.slug}>
                          <Link
                            href={docPath}
                            className={`flex items-center justify-between px-3 py-2 transition uppercase tracking-[0.04em] ${
                              isActive
                                ? "border-l-2 border-m-red bg-m-red/[0.08] text-m-red font-bold pl-3"
                                : "text-ink-muted hover:text-ink hover:bg-surface hover:border-l-2 hover:border-line-2"
                            }`}
                          >
                            <span className="truncate">{doc.title}</span>
                            {isActive && <ChevronRight size={12} className="text-m-red shrink-0" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex">
            <div className="w-4/5 max-w-sm bg-surface h-full p-6 overflow-y-auto flex flex-col border-r border-line">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-m-red flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-m-red" />
                  Documentation Index
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-6 flex-1">
                {CATEGORY_ORDER.map((catId, index) => {
                  const meta = DOC_CATEGORIES[catId];
                  const docs = ALL_DOCS.filter((d) => d.category === catId);

                  return (
                    <div key={catId} className="space-y-2">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink border-b border-line pb-1.5 flex items-center justify-between">
                        <span>0{index + 1} // {meta.name}</span>
                        <span className="text-m-red">{docs.length}</span>
                      </div>
                      <ul className="space-y-1 font-mono text-[11px]">
                        {docs.map((doc) => (
                          <li key={doc.slug}>
                            <Link
                              href={`/docs/${doc.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-2.5 py-1.5 text-ink-muted hover:text-m-red uppercase truncate"
                            >
                              {doc.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Pane - Spacious & Elegant */}
        <div className="flex-1 min-w-0 py-10 lg:pl-12 lg:pr-2">{children}</div>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center p-4 pt-20 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-canvas border border-line shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-5 border-b border-line bg-surface">
              <Search size={18} className="text-m-red shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH 23 POLICIES, GDPR, PAYMENT, NDA, SLA, COMPLIANCE..."
                className="w-full bg-transparent font-mono text-xs uppercase tracking-wider text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-ink-muted hover:text-ink text-[10px] font-mono uppercase px-2.5 py-1 border border-line bg-card cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3">
              {searchQuery.trim() && searchResults.length === 0 ? (
                <div className="p-10 text-center text-xs text-ink-muted font-mono uppercase">
                  No matching policies found for &quot;{searchQuery}&quot;.
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1.5">
                  {searchResults.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="block p-4 border border-transparent hover:border-m-red/50 hover:bg-surface transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-tight text-xs text-ink">
                          {doc.title}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-m-red border border-m-red/30 bg-m-red/[0.08] px-2 py-0.5">
                          {DOC_CATEGORIES[doc.category].name}
                        </span>
                      </div>
                      <p className="text-[13px] text-ink-muted mt-1 line-clamp-1 font-light">
                        {doc.shortDescription}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-xs font-mono text-ink-muted">
                  <span className="uppercase text-[10px] text-m-red font-bold tracking-wider block mb-3">
                    Frequently Referenced Documents
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["payment-policy", "terms", "privacy", "security-policy", "gdpr", "nda", "sla"].map((slug) => {
                      const doc = ALL_DOCS.find((d) => d.slug === slug);
                      if (!doc) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/docs/${slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="px-3 py-1.5 border border-line bg-surface hover:border-m-red hover:text-m-red text-[10px] uppercase font-mono transition"
                        >
                          {doc.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
