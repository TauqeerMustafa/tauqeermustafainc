"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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
  "border-b-2 border-transparent px-2 py-2 text-sm font-medium text-[#4B5563] transition hover:border-[#D9D9D2] hover:text-[#111827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 shadow-[0_1px_8px_rgba(17,24,39,0.04)] supports-[backdrop-filter]:bg-white/88 supports-[backdrop-filter]:backdrop-blur-md">
      <nav className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:gap-6">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 pr-3 text-sm font-semibold tracking-tight text-[#111827] transition hover:text-[#9A7400] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227] sm:text-base"
        >
          <span className="flex h-9 w-9 items-center justify-center border border-[#E4E4DE] bg-[#FAFAF8]">
            <span className="h-2.5 w-2.5 bg-[#C9A227]" aria-hidden="true" />
          </span>
          Tauqeer Mustafa Inc.
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`${linkClass} ${pathname === link.href ? "border-[#C9A227] text-[#111827]" : ""}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-semibold text-[#111827] transition hover:text-[#9A7400] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          >
            Login
          </Link>
          <Link
            href="/contact"
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(17,24,39,0.12)] transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          >
            Start
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md border border-[#E4E4DE] bg-white text-[#111827] transition hover:bg-[#F4F4F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227] [&::-webkit-details-marker]:hidden">
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>

          <div className="absolute right-0 top-14 w-[min(22rem,calc(100vw-2.5rem))] border border-[#E4E4DE] bg-white p-3 shadow-[0_16px_36px_rgba(17,24,39,0.12)]">
            <ul className="grid gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`block border-l-2 px-4 py-3 text-sm font-semibold transition hover:bg-[#FAFAF8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227] ${pathname === link.href ? "border-[#C9A227] bg-[#FAFAF8] text-[#111827]" : "border-transparent text-[#4B5563]"}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E5E7EB] pt-3">
              <Link
                href="/login"
                className="rounded-full border border-[#E4E4DE] px-4 py-3 text-center text-sm font-semibold text-[#111827] transition hover:bg-[#F4F4F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
              >
                Login
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-[#111827] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
              >
                Start
              </Link>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
