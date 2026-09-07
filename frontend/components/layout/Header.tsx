"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { publicNavigation } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { company } from "@/data/company";

/* ── Secondary header used in admin/client areas — theme-flipping ── */

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/10 bg-canvas" role="banner">
      {/* ── Global nav — 44px, canvas background, 12px nav links ── */}
      <div className="mx-auto flex h-11 max-w-[1440px] items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="shrink-0 text-[12px] font-semibold leading-none tracking-[-0.12px] text-ink transition-opacity hover:opacity-70"
          aria-label={`${company.name} — home`}
        >
          {company.name}
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {publicNavigation.filter((n) => n.name !== "Home").map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-[12px] leading-none tracking-[-0.12px] text-ink/80 transition-colors hover:text-ink",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "text-ink opacity-100"
                  : "opacity-80"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center text-ink lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="border-t border-line/10 bg-canvas lg:hidden"
        >
          <nav className="flex flex-col px-5 pb-6 pt-4" aria-label="Mobile navigation">
            {publicNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "border-b border-line/10 py-3.5 text-[17px] leading-[1.47] tracking-[-0.374px] text-ink/80 transition-colors last:border-b-0 hover:text-ink",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    ? "text-ink"
                    : ""
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
