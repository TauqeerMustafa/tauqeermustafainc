import type { Metadata } from "next";
import Link from "next/link";
import { 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  ArrowRight, 
  DownloadCloud, 
  Terminal, 
  Globe, 
  Code2, 
  Headphones,
  Lock,
  ExternalLink
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | Qorlune Digital Store",
    default: "Qorlune Digital Store — Enterprise Software, Blueprints & Toolkits",
  },
  description:
    "Official digital marketplace for production-grade web platforms, cybersecurity playbooks, cloud architectures, AI automation engines, and developer CLI tools.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#007d88] selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#005f6b] via-[#007d88] to-[#0ea5e9] text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span>Enterprise Digital Products: Instant digital delivery & commercial license included on all orders.</span>
        <span className="hidden sm:inline opacity-80">· Verified by Qorlune Security</span>
      </div>

      {/* Main Store Header */}
      <header className="sticky top-0 z-50 bg-[#0d121f]/95 backdrop-blur-md border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#007d88] to-[#0284c7] flex items-center justify-center shadow-lg shadow-[#007d88]/20 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#38bdf8] transition-colors">QORLUNE</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#007d88]/30 border border-[#007d88]/50 text-[#38bdf8]">
                    STORE
                  </span>
                </div>
                <span className="text-[10px] text-[#94a3b8] -mt-1 font-mono">Digital Marketplace</span>
              </div>
            </Link>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#94a3b8]">
            <Link href="/" className="hover:text-white transition-colors font-medium text-white">
              Catalog
            </Link>
            <a href="#popular" className="hover:text-white transition-colors font-medium">
              Popular
            </a>
            <a href="#categories" className="hover:text-white transition-colors font-medium">
              Categories
            </a>
            <a href="https://docs.qorlune.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium flex items-center gap-1">
              Documentation <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a href="https://billing.qorlune.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium flex items-center gap-1">
              Billing & Invoices <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e293b]/60 border border-[#334155] text-xs text-[#cbd5e1]">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Stripe & Paddle Secured</span>
            </div>

            <a
              href="https://qorlune.co.uk/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#007d88] hover:bg-[#00929f] text-white text-xs font-semibold shadow-md shadow-[#007d88]/20 transition-all hover:scale-102"
            >
              <span>Custom Build</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#090d16] border-t border-[#1e293b] text-[#94a3b8] text-xs py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#007d88] flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white tracking-wide">Qorlune Digital Store</span>
              </div>
              <p className="text-[#64748b] leading-relaxed">
                Direct provider of consultant-grade software architectures, vulnerability assessment kits, and automated microservices for engineering teams worldwide.
              </p>
              <div className="text-[11px] text-[#475569]">
                Qorlune LLC · London, UK / Islamabad, PK
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product Categories</h4>
              <ul className="space-y-2">
                <li><a href="#categories" className="hover:text-white transition-colors">Web Engineering & SaaS Starters</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Cybersecurity & Threat Playbooks</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Cloud & DevOps Terraform Blueprints</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">AI Automation & Multi-Agent Engines</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Developer Utilities & Security CLIs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Corporate Portals</h4>
              <ul className="space-y-2">
                <li><a href="https://qorlune.co.uk" className="hover:text-white transition-colors">Main Corporate Agency</a></li>
                <li><a href="https://billing.qorlune.co.uk" className="hover:text-white transition-colors">Billing & Treasury Hub</a></li>
                <li><a href="https://docs.qorlune.co.uk" className="hover:text-white transition-colors">Security & Legal Documentation</a></li>
                <li><a href="https://support.qorlune.co.uk" className="hover:text-white transition-colors">Customer Helpdesk & Status</a></li>
                <li><a href="https://portals.qorlune.co.uk" className="hover:text-white transition-colors">Staff Operations Suite (/emp)</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm">Trust & Fulfillment</h4>
              <div className="space-y-2 text-[#64748b]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NIST & OWASP Verified Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-sky-400" />
                  <span>Sub-Second Instant Download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Full Commercial Perpetual License</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1e293b] text-[11px] text-[#475569]">
                Accepted Payments: Visa, Mastercard, AMEX, Apple Pay, Google Pay, Wire Transfer.
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e293b]/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#64748b]">
            <p>© {new Date().getFullYear()} Qorlune LLC. All rights reserved. Registered Digital Goods Provider.</p>
            <div className="flex items-center gap-4 text-xs">
              <a href="https://docs.qorlune.co.uk/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="https://docs.qorlune.co.uk/terms" className="hover:text-white transition-colors">Terms of Sale</a>
              <a href="https://billing.qorlune.co.uk/policies" className="hover:text-white transition-colors">Refund Policy</a>
              <a href="https://support.qorlune.co.uk" className="hover:text-white transition-colors">Support Desk</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
