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
  Shield,
  CreditCard,
  Layers,
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
      {/* Precision Editorial Header - Identical to Main Navbar */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/95 supports-[backdrop-filter]:bg-canvas/85 supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="m-stripe" aria-hidden="true" />
        <div className="mx-auto flex min-h-[4.5rem] max-w-[1200px] items-center gap-4 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative flex h-9 w-9 cursor-pointer items-center justify-center border border-ink/15 bg-ink/[0.06] text-ink transition hover:bg-ink/[0.12]"
              aria-label="Toggle Documentation Sidebar"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <Link
              href="/docs"
              className="inline-flex min-h-10 shrink-0 items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-ink transition-opacity hover:opacity-80"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-ink/15 bg-ink/[0.06]">
                <Image src="/logo-mark.svg" alt="" fill sizes="36px" className="object-cover" />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-bold tracking-tight text-ink uppercase text-[14px]">
                  Tauqeer Mustafa Inc.
                </span>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-action mt-0.5">
                  // Documentation & Policies
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Trigger */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between border border-line bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-ink/60 hover:border-action hover:text-ink transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search size={13} className="text-action" />
                <span>Search 23 Policies & Docs...</span>
              </span>
              <kbd className="border border-line px-1.5 py-0.5 text-[9px] bg-card text-ink-muted font-mono">
                CTRL+K
              </kbd>
            </button>
          </div>

          {/* Right Links & Theme Toggle */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center border border-line bg-surface text-ink-muted hover:text-ink cursor-pointer"
              aria-label="Search documents"
            >
              <Search size={15} />
            </button>

            <Link
              href="/billing"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60 hover:text-ink transition px-3 py-1.5 border border-line bg-surface"
            >
              Billing
            </Link>

            <a
              href="https://tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60 hover:text-ink transition px-3 py-1.5 border border-line bg-surface"
            >
              <span>Main Site</span>
              <ExternalLink size={11} />
            </a>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 flex-1 w-full flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 py-8 pr-6 border-r border-line self-start sticky top-[4.5rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="mb-6 border-b border-line pb-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-action">
              Policy Index
            </p>
            <p className="text-[12px] font-light text-ink-muted mt-1">
              23 corporate standards and legal frameworks.
            </p>
          </div>

          <nav className="space-y-6">
            {CATEGORY_ORDER.map((catId, index) => {
              const meta = DOC_CATEGORIES[catId];
              const docs = ALL_DOCS.filter((d) => d.category === catId);

              return (
                <div key={catId} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink/80 border-b border-line/60 pb-1.5">
                    <span>0{index + 1} // {meta.name}</span>
                    <span className="text-action">{docs.length}</span>
                  </div>

                  <ul className="pt-1 space-y-0.5 font-mono text-[11px]">
                    {docs.map((doc) => {
                      const docPath = `/docs/${doc.slug}`;
                      const isActive = pathname === docPath;

                      return (
                        <li key={doc.slug}>
                          <Link
                            href={docPath}
                            className={`flex items-center justify-between px-2.5 py-1.5 transition uppercase tracking-[0.04em] ${
                              isActive
                                ? "border-l-2 border-action bg-action/[0.08] text-action font-bold pl-2"
                                : "text-ink-muted hover:text-ink hover:bg-surface"
                            }`}
                          >
                            <span className="truncate">{doc.title}</span>
                            {isActive && <ChevronRight size={11} className="text-action shrink-0" />}
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
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
            <div className="w-4/5 max-w-sm bg-surface h-full p-6 overflow-y-auto flex flex-col border-r border-line">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
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
                    <div key={catId} className="space-y-1.5">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink border-b border-line pb-1">
                        0{index + 1} // {meta.name}
                      </div>
                      <ul className="space-y-1 font-mono text-[11px]">
                        {docs.map((doc) => (
                          <li key={doc.slug}>
                            <Link
                              href={`/docs/${doc.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-2 py-1 text-ink-muted hover:text-action uppercase truncate"
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

        {/* Main Content Pane */}
        <div className="flex-1 min-w-0 py-8 lg:pl-10">{children}</div>
      </div>

      {/* Global Search Modal - Precision Editorial Style */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center p-4 pt-20 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-canvas border border-line shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-4 border-b border-line bg-surface">
              <Search size={16} className="text-action shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY POLICY, GDPR, CCPA, NDA, SLA, PAYMENT..."
                className="w-full bg-transparent font-mono text-xs uppercase tracking-wider text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-ink-muted hover:text-ink text-[10px] font-mono uppercase px-2 py-1 border border-line bg-card cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {searchQuery.trim() && searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-muted font-mono uppercase">
                  No matching policies found for &quot;{searchQuery}&quot;.
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="block p-3 border border-transparent hover:border-line hover:bg-surface transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-tight text-xs text-ink">
                          {doc.title}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-action border border-action/30 bg-action/[0.06] px-2 py-0.5">
                          {DOC_CATEGORIES[doc.category].name}
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-muted mt-1 line-clamp-1 font-light">
                        {doc.shortDescription}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-xs font-mono text-ink-muted">
                  <span className="uppercase text-[10px] text-action font-bold tracking-wider block mb-2">
                    Core Referenced Documents
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["payment-policy", "terms", "privacy", "security-policy", "gdpr", "nda", "sla"].map((slug) => {
                      const doc = ALL_DOCS.find((d) => d.slug === slug);
                      if (!doc) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/docs/${slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="px-2.5 py-1 border border-line bg-surface hover:border-action hover:text-action text-[10px] uppercase font-mono transition"
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
