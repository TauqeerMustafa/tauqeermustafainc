import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PayoutTracker from "@/components/payouts/PayoutTracker";
import PayoutCalculator from "@/components/payouts/PayoutCalculator";
import PayoutRequestForm from "@/components/payouts/PayoutRequestForm";
import { PageHero, Section } from "@/components/home/ui";

export const metadata: Metadata = {
  title: "Payouts & Disbursements | Track & Request",
  description:
    "Track live bank clearance, calculate net proceeds, and submit contractor/partner payout requests.",
};

export default function SubdomainPayoutsPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHero
        eyebrow="Disbursements // Treasury Operations"
        title="Payouts & Wire Operations"
        description="Transparent schedules, 0% platform fee on domestic Raast/1LINK, and automated electronic receipts."
      >
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 border border-line bg-surface px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-action hover:text-action transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Billing Hub</span>
        </Link>
      </PageHero>

      <Section className="bg-canvas py-10 sm:py-14">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Tracker */}
          <div className="border border-line bg-surface p-6 sm:p-8">
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
          <div className="border border-line bg-surface p-6 sm:p-8">
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
          <div className="border border-line bg-surface p-6 sm:p-8">
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
      </Section>
    </div>
  );
}

