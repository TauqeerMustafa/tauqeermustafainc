"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  HelpCircle,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

import PaymentCheckout from "@/components/payment/PaymentCheckout";
import BankDetailsCard from "@/components/payment/BankDetailsCard";
import PayoutTracker from "@/components/payouts/PayoutTracker";
import PayoutCalculator from "@/components/payouts/PayoutCalculator";
import PayoutRequestForm from "@/components/payouts/PayoutRequestForm";
import { Badge, BadgeMuted, MStripe } from "@/components/home/ui";

type ActiveTab = "pay" | "payouts" | "policies";

export default function BillingHubClient({ initialTab = "pay" }: { initialTab?: ActiveTab }) {
  const [tab, setTab] = useState<ActiveTab>(initialTab);

  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Precision Hero Header */}
      <div className="relative border border-line bg-surface p-8 sm:p-12 overflow-hidden">
        <MStripe />
        <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
          Treasury Operations // Global Settlements
        </p>
        <h1 className="mt-4 text-[32px] sm:text-[42px] lg:text-[48px] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-ink">
          Billing, Payouts & Settlement Hub
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] sm:text-[17px] font-light leading-[1.6] text-ink-muted">
          Decoupled corporate financial operations: settle invoices, track contractor disbursements, or review institutional commercial policies.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>256-Bit Encrypted</Badge>
          <BadgeMuted>Meezan Bank & Raast Supported</BadgeMuted>
          <BadgeMuted>Multi-Currency Settlement</BadgeMuted>
        </div>
      </div>

      {/* 3 Primary Navigation Cards / Tabs - Precision BMW M Plates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tab 1: Pay */}
        <button
          type="button"
          onClick={() => setTab("pay")}
          className={`group relative p-6 text-left transition border cursor-pointer ${
            tab === "pay"
              ? "border-action bg-surface"
              : "border-line bg-card hover:border-action/50 hover:bg-surface"
          }`}
        >
          <span
            className={`absolute left-0 top-0 h-0.5 w-full origin-left bg-action transition-transform duration-500 ${
              tab === "pay" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
            aria-hidden
          />
          <div className="flex items-center justify-between w-full">
            <div className="flex h-9 w-9 items-center justify-center border border-line bg-surface text-action">
              <CreditCard size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              01 // Invoicing
            </span>
          </div>
          <h2 className="mt-4 text-[16px] font-bold uppercase text-ink">Make a Payment</h2>
          <p className="mt-2 text-[13px] font-light leading-[1.6] text-ink-muted">
            Pay by invoice number or deposit custom milestones via Card, Meezan Bank, Raast, or Wise.
          </p>
          <div className="mt-5 flex items-center gap-1 font-mono text-[11px] font-bold text-action uppercase tracking-wider">
            <span>{tab === "pay" ? "Active View" : "Open Terminal"}</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

        {/* Tab 2: Payouts */}
        <button
          type="button"
          onClick={() => setTab("payouts")}
          className={`group relative p-6 text-left transition border cursor-pointer ${
            tab === "payouts"
              ? "border-action bg-surface"
              : "border-line bg-card hover:border-action/50 hover:bg-surface"
          }`}
        >
          <span
            className={`absolute left-0 top-0 h-0.5 w-full origin-left bg-action transition-transform duration-500 ${
              tab === "payouts" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
            aria-hidden
          />
          <div className="flex items-center justify-between w-full">
            <div className="flex h-9 w-9 items-center justify-center border border-line bg-surface text-action">
              <Banknote size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              02 // Disbursements
            </span>
          </div>
          <h2 className="mt-4 text-[16px] font-bold uppercase text-ink">Payouts & Tracking</h2>
          <p className="mt-2 text-[13px] font-light leading-[1.6] text-ink-muted">
            Track live bank clearance, model net proceeds, and submit contractor payout requests.
          </p>
          <div className="mt-5 flex items-center gap-1 font-mono text-[11px] font-bold text-action uppercase tracking-wider">
            <span>{tab === "payouts" ? "Active View" : "Open Payouts"}</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

        {/* Tab 3: Policies */}
        <button
          type="button"
          onClick={() => setTab("policies")}
          className={`group relative p-6 text-left transition border cursor-pointer ${
            tab === "policies"
              ? "border-action bg-surface"
              : "border-line bg-card hover:border-action/50 hover:bg-surface"
          }`}
        >
          <span
            className={`absolute left-0 top-0 h-0.5 w-full origin-left bg-action transition-transform duration-500 ${
              tab === "policies" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
            aria-hidden
          />
          <div className="flex items-center justify-between w-full">
            <div className="flex h-9 w-9 items-center justify-center border border-line bg-surface text-action">
              <ShieldCheck size={18} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              03 // Commercial Terms
            </span>
          </div>
          <h2 className="mt-4 text-[16px] font-bold uppercase text-ink">Payment Policies</h2>
          <p className="mt-2 text-[13px] font-light leading-[1.6] text-ink-muted">
            Review official milestone schedules, refund terms, wire clearance rails, and corporate credentials.
          </p>
          <div className="mt-5 flex items-center gap-1 font-mono text-[11px] font-bold text-action uppercase tracking-wider">
            <span>{tab === "policies" ? "Active View" : "Review Terms"}</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>

      {/* Tab 1: Payment Terminal View */}
      {tab === "pay" && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <PaymentCheckout />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <BankDetailsCard />

              <div className="border border-line bg-surface p-6 font-mono text-xs space-y-4">
                <div className="flex items-center gap-2 text-action font-bold uppercase">
                  <Lock size={14} />
                  <span>Institutional Assurance</span>
                </div>
                <ul className="space-y-2 text-ink-muted font-light leading-relaxed">
                  <li>// Direct bank reconciliation on all PKR Raast transfers.</li>
                  <li>// Zero currency markup on USD wire settlements.</li>
                  <li>// Automated tax invoices generated instantly upon clearance.</li>
                </ul>
                <div className="pt-3 border-t border-line">
                  <a
                    href="mailto:billing@tauqeermustafa.tech"
                    className="text-action hover:underline font-bold"
                  >
                    Contact Treasury Desk &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payouts & Disbursements View */}
      {tab === "payouts" && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="border border-line bg-surface p-6 sm:p-8">
            <div className="mb-6 border-b border-line pb-4">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                Real-Time Verification
              </span>
              <h3 className="text-xl font-bold uppercase text-ink mt-1">
                Disbursement Status Inspection
              </h3>
              <p className="text-xs text-ink-muted font-light mt-1">
                Look up your payout ID or invoice reference to inspect bank RRN and clearance status.
              </p>
            </div>
            <PayoutTracker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6">
              <PayoutCalculator />
            </div>
            <div className="lg:col-span-6">
              <PayoutRequestForm />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Policies & Legal Breakdown */}
      {tab === "policies" && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <div className="border border-line bg-canvas p-8 sm:p-12">
            <div className="max-w-3xl">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                Official Policy Registry
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold uppercase text-ink mt-2">
                Corporate Payment & Settlement Terms
              </h3>
              <p className="text-sm text-ink-muted font-light mt-2 leading-relaxed">
                Summary of our commercial terms. For the full legal text, visit the documentation portal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="border border-line bg-surface p-6 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                  <FileCheck size={16} />
                  <span>Standard Milestone Terms</span>
                </div>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  Project deliverables operate on structured milestone tranches (typically 50% deposit, 25% integration, 25% final sign-off). Invoices are payable within 7 business days.
                </p>
              </div>

              <div className="border border-line bg-surface p-6 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                  <Building2 size={16} />
                  <span>Accepted Settlement Rails</span>
                </div>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  We accept domestic bank transfers via Meezan Bank IBAN & Raast, international USD wire transfers, major credit cards via Stripe, and Wise multi-currency routing.
                </p>
              </div>

              <div className="border border-line bg-surface p-6 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                  <CheckCircle2 size={16} />
                  <span>Refund & Dispute Protocol</span>
                </div>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  Advance deposits are refundable prior to architecture kick-off. Delivered milestones are subject to formal sign-off. Workmanship warranties cover bug fixes for 30 days post-launch.
                </p>
              </div>

              <div className="border border-line bg-surface p-6 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-action">
                  <HelpCircle size={16} />
                  <span>Tax Compliance & Invoicing</span>
                </div>
                <p className="text-xs text-ink-muted font-light leading-relaxed">
                  All transactions include electronic sales tax/NTN receipts compliant with FBR regulations. International B2B clients receive standard cross-border commercial invoices.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs font-mono text-ink-muted">
                Need the complete legal agreement?
              </p>
              <a
                href="https://docs.tauqeermustafa.tech/payment-policy"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-action hover:underline"
              >
                <span>Read Full Payment Policy in Docs</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          <BankDetailsCard />
        </div>
      )}
    </div>
  );
}
