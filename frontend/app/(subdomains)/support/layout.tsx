import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  LifeBuoy,
  Ticket,
  Activity,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: {
    template: "%s | TMI Support & Helpdesk",
    default: "Support & Help Center | Tauqeer Mustafa Inc.",
  },
  description:
    "Official customer support, technical helpdesk, incident escalation, knowledge base, and live system status for Tauqeer Mustafa Inc.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const NAV_ITEMS = [
  { label: "Overview", href: "/support", icon: LifeBuoy },
  { label: "Submit Ticket", href: "/support/ticket", icon: Ticket },
  { label: "System Status", href: "/support/status", icon: Activity },
  { label: "Knowledge & FAQ", href: "/support/faq", icon: HelpCircle },
  { label: "Direct Contact", href: "/support/contact", icon: PhoneCall },
];

export default function SupportSubdomainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Subdomain Header */}
      <header className="sticky top-0 z-40 border-b border-line-2 bg-canvas/85 backdrop-blur-md">
        <div className="m-stripe" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/support"
              className="flex items-center gap-3 transition hover:opacity-85"
            >
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-line bg-surface">
                <Image src="/logo.png" alt="Tauqeer Mustafa Inc." fill sizes="32px" className="object-cover" priority />
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[13px] font-bold tracking-tight text-ink uppercase">
                  Tauqeer Mustafa Inc.
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] tracking-wider text-action font-semibold uppercase">
                    Support & Helpdesk
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-medium border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Systems Live
                  </span>
                </div>
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
                  <item.icon size={13} className="text-action" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://portals.tauqeermustafa.tech"
              className="hidden lg:inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink transition border border-line-2 bg-surface px-3 py-1.5"
            >
              <ShieldCheck size={13} className="text-action" />
              <span>Client Portal</span>
              <ExternalLink size={11} />
            </a>
            <a
              href="https://tauqeermustafa.tech"
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-ink transition border border-line-2 bg-surface px-3 py-1.5"
            >
              <span>Main Site</span>
              <ExternalLink size={11} />
            </a>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <div className="md:hidden border-t border-line-2 bg-surface px-4 py-2 flex items-center justify-around text-xs font-mono overflow-x-auto">
          <Link href="/support" className="font-semibold text-action uppercase py-1 whitespace-nowrap">
            Overview
          </Link>
          <span className="text-ink/20">|</span>
          <Link href="/support/ticket" className="font-semibold text-ink-muted hover:text-ink uppercase py-1 whitespace-nowrap">
            Tickets
          </Link>
          <span className="text-ink/20">|</span>
          <Link href="/support/status" className="font-semibold text-ink-muted hover:text-ink uppercase py-1 whitespace-nowrap">
            Status
          </Link>
          <span className="text-ink/20">|</span>
          <Link href="/support/faq" className="font-semibold text-ink-muted hover:text-ink uppercase py-1 whitespace-nowrap">
            FAQ
          </Link>
          <span className="text-ink/20">|</span>
          <Link href="/support/contact" className="font-semibold text-ink-muted hover:text-ink uppercase py-1 whitespace-nowrap">
            Contact
          </Link>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Subdomain Footer */}
      <footer className="border-t border-line-2 bg-surface py-10 text-xs text-ink-muted font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden border border-line bg-surface">
                  <Image src="/logo.png" alt="TMI" fill sizes="24px" className="object-cover" />
                </span>
                <span className="font-bold text-ink text-sm">Tauqeer Mustafa Inc.</span>
              </div>
              <p className="text-ink-lighter text-[11px] leading-relaxed">
                Global engineering, enterprise systems, and operational support. Dedicated 24/7 technical incident desk and SLA fulfillment.
              </p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-ink mb-3 text-[11px]">Emergency Escalation</p>
              <ul className="space-y-2 text-[11px]">
                <li>Hotline: <a href="tel:+923281313982" className="text-action hover:underline font-bold">+92 328 1313982</a></li>
                <li>Priority SLA: <span className="text-ink font-semibold">15-60 min response (P1)</span></li>
                <li>WhatsApp: <a href="https://wa.me/923281313982" target="_blank" rel="noopener noreferrer" className="text-action hover:underline font-bold">Instant Concierge</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-ink mb-3 text-[11px]">Subdomain Network</p>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="https://portals.tauqeermustafa.tech" className="hover:text-action transition">portals.tauqeermustafa.tech</a></li>
                <li><a href="https://billing.tauqeermustafa.tech" className="hover:text-action transition">billing.tauqeermustafa.tech</a></li>
                <li><a href="https://docs.tauqeermustafa.tech" className="hover:text-action transition">docs.tauqeermustafa.tech</a></li>
                <li><a href="https://community.tauqeermustafa.tech" className="hover:text-action transition">community.tauqeermustafa.tech</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold uppercase tracking-wider text-ink mb-3 text-[11px]">Support Dispatch</p>
              <p className="text-ink-lighter text-[11px] leading-relaxed mb-2">
                Email: <a href="mailto:support@tauqeermustafa.tech" className="text-action hover:underline font-bold">support@tauqeermustafa.tech</a>
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} />
                <span>99.98% Service Uptime SLA Committed</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()} Tauqeer Mustafa Inc.</span>
              <span className="text-ink/20">|</span>
              <span>Global Support & Helpdesk Hub</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/support/status" className="hover:text-action transition">
                Live Status
              </Link>
              <span className="text-ink/20">|</span>
              <Link href="/support/faq" className="hover:text-action transition">
                SLA Matrix & FAQ
              </Link>
              <span className="text-ink/20">|</span>
              <a href="https://docs.tauqeermustafa.tech/sla" className="hover:text-action transition">
                Corporate SLA Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
