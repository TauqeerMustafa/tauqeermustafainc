import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import BankDetailsCard from "@/components/payment/BankDetailsCard";
import { PageHero, Section } from "@/components/home/ui";

export const metadata: Metadata = {
  title: "Payment & Refund Policies | Corporate Terms",
  description:
    "Official payment policies, milestone billing rules, net terms, refund criteria, and anti-fraud security.",
};

export default function SubdomainPoliciesPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHero
        eyebrow="Corporate Terms // Treasury Compliance"
        title="Payment & Settlement Policy"
        description="Transparent guidelines governing invoices, milestone clearances, refunds, and corporate treasury compliance."
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
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Main Policy Document */}
          <article className="border border-line bg-surface p-6 sm:p-10 space-y-8 text-ink">
            <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="font-mono text-xs text-action font-semibold uppercase">
                Effective Date: August 2026
              </span>
              <span className="font-mono text-xs text-ink-muted">
                Entity: Tauqeer Mustafa Inc.
              </span>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold uppercase text-ink">
                1. Currency, Pricing & Validity
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Project fees are quoted in <strong>US Dollars (USD)</strong> by default. Domestic engagements within Pakistan are quoted and billed in <strong>Pakistani Rupees (PKR)</strong> at the rate declared on the official invoice. All quotes remain valid for 30 days from date of issuance. Prices exclude applicable local taxes, bank wire surcharges, and pass-through infrastructure costs unless explicitly stated.
              </p>
            </section>

            <section className="space-y-3 border-t border-line pt-6">
              <h2 className="text-lg font-bold uppercase text-ink">
                2. Accepted Payment Rails
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Tauqeer Mustafa Inc. accepts electronic settlement through the following certified rails:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-ink-muted leading-relaxed">
                <li><strong>Credit & Debit Cards:</strong> Visa, Mastercard, and American Express processed via Level 1 PCI-DSS tokenized infrastructure with 3D Secure fraud authentication.</li>
                <li><strong>Direct Bank Wire (Pakistan):</strong> Direct institutional transfers to our corporate Meezan Bank account with same-day settlement.</li>
                <li><strong>Raast Instant Transfer:</strong> Real-time 24/7 clearance across all Pakistani commercial and digital banks with zero platform deduction.</li>
                <li><strong>Cross-Border Remittances:</strong> Wise multi-currency transfers and institutional SWIFT wires in USD, EUR, and GBP.</li>
              </ul>
              <p className="text-xs text-ink-muted font-mono italic">
                * We do not accept cash, unverified cryptocurrency, or third-party transfers.
              </p>
            </section>

            <section className="space-y-3 border-t border-line pt-6">
              <h2 className="text-lg font-bold uppercase text-ink">
                3. Invoicing Cadence & Net Terms
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Fixed-price projects require an advance deposit (30% to 50%) to lock engineering capacity, followed by staged milestone invoices upon deliverable acceptance. Engineering retainers and managed SLA services are invoiced in advance on the 1st of each service month. Standard payment terms are <strong>7 calendar days</strong> from invoice date.
              </p>
            </section>

            <section className="space-y-3 border-t border-line pt-6">
              <h2 className="text-lg font-bold uppercase text-ink">
                4. Overdue Invoices & Service Suspension
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Automated payment reminders are sent 3 days prior to due date and immediately upon due date. If an invoice remains unsettled 14 calendar days past due, active engineering work, staging access, and deployment pipelines will be paused until the ledger is brought current. Resumption of work is subject to team scheduling capacity.
              </p>
            </section>

            <section className="space-y-3 border-t border-line pt-6">
              <h2 className="text-lg font-bold uppercase text-ink">
                5. Refund & Cancellation Terms
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Milestone payments for accepted deliverables and delivered code commits are non-refundable. For contracts terminated prior to project initiation, advance deposits will be refunded less payment processing gateway costs within 7 to 10 business days. For scoped disputes, our billing committee conducts an audit against project timesheets and git commit logs within 5 business days.
              </p>
            </section>

            <section className="space-y-3 border-t border-line pt-6">
              <h2 className="text-lg font-bold uppercase text-ink">
                6. Withholding Tax & Pass-Through Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Where local regulatory withholding applies, clients must furnish valid official withholding tax certificates (CPR) within 15 calendar days of payment deduction. Cloud hosting, domain registrations, software licenses, and third-party API costs are billed at cost and are non-refundable once incurred on client behalf.
              </p>
            </section>

            {/* Security Declaration */}
            <div className="border-l-4 border-action bg-surface p-6 border border-line">
              <div className="flex items-center gap-2 text-ink">
                <ShieldCheck size={20} className="text-action" />
                <h3 className="text-base font-bold uppercase">
                  Corporate Anti-Fraud Declaration
                </h3>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
                All legitimate invoices originate solely from our verified domain <code className="font-mono font-bold text-action">@tauqeermustafa.tech</code>. Corporate bank accounts are exclusively registered under <strong>Tauqeer Mustafa Inc.</strong> or <strong>Tauqeer Mustafa</strong>. Our employees will never request wire transfers to unlisted personal accounts or mobile wallets over chat apps.
              </p>
            </div>

            <div className="border-t border-line pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs font-mono text-ink-muted">
                Looking for complete institutional legal agreements & SLAs?
              </p>
              <a
                href="https://docs.tauqeermustafa.tech/payment-policy"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-action hover:underline"
              >
                <span>Master Payment Policy in Docs</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </article>

          {/* Embedded Bank Coordinates */}
          <BankDetailsCard />
        </div>
      </Section>
    </div>
  );
}

