"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  ChevronDown,
  FileText,
  LayoutGrid,
  Menu,
  Users,
  X,
} from "lucide-react";

import ThemeToggle from "@/components/layout/ThemeToggle";

/* ── BMW / BMW M navbar — theme-flipping chrome, M-stripe rail, uppercase utility nav ── */

const primaryNav = [
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
];

const dropdownNav = [
  {
    name: "Careers",
    href: "/careers",
    description: "Join our engineering & design team",
    icon: Briefcase,
    external: false,
  },
  {
    name: "Blog",
    href: "/blog",
    description: "Engineering insights, architecture & updates",
    icon: BookOpen,
    external: false,
  },
  {
    name: "Community",
    href: "https://community.tauqeermustafa.tech",
    description: "Developer discussions, forums & tech hub",
    icon: Users,
    external: true,
  },
  {
    name: "Portals",
    href: "https://portals.tauqeermustafa.tech",
    description: "Client, employee & executive workspaces",
    icon: LayoutGrid,
    external: true,
  },
  {
    name: "Documentation",
    href: "/docs",
    description: "Policies, standards, SLAs & specifications",
    icon: FileText,
    external: false,
  },
];

const linkClass =
  "relative flex h-9 items-center px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const detailsRef = useRef<HTMLDetailsElement>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current route matches any item inside the dropdown
  const isDropdownActive = dropdownNav.some(
    (item) => !item.external && (pathname === item.href || pathname.startsWith(item.href + "/"))
  );

  function handleMouseEnter() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsDropdownOpen(true);
  }

  function handleMouseLeave() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 180);
  }

  function handleDropdownToggle() {
    setIsDropdownOpen((prev) => !prev);
  }

  // Close menus on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    const closeMenu = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Keyboard navigation: Escape key closes dropdown
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-canvas/95 supports-[backdrop-filter]:bg-canvas/85 supports-[backdrop-filter]:backdrop-blur-xl">
      {/* M-stripe rail — signature brand element (literal tricolor) */}
      <div className="m-stripe" aria-hidden="true" />

      <nav className="mx-auto flex min-h-[4.5rem] max-w-[1200px] items-center gap-4 px-5 py-3 sm:px-6">
        {/* Brand — left */}
        <Link
          href="/"
          className="inline-flex min-h-10 shrink-0 items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-ink transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-ink/15 bg-ink/[0.06]">
            <Image src="/logo.png" alt="Tauqeer Mustafa Inc." fill sizes="36px" className="object-cover" priority />
          </span>
          <span className="hidden sm:inline">Tauqeer Mustafa Inc.</span>
          <span className="sm:hidden">TMI</span>
        </Link>

        {/* Nav options — centred with plenty of breathing room */}
        <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {primaryNav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`${linkClass} ${isActive ? "text-ink" : ""}`}
                >
                  {link.name}
                  <span
                    className={`absolute inset-x-3 -bottom-[7px] h-[2px] bg-action transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}

          {/* More Dropdown (Careers, Blog, Community, Portals, Documentation) */}
          <li
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={handleDropdownToggle}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              className={`${linkClass} cursor-pointer gap-1.5 ${
                isDropdownActive || isDropdownOpen ? "text-ink" : ""
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`h-3 w-3 text-ink/50 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-action" : ""
                }`}
                aria-hidden="true"
              />
              <span
                className={`absolute inset-x-3 -bottom-[7px] h-[2px] bg-action transition-transform duration-300 ${
                  isDropdownActive ? "scale-x-100" : "scale-x-0"
                }`}
                aria-hidden
              />
            </button>

            {/* Precision Dropdown Menu */}
            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-80 border border-ink/15 bg-canvas/95 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] z-50 animate-in fade-in-0 zoom-in-95 duration-150"
              >
                {/* Subtle M-stripe top accent */}
                <div className="flex h-[2px] w-full mb-1.5" aria-hidden="true">
                  <span className="flex-1 bg-m-blue" />
                  <span className="flex-1 bg-m-blue-mid" />
                  <span className="flex-1 bg-m-red" />
                </div>

                <div className="grid gap-0.5">
                  {dropdownNav.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      !item.external &&
                      (pathname === item.href || pathname.startsWith(item.href + "/"));

                    const content = (
                      <div className="flex items-start gap-3 p-2.5 transition-colors hover:bg-ink/[0.05] group/item text-left">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-colors ${
                            isActive
                              ? "border-action/50 bg-action/10 text-action"
                              : "border-ink/10 bg-ink/[0.03] text-ink/60 group-hover/item:border-action/40 group-hover/item:bg-action/[0.08] group-hover/item:text-action"
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${
                                isActive ? "text-action" : "text-ink group-hover/item:text-ink"
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.external && (
                              <ArrowUpRight
                                className="h-3 w-3 text-ink/40 group-hover/item:text-action transition-colors"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] font-light leading-snug text-ink/55 group-hover/item:text-ink/80 transition-colors">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );

                    if (item.external) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-action"
                          role="menuitem"
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-action"
                        role="menuitem"
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </li>
        </ul>

        {/* Right cluster — theme switch, quote, mobile menu */}
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <ThemeToggle />

          <Link
            href="/contact"
            className="group hidden shrink-0 items-center gap-2 bg-action px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-on-action transition-colors hover:bg-action-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action sm:inline-flex"
          >
            Get a Quote
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
          </Link>

          <details ref={detailsRef} open={isOpen} className="group relative lg:hidden">
            {isOpen ? (
              <div className="fixed inset-0 z-40 lg:hidden" aria-hidden="true" onClick={() => setIsOpen(false)} />
            ) : null}
            <summary
              onClick={(event) => {
                event.preventDefault();
                setIsOpen((prev) => !prev);
              }}
              className="relative z-50 flex h-11 w-11 cursor-pointer list-none items-center justify-center border border-ink/15 bg-ink/[0.06] text-ink transition hover:bg-ink/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action [&::-webkit-details-marker]:hidden"
            >
              {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
            </summary>

            <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2.5rem))] border border-line bg-surface p-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
              {/* Primary links */}
              <ul className="grid gap-0.5">
                {primaryNav.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={`block border-l-2 px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition hover:bg-ink/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                        pathname === link.href
                          ? "border-action bg-ink/[0.06] text-ink"
                          : "border-transparent text-ink/60"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Group divider */}
              <div className="my-2 border-t border-ink/10 pt-2 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">
                More & Ecosystem
              </div>

              {/* Dropdown / Ecosystem links */}
              <ul className="grid gap-0.5">
                {dropdownNav.map((link) => {
                  const isActive =
                    !link.external &&
                    (pathname === link.href || pathname.startsWith(link.href + "/"));
                  const content = (
                    <div className="flex items-center justify-between">
                      <span>{link.name}</span>
                      {link.external && (
                        <ArrowUpRight className="h-3 w-3 text-ink/40" aria-hidden="true" />
                      )}
                    </div>
                  );

                  if (link.external) {
                    return (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="block border-l-2 border-transparent px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60 transition hover:bg-ink/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                        >
                          {content}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`block border-l-2 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition hover:bg-ink/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                          isActive
                            ? "border-action bg-ink/[0.06] text-ink"
                            : "border-transparent text-ink/60"
                        }`}
                      >
                        {content}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 bg-action px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-on-action transition-colors hover:bg-action-strong"
              >
                Get a Quote
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
