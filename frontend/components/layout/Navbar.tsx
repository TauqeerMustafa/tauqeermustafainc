"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";

/* ── BMW / BMW M navbar — dark chrome, M-stripe rail, uppercase utility nav ── */

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const linkClass =
  "relative flex h-9 items-center px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1a2129]/95 supports-[backdrop-filter]:bg-[#1a2129]/85 supports-[backdrop-filter]:backdrop-blur-xl">
      {/* M-stripe rail — signature brand element */}
      <div className="flex h-[3px]" aria-hidden>
        <span className="flex-1 bg-[#0066b1]" />
        <span className="flex-1 bg-[#1c69d4]" />
        <span className="flex-1 bg-[#e22718]" />
      </div>

      <nav className="mx-auto flex min-h-[4.5rem] max-w-[1200px] items-center gap-4 px-5 py-3 sm:px-6">
        {/* Brand — left */}
        <Link
          href="/"
          className="inline-flex min-h-10 shrink-0 items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1c69d4]"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-white/[0.06]">
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
                  className={`${linkClass} ${isActive ? "text-white" : ""}`}
                >
                  {link.name}
                  <span
                    className={`absolute inset-x-3 -bottom-[7px] h-[2px] bg-[#1c69d4] transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quote button — top right corner, rectangular BMW utility button */}
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            href="/contact"
            className="group hidden shrink-0 items-center gap-2 bg-[#1c69d4] px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0066b1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] sm:inline-flex"
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
              className="relative z-50 flex h-11 w-11 cursor-pointer list-none items-center justify-center border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1c69d4] [&::-webkit-details-marker]:hidden"
            >
              {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
            </summary>

            <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2.5rem))] border border-white/10 bg-[#0d0d0d] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
              <ul className="grid gap-0.5">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={`block border-l-2 px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] ${
                        pathname === link.href
                          ? "border-[#1c69d4] bg-white/[0.06] text-white"
                          : "border-transparent text-white/60"
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
                className="mt-3 flex items-center justify-center gap-2 bg-[#1c69d4] px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0066b1]"
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
