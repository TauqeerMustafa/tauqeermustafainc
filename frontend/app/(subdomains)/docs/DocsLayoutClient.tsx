"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  ExternalLink,
  Menu,
  X,
  Shield,
  Lock,
  CreditCard,
  Compass,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import ThemeToggle from "@/components/layout/ThemeToggle";
import { ALL_DOCS, DOC_CATEGORIES, type DocCategory, searchDocs } from "@/data/docs-registry";

const CATEGORY_ICONS: Record<DocCategory, typeof Shield> = {
  legal: Shield,
  security: Lock,
  commercial: CreditCard,
  operations: Compass,
};

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
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-line-2 bg-canvas/85 backdrop-blur-md">
        <div className="m-stripe" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ink-muted hover:text-ink border border-line-2 bg-surface cursor-pointer"
              aria-label="Toggle Documentation Sidebar"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link href="/docs" className="flex items-center gap-3 transition hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center bg-action text-on-action font-mono text-xs font-bold">
                TM
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[13px] font-bold tracking-tight text-ink uppercase">
                  Tauqeer Mustafa Inc.
                </span>
                <span className="font-mono text-[10px] tracking-wider text-action font-semibold uppercase flex items-center gap-1">
                  <BookOpen size={10} />
                  <span>Docs & Legal Policies</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between border border-line-2 bg-surface px-3.5 py-1.5 font-mono text-xs text-ink-muted hover:border-action hover:text-ink transition shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-action" />
                <span>Search 23 policies & documents...</span>
              </span>
              <kbd className="border border-line px-1.5 py-0.5 text-[10px] bg-card text-ink-muted">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-ink-muted hover:text-ink border border-line-2 bg-surface cursor-pointer"
              aria-label="Search documents"
            >
              <Search size={16} />
            </button>

            <a
              href="https://tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink transition border border-line-2 bg-surface px-3 py-1.5"
            >
              <span>Main Site</span>
              <ExternalLink size={12} />
            </a>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 py-8 pr-6 border-r border-line-2 self-start sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mb-6 px-3 py-2 bg-action/5 border border-action/20">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action flex items-center gap-1">
              <Sparkles size={11} />
              <span>Official Knowledge Base</span>
            </span>
            <p className="text-[11px] text-ink-muted mt-0.5">
              23 verified policies, compliance standards & playbooks.
            </p>
          </div>

          <nav className="space-y-6 text-xs font-mono">
            {(['legal', 'security', 'commercial', 'operations'] as DocCategory[]).map((catId) => {
              const meta = DOC_CATEGORIES[catId];
              const Icon = CATEGORY_ICONS[catId];
              const docs = ALL_DOCS.filter((d) => d.category === catId);

              return (
                <div key={catId} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1 font-bold uppercase tracking-wider text-ink border-b border-line pb-1.5">
                    <Icon size={13} className="text-action shrink-0" />
                    <span>{meta.name}</span>
                  </div>

                  <ul className="pt-1 space-y-0.5">
                    {docs.map((doc) => {
                      const docPath = `/docs/${doc.slug}`;
                      const isActive = pathname === docPath;

                      return (
                        <li key={doc.slug}>
                          <Link
                            href={docPath}
                            className={`flex items-center justify-between px-3 py-1.5 transition ${
                              isActive
                                ? "bg-action/10 text-action font-bold border-l-2 border-action pl-2.5"
                                : "text-ink-muted hover:text-ink hover:bg-surface"
                            }`}
                          >
                            <span className="truncate">{doc.title}</span>
                            {isActive && <ChevronRight size={12} className="text-action shrink-0" />}
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
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="w-4/5 max-w-sm bg-surface h-full p-6 overflow-y-auto flex flex-col border-r border-line">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <span className="font-mono text-xs font-bold uppercase text-ink">
                  Docs Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-6 text-xs font-mono flex-1">
                {(['legal', 'security', 'commercial', 'operations'] as DocCategory[]).map((catId) => {
                  const meta = DOC_CATEGORIES[catId];
                  const Icon = CATEGORY_ICONS[catId];
                  const docs = ALL_DOCS.filter((d) => d.category === catId);

                  return (
                    <div key={catId} className="space-y-1.5">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-ink border-b border-line pb-1">
                        <Icon size={13} className="text-action" />
                        <span>{meta.name}</span>
                      </div>
                      <ul className="space-y-1">
                        {docs.map((doc) => (
                          <li key={doc.slug}>
                            <Link
                              href={`/docs/${doc.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-2 py-1 text-ink-muted hover:text-action truncate"
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

        {/* Document Content Area */}
        <div className="flex-1 min-w-0 py-8 lg:pl-10">{children}</div>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-20 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-surface border border-line-2 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-4 border-b border-line bg-card">
              <Search size={18} className="text-action shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agreements, policies, GDPR, payment rules, NDA..."
                className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-ink-muted hover:text-ink text-xs font-mono uppercase px-2 py-1 border border-line cursor-pointer"
              >
                Esc
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {searchQuery.trim() && searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-muted font-mono">
                  No matching policies found for "{searchQuery}".
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
                      className="block p-3 border border-transparent hover:border-action hover:bg-surface transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-ink">{doc.title}</span>
                        <span className="font-mono text-[10px] uppercase text-action border border-action/30 px-1.5 py-0.5">
                          {DOC_CATEGORIES[doc.category].name}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1 line-clamp-1">
                        {doc.shortDescription}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-xs font-mono text-ink-muted">
                  <span className="uppercase text-[10px] text-action font-bold block mb-2">
                    Popular Policies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['payment-policy', 'terms', 'privacy', 'security-policy', 'gdpr', 'nda'].map((slug) => {
                      const doc = ALL_DOCS.find((d) => d.slug === slug);
                      if (!doc) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/docs/${slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="px-2 py-1 border border-line bg-card hover:border-action hover:text-action text-[11px] transition"
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

      {/* Docs Footer */}
      <footer className="border-t border-line-2 bg-surface py-8 text-xs text-ink-muted font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>&copy; {new Date().getFullYear()} Tauqeer Mustafa Inc.</span>
            <span className="text-ink/20 mx-2">�</span>
            <span>Official Policy & Legal Repository</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-action transition">
              Index
            </Link>
            <span className="text-ink/20">�</span>
            <Link href="/docs/payment-policy" className="hover:text-action transition">
              Payment Policy
            </Link>
            <span className="text-ink/20">�</span>
            <Link href="/docs/privacy" className="hover:text-action transition">
              Privacy
            </Link>
            <span className="text-ink/20">�</span>
            <a href="mailto:legal@tauqeermustafa.tech" className="text-action hover:underline font-bold">
              legal@tauqeermustafa.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
