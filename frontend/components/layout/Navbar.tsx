"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CreditCard,
  FileText,
  LifeBuoy,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

import ThemeToggle from "@/components/layout/ThemeToggle";

/** Main domain navigation links */
const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Careers", href: "/careers" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

/** Official company subdomains */
const companySubdomains = [
  {
    name: "Client Workspace",
    subdomain: "client",
    description: "Dedicated project tracking, deliverables & source code",
    icon: ShieldCheck,
  },
  {
    name: "Documentation",
    subdomain: "docs",
    description: "Official guidelines, company policies, specs & SLAs",
    icon: FileText,
  },
  {
    name: "Support & Helpdesk",
    subdomain: "support",
    description: "24/7 client helpdesk, ticketing & incident status",
    icon: LifeBuoy,
  },
  {
    name: "Billing & Treasury",
    subdomain: "billing",
    description: "Invoicing, card settlement & payment policies",
    icon: CreditCard,
  },
  {
    name: "Corporate Portals",
    subdomain: "portals",
    description: "Secure client, employee & management workspaces",
    icon: ShieldCheck,
  },
];

function getSubdomainHref(sub: string) {
  return `https://${sub}.qorlune.co.uk`;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    setIsOpen(false);
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
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-zinc-200 dark:bg-zinc-950/95 dark:border-zinc-800">
      {/* M-stripe rail — signature brand element */}
      <div className="m-stripe" aria-hidden="true" />

      <nav className="mx-auto flex min-h-[4.25rem] max-w-[1200px] items-center justify-between gap-4 px-5 py-3 sm:px-6">
        {/* Brand — left */}
        <Link
          href="/"
          className="inline-flex min-h-10 shrink-0 items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-zinc-900 transition-opacity hover:opacity-80 dark:text-white"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <Image
              src="/logo.png"
              alt="Qorlune LLC"
              fill
              sizes="36px"
              className="object-contain p-1"
              priority
            />
          </span>
          <span className="text-zinc-900 dark:text-white">Qorlune LLC</span>
        </Link>

        {/* Nav options — desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex h-9 items-center px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-zinc-900 font-semibold dark:text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span
                      className="absolute inset-x-3 -bottom-[1px] h-[2px] bg-zinc-900 dark:bg-white"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}

          {/* Company Subdomains Dropdown */}
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
              className={`flex h-9 cursor-pointer items-center gap-1 px-3 text-sm font-medium transition-colors ${
                isDropdownOpen
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span>Company</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-zinc-900 dark:text-white" : "text-zinc-400"
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Subdomains Flyout Panel */}
            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
              >
                {/* M-stripe top accent rail */}
                <div className="flex h-[2px] w-full mb-2 overflow-hidden rounded-full" aria-hidden="true">
                  <span className="flex-1 bg-m-blue" />
                  <span className="flex-1 bg-m-blue-mid" />
                  <span className="flex-1 bg-m-red" />
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {companySubdomains.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={getSubdomainHref(item.subdomain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsDropdownOpen(false)}
                        className="group/tag flex items-center justify-between rounded-md px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                        role="menuitem"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-zinc-500 group-hover/tag:text-zinc-900 dark:text-zinc-400 dark:group-hover/tag:text-white shrink-0" aria-hidden="true" />
                          <span className="text-xs font-semibold">
                            {item.name}
                          </span>
                        </span>
                        <ArrowUpRight className="h-3 w-3 shrink-0 text-zinc-400 group-hover/tag:text-zinc-900 dark:group-hover/tag:text-white group-hover/tag:translate-x-0.5 transition-all" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </li>
        </ul>

        {/* Right cluster — theme switch, CTA, mobile menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/contact"
            className="group hidden shrink-0 items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 sm:inline-flex"
          >
            Start a Project
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer / Dropdown */}
      {isOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-4 top-16 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Primary links */}
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-white"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Subdomains section */}
            <div className="my-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <span className="block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Company Subdomains
              </span>
              <ul className="space-y-0.5">
                {companySubdomains.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <a
                        href={getSubdomainHref(item.subdomain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-zinc-400 shrink-0" aria-hidden="true" />
                          <span>{item.name}</span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Start a Project
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
