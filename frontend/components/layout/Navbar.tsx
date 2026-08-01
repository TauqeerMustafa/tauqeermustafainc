"use client";

import { useRef, useState } from "react";
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
  "border-b-2 border-transparent px-2 py-2 text-sm font-medium text-[#4B5563] transition hover:border-[#C7D2E0] hover:text-[#0A1628] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5FFF]";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 shadow-[0_1px_8px_rgba(17,24,39,0.04)] supports-[backdrop-filter]:bg-white/88 supports-[backdrop-filter]:backdrop-blur-md">
      <nav className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:gap-6">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center gap-2 pr-3 text-sm font-semibold tracking-tight text-[#0A1628] transition hover:text-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF] sm:text-base"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-[#D7DEE8] bg-[#F4F7FC]">
            <Image
              src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-logo-badge_cfkewe.jpg"
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
                className={`${linkClass} ${pathname === link.href ? "border-[#0B5FFF] text-[#0A1628]" : ""}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-semibold text-[#0A1628] transition hover:text-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
          >
            Login
          </Link>
          <Link
            href="/contact"
            className="rounded-none bg-[#0B5FFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(11,95,255,0.25)] transition hover:bg-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
          >
            Start
          </Link>
        </div>

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
            className="relative z-50 flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-none border border-[#D7DEE8] bg-white text-[#0A1628] transition hover:bg-[#F4F4F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF] [&::-webkit-details-marker]:hidden"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</span>
          </summary>

          <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2.5rem))] border border-[#D7DEE8] bg-white p-3 shadow-[0_16px_36px_rgba(17,24,39,0.12)]">
            <ul className="grid gap-1">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`block border-l-2 px-4 py-3 text-sm font-semibold transition hover:bg-[#F4F7FC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5FFF] ${pathname === link.href ? "border-[#0B5FFF] bg-[#F4F7FC] text-[#0A1628]" : "border-transparent text-[#4B5563]"}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E5E7EB] pt-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-none border border-[#D7DEE8] px-4 py-3 text-center text-sm font-semibold text-[#0A1628] transition hover:bg-[#F4F4F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5FFF]"
              >
                Login
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="rounded-none bg-[#0B5FFF] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B5FFF]"
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
