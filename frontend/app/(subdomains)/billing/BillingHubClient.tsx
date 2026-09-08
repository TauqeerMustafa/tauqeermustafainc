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
  Zap,
  HelpCircle,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

import PaymentCheckout from "@/components/payment/PaymentCheckout";
import BankDetailsCard from "@/components/payment/BankDetailsCard";
import PayoutTracker from "@/components/payouts/PayoutTracker";
import PayoutCalculator from "@/components/payouts/PayoutCalculator";
import PayoutRequestForm from "@/components/payouts/PayoutRequestForm";

type ActiveTab = "pay" | "payouts" | "policies";

export default function BillingHubClient({ initialTab = "pay" }: { initialTab?: ActiveTab }) {
  const [tab, setTab] = useState<ActiveTab>(initialTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Eyebrow & Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-action">
          Tauqeer Mustafa Inc. � Treasury Operations
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold uppercase tracking-tight text-ink">
          Billing, Payouts & Settlement Hub
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Decoupled corporate financial operations: settle invoices, track contractor disbursements, or review institutional payment terms.
        </p>
      </div>

      {/* 3 Primary Navigation Cards / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Tab 1: Pay */}
        <button
          type="button"
          onClick={() => setTab("pay")}
          className={`flex flex-col p-6 text-left transition border ${
            tab === "pay"
              ? "border-action bg-surface ring-2 ring-action"
              : "border-line-2 bg-card hover:border-line hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-10 w-10 items-center justify-center bg-action/10 text-action border border-action/30">
              <CreditCard size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              01 � Invoicing
            </span>
          </div>
          <h2 className="mt-4 text-base font-bold uppercase text-ink">Make a Payment</h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Pay by invoice number or deposit custom milestones via Card, Meezan Bank, or Raast.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-action uppercase">
            <span>{tab === "pay" ? "Active View" : "Open Terminal"}</span>
            <ArrowRight size={13} />
          </div>
        </button>

        {/* Tab 2: Payouts */}
        <button
          type="button"
          onClick={() => setTab("payouts")}
          className={`flex flex-col p-6 text-left transition border ${
            tab === "payouts"
              ? "border-action bg-surface ring-2 ring-action"
              : "border-line-2 bg-card hover:border-line hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-10 w-10 items-center justify-center bg-action/10 text-action border border-action/30">
              <Banknote size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              02 � Disbursements
            </span>
          </div>
          <h2 className="mt-4 text-base font-bold uppercase text-ink">Payouts & Tracking</h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Track live bank clearance, model net proceeds, and submit contractor payout requests.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-action uppercase">
            <span>{tab === "payouts" ? "Active View" : "Open Payouts"}</span>
            <ArrowRight size={13} />
          </div>
        </button>

        {/* Tab 3: Policies */}
        <button
          type="button"
          onClick={() => setTab("policies")}
          className={`flex flex-col p-6 text-left transition border ${
            tab === "policies"
              ? "border-action bg-surface ring-2 ring-action"
              : "border-line-2 bg-card hover:border-line hover:bg-surface"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex h-10 w-10 items-center justify-center bg-action/10 text-action border border-action/30">
              <ShieldCheck size={20} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
              03 � Governance
            </span>
          </div>
          <h2 className="mt-4 text-base font-bold uppercase text-ink">Payment Policies</h2>
          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
            Transparent milestones, 7-day net terms, refund criteria, and verified bank credentials.
          </p>
          <div className="mt-4 flex items-center gap-1 font-mono text-xs font-bold text-action uppercase">
            <span>{tab === "policies" ? "Active View" : "View Policies"}</span>
            <ArrowRight size={13} />
          </div>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="transition-all duration-200">
        {/* TAB 1: Make a Payment */}
        {tab === "pay" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border border-line-2 bg-surface p-1">
              <PaymentCheckout />
            </div>

            <div className="text-center text-xs text-ink-muted font-mono pt-4">
              <span>Direct URL: </span>
              <Link href="/billing/pay" className="text-action hover:underline font-bold">
                billing.tauqeermustafa.tech/pay
              </Link>
            </div>
          </div>
        )}

        {/* TAB 2: Payouts & Disbursements */}
        {tab === "payouts" && (
          <div className="space-y-12 max-w-5xl mx-auto">
            {/* Live Payout Tracker */}
            <div className="border border-line-2 bg-surface p-6 sm:p-8">
              <div className="mb-6 border-b border-line pb-4">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                  Real-Time Verification
                </span>
                <h3 className="text-xl font-bold uppercase text-ink mt-1">
                  Live Disbursement Status
                </h3>
                <p className="text-xs text-ink-muted">
                  Look up your payout ID or invoice reference to inspect bank RRN and clearance status.
                </p>
              </div>
              <PayoutTracker />
            </div>

            {/* Payout Calculator */}
            <div className="border border-line-2 bg-surface p-6 sm:p-8">
              <div className="mb-6 border-b border-line pb-4">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                  Transparent Calculations
                </span>
                <h3 className="text-xl font-bold uppercase text-ink mt-1">
                  Net Settlement Calculator
                </h3>
                <p className="text-xs text-ink-muted">
                  Calculate net proceeds across local Raast/1LINK (0% fee) and international Wise rails.
                </p>
              </div>
              <PayoutCalculator />
            </div>

            {/* Payout Request Form */}
            <div className="border border-line-2 bg-surface p-6 sm:p-8">
              <div className="mb-6 border-b border-line pb-4">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                  Invoice Submission
                </span>
                <h3 className="text-xl font-bold uppercase text-ink mt-1">
                  Submit Disbursement Request
                </h3>
                <p className="text-xs text-ink-muted">
                  Contract deliverables approved? Submit your milestone invoice to the treasury queue.
                </p>
              </div>
              <PayoutRequestForm />
            </div>

            <div className="text-center text-xs text-ink-muted font-mono pt-2">
              <span>Direct URL: </span>
              <Link href="/billing/payouts" className="text-action hover:underline font-bold">
                billing.tauqeermustafa.tech/payouts
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: Payment Policies & Terms */}
        {tab === "policies" && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Policy Summary Card */}
            <div className="border border-line-2 bg-surface p-6 sm:p-8">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
                Official Commercial Terms
              </span>
              <h3 className="text-2xl font-bold uppercase text-ink mt-1">
                Tauqeer Mustafa Inc. Payment Policy
              </h3>
              <p className="mt-2 text-xs font-mono text-ink-muted">
                Last updated: August 2026 � Applies to all client engagements and engineering retainers
              </p>

              <div className="mt-8 space-y-6 text-sm text-ink leading-relaxed">
                <div className="border-t border-line pt-4">
                  <h4 className="font-bold uppercase text-ink text-base">
                    1. Invoicing & Milestone Schedules
                  </h4>
                  <p className="mt-2 text-ink-muted text-xs sm:text-sm">
                    Fixed-scope projects require an advance deposit (typically 30�50%) to reserve delivery capacity, followed by milestone settlements upon deliverable demonstration. Retainers and support agreements are billed in advance on the 1st of each service month. Standard payment terms are <strong>7 calendar days</strong> from invoice issue.
                  </p>
                </div>

                <div className="border-t border-line pt-4">
                  <h4 className="font-bold uppercase text-ink text-base">
                    2. Accepted Settlement Rails
                  </h4>
                  <p className="mt-2 text-ink-muted text-xs sm:text-sm">
                    We accept electronic credit/debit card payments (Visa, Mastercard, Amex) tokenized via Level 1 PCI-DSS gateways, direct domestic bank transfers via Meezan Bank and 1LINK, instant Raast transfers, and cross-border Wise/SWIFT multi-currency wires. Cash and cryptocurrency are not accepted.
                  </p>
                </div>

                <div className="border-t border-line pt-4">
                  <h4 className="font-bold uppercase text-ink text-base">
                    3. Refund Policy & Project Pauses
                  </h4>
                  <p className="mt-2 text-ink-muted text-xs sm:text-sm">
                    Work performed up to an approved milestone signoff is non-refundable. If an engagement is cancelled prior to work commencement, advance payments are refunded minus payment gateway transmission costs. In the event of scope disputes, our billing team reviews timesheets and staging artifacts within 5 business days.
                  </p>
                </div>

                <div className="border-t border-line pt-4">
                  <h4 className="font-bold uppercase text-ink text-base">
                    4. Taxes, Withholding & CPR Certificates
                  </h4>
                  <p className="mt-2 text-ink-muted text-xs sm:text-sm">
                    Where corporate withholding tax is deducted under applicable domestic regulations, clients agree to furnish official withholding tax certificates (CPR) within 15 calendar days. Wires must settle net of intermediate banking deductions.
                  </p>
                </div>
              </div>
            </div>

            {/* Official Banking Credentials Card */}
            <BankDetailsCard />

            <div className="text-center text-xs text-ink-muted font-mono pt-2">
              <span>Direct URL: </span>
              <Link href="/billing/policies" className="text-action hover:underline font-bold">
                billing.tauqeermustafa.tech/policies
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
