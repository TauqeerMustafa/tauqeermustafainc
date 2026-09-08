"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

import ThemeToggle from "@/components/layout/ThemeToggle";

/* ── BMW / BMW M navbar — theme-flipping chrome, M-stripe rail, uppercase utility nav ── */

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
  { name: "Community", href: "https://community.tauqeermustafa.tech" },
  { name: "Portals", href: "https://portals.tauqeermustafa.tech" },
  { name: "Contact", href: "/contact" },
];

const linkClass =
  "relative flex h-9 items-center px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/55 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [pathname]);

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
            <Image src="/logo-mark.svg" alt="" fill sizes="36px" className="object-cover" />
          </span>
          <span className="hidden sm:inline">Tauqeer Mustafa Inc.</span>
          <span className="sm:hidden">TMI</span>
        </Link>

        {/* Nav options — centred and evenly aligned */}
        <ul className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
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
              <ul className="grid gap-0.5">
                {navLinks.map((link) => (
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
