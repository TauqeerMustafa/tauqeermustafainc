"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

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
  "border-b-2 border-transparent px-2 py-2 text-sm font-medium text-[#525252] transition hover:border-[#D4D4D4] hover:text-[#0A0A0A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E5E5] bg-white/95 shadow-[0_1px_8px_rgba(17,24,39,0.04)] supports-[backdrop-filter]:bg-white/88 supports-[backdrop-filter]:backdrop-blur-md">
      <nav className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:gap-6">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 pr-3 text-sm font-semibold tracking-tight text-[#0A0A0A] transition hover:text-[#262626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] sm:text-base"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA]">
            <Image
              src="/logo-mark.svg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          Tauqeer Mustafa Inc.
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`${linkClass} ${pathname === link.href ? "border-[#0A0A0A] text-[#0A0A0A]" : ""}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <details ref={detailsRef} open={isOpen} className="group relative lg:hidden">
          {isOpen ? (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            />
          ) : null}
          <summary
            onClick={(event) => {
              event.preventDefault();
              setIsOpen((prev) => !prev);
            }}
            className="relative z-50 flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-none border border-[#E5E5E5] bg-white text-[#0A0A0A] transition hover:bg-[#F4F4F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] [&::-webkit-details-marker]:hidden"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
          </summary>

          <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2.5rem))] border border-[#E5E5E5] bg-white p-3 shadow-[0_16px_36px_rgba(17,24,39,0.12)]">
            <ul className="grid gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`block border-l-2 px-4 py-3 text-sm font-semibold transition hover:bg-[#FAFAFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] ${pathname === link.href ? "border-[#0A0A0A] bg-[#FAFAFA] text-[#0A0A0A]" : "border-transparent text-[#525252]"}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </nav>
    </header>
  );
}
