import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Banknote, ShieldCheck, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: {
    template: "%s | TMI Billing & Treasury",
    default: "Billing & Treasury Portal | Tauqeer Mustafa Inc.",
  },
  description:
    "Official corporate billing, client payments, contractor payouts, and financial settlement policies.",
};

const NAV_ITEMS = [
  { label: "Overview", href: "/billing", icon: null },
  { label: "Make a Payment", href: "/billing/pay", icon: CreditCard },
  { label: "Payouts & Disbursements", href: "/billing/payouts", icon: Banknote },
  { label: "Payment Policies", href: "/billing/policies", icon: ShieldCheck },
];

export default function BillingSubdomainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Subdomain Header */}
      <header className="sticky top-0 z-40 border-b border-line-2 bg-canvas/80 backdrop-blur-md">
        <div className="m-stripe" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/billing"
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center bg-action text-on-action font-mono text-xs font-bold">
                TM
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[13px] font-bold tracking-tight text-ink uppercase">
                  Tauqeer Mustafa Inc.
                </span>
                <span className="font-mono text-[10px] tracking-wider text-action font-semibold uppercase">
                  Billing & Treasury
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-line">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-action hover:bg-surface transition"
                >
                  {item.icon && <item.icon size={13} className="text-action" />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink transition border border-line-2 bg-surface px-3 py-1.5"
            >
              <span>Main Site</span>
              <ExternalLink size={12} />
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden border-t border-line-2 bg-surface px-4 py-2 flex items-center justify-around text-xs font-mono">
          <Link href="/billing/pay" className="font-semibold text-action uppercase py-1">
            Pay
          </Link>
          <span className="text-ink/20">�</span>
          <Link href="/billing/payouts" className="font-semibold text-ink-muted hover:text-ink uppercase py-1">
            Payouts
          </Link>
          <span className="text-ink/20">�</span>
          <Link href="/billing/policies" className="font-semibold text-ink-muted hover:text-ink uppercase py-1">
            Policies
          </Link>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Subdomain Footer */}
      <footer className="border-t border-line-2 bg-surface py-8 text-xs text-ink-muted font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Tauqeer Mustafa Inc.</span>
            <span className="text-ink/20">�</span>
            <span>Corporate Billing & Treasury</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/billing/policies" className="hover:text-action transition">
              Payment Policy
            </Link>
            <span className="text-ink/20">�</span>
            <Link href="/billing/policies" className="hover:text-action transition">
              Refund Terms
            </Link>
            <span className="text-ink/20">�</span>
            <a
              href="mailto:billing@tauqeermustafa.tech"
              className="text-action hover:underline font-bold"
            >
              billing@tauqeermustafa.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
