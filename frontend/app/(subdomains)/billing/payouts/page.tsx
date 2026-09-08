import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PayoutTracker from "@/components/payouts/PayoutTracker";
import PayoutCalculator from "@/components/payouts/PayoutCalculator";
import PayoutRequestForm from "@/components/payouts/PayoutRequestForm";

export const metadata: Metadata = {
  title: "Payouts & Disbursements | Track & Request",
  description:
    "Track live bank clearance, calculate net proceeds, and submit contractor/partner payout requests.",
};

export default function SubdomainPayoutsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Back to Hub */}
      <div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-action transition"
        >
          <ArrowLeft size={13} />
          <span>Back to Billing & Payouts Hub</span>
        </Link>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-action">
          Contractor & Partner Disbursements
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
          Payouts & Wire Operations
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted">
          Transparent schedules, 0% platform fee on domestic Raast/1LINK, and automated electronic receipts.
        </p>
      </div>

      {/* Tracker */}
      <div className="border border-line-2 bg-surface p-6 sm:p-8">
        <div className="mb-6 border-b border-line pb-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Real-Time Verification
          </span>
          <h2 className="text-xl font-bold uppercase text-ink mt-1">
            Live Disbursement Status
          </h2>
          <p className="text-xs text-ink-muted">
            Look up your payout ID or invoice reference to inspect bank RRN and clearance status.
          </p>
        </div>
        <PayoutTracker />
      </div>

      {/* Calculator */}
      <div className="border border-line-2 bg-surface p-6 sm:p-8">
        <div className="mb-6 border-b border-line pb-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Transparent Calculations
          </span>
          <h2 className="text-xl font-bold uppercase text-ink mt-1">
            Net Settlement Calculator
          </h2>
          <p className="text-xs text-ink-muted">
            Calculate net proceeds across local Raast/1LINK (0% fee) and international Wise rails.
          </p>
        </div>
        <PayoutCalculator />
      </div>

      {/* Submission Form */}
      <div className="border border-line-2 bg-surface p-6 sm:p-8">
        <div className="mb-6 border-b border-line pb-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-action">
            Invoice Submission
          </span>
          <h2 className="text-xl font-bold uppercase text-ink mt-1">
            Submit Disbursement Request
          </h2>
          <p className="text-xs text-ink-muted">
            Contract deliverables approved? Submit your milestone invoice to the treasury queue.
          </p>
        </div>
        <PayoutRequestForm />
      </div>
    </div>
  );
}
