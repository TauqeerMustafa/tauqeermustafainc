"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { navigation } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { company } from "@/data/company";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900"
            onClick={() => setIsOpen(false)}
          >
            {company.name}
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900",
                pathname.startsWith(item.href) && "text-zinc-900",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex">
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>

        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-zinc-700"
            aria-label="Toggle navigation"
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-zinc-200 lg:hidden" id="mobile-menu">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  pathname.startsWith(item.href) && "bg-zinc-100 text-zinc-900",
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}