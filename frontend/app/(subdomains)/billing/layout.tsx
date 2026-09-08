import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: {
    template: "%s | TMI Billing & Treasury",
    default: "Billing & Treasury Portal | Tauqeer Mustafa Inc.",
  },
  description:
    "Official corporate billing, client payments, contractor payouts, and financial settlement policies.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const NAV_ITEMS = [
  { label: "Overview", href: "/billing" },
  { label: "Make a Payment", href: "/billing/pay" },
  { label: "Payouts & Disbursements", href: "/billing/payouts" },
  { label: "Payment Policies", href: "/billing/policies" },
];

export default function BillingSubdomainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Precision Editorial Header - Identical to Main Navbar */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-canvas/95 supports-[backdrop-filter]:bg-canvas/85 supports-[backdrop-filter]:backdrop-blur-xl">
        <div className="m-stripe" aria-hidden="true" />
        <div className="mx-auto flex min-h-[4.5rem] max-w-[1200px] items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/billing"
              className="inline-flex min-h-10 shrink-0 items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.01em] text-ink transition-opacity hover:opacity-80"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-ink/15 bg-ink/[0.06]">
                <Image src="/logo.png" alt="Tauqeer Mustafa Inc." fill sizes="36px" className="object-cover" priority />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-bold tracking-tight text-ink uppercase text-[14px]">
                  Tauqeer Mustafa Inc.
                </span>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-action mt-0.5">
                  // Billing & Treasury
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-line">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60 hover:text-ink hover:bg-surface transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://docs.tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60 hover:text-ink transition px-3 py-1.5 border border-line bg-surface"
            >
              Docs
            </a>

            <a
              href="https://tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/60 hover:text-ink transition px-3 py-1.5 border border-line bg-surface"
            >
              <span>Main Site</span>
              <ExternalLink size={11} />
            </a>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden border-t border-line bg-surface px-4 py-2 flex items-center justify-around font-mono text-[11px] uppercase tracking-wider">
          <Link href="/billing/pay" className="font-semibold text-action py-1">
            Pay
          </Link>
          <span className="text-ink/30">//</span>
          <Link href="/billing/payouts" className="font-semibold text-ink-muted hover:text-ink py-1">
            Payouts
          </Link>
          <span className="text-ink/30">//</span>
          <Link href="/billing/policies" className="font-semibold text-ink-muted hover:text-ink py-1">
            Policies
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Corporate Treasury Footer */}
      <footer className="border-t border-line bg-surface py-8 text-xs text-ink-muted font-mono">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink uppercase">Tauqeer Mustafa Inc. Treasury</span>
            <span>//</span>
            <span>Global Settlement Operations</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://docs.tauqeermustafa.tech/payment-policy" className="hover:text-action uppercase">
              Payment Policy
            </a>
            <a href="https://docs.tauqeermustafa.tech/refund-policy" className="hover:text-action uppercase">
              Refund Terms
            </a>
            <a href="mailto:billing@tauqeermustafa.tech" className="hover:text-action uppercase">
              billing@tauqeermustafa.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
