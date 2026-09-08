import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  Globe,
  HelpCircle,
  Lock,
  Mail,
  PhoneCall,
  Shield,
  ShieldCheck,
  Zap,
} from "lucide-react";

import {
  Card,
  GlowCard,
  MStripe,
  PageHero,
  Reveal,
  Section,
  SectionHeader,
  Stat,
  fadeUp,
} from "@/components/home/ui";
import { buildMetadata } from "@/lib/metadata";
import PayoutTracker from "@/components/payouts/PayoutTracker";
import PayoutCalculator from "@/components/payouts/PayoutCalculator";
import PayoutRequestForm from "@/components/payouts/PayoutRequestForm";

export const metadata: Metadata = buildMetadata({
  title: "Disbursements & Global Payouts",
  description:
    "Transparent payout schedules, zero-fee direct local settlements, global remittance rails, and real-time disbursement tracking for contractors, consultants, and team members.",
  path: "/payouts",
  image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80",
});

const METRICS = [
  { value: "48h", label: "Verification SLA", detail: "Fast review and batch dispatch" },
  { value: "0%", label: "Platform Deduction", detail: "Zero fees on Direct Bank / Raast" },
  { value: "15+", label: "Currencies Supported", detail: "PKR, USD, EUR, GBP & more" },
  { value: "100%", label: "Electronic Audited", detail: "Full bank RRN & statement advice" },
];

const RAILS = [
  {
    name: "Raast Instant Transfer",
    tag: "Pakistan • Instant",
    description:
      "State Bank of Pakistan instant payment rail. Direct bank-to-bank settlement across all Pakistani financial institutions 24/7 with zero intermediary deductions.",
    icon: Zap,
    badge: "0% Fee • Instant",
    timeframe: "Real-time (Within Minutes)",
  },
  {
    name: "1LINK Commercial Bank Wire",
    tag: "Pakistan • Same Day",
    description:
      "Direct clearing to all scheduled commercial banks (Meezan, HBL, UBL, MCB, Standard Chartered, Bank Alfalah). Processed in daily morning and afternoon batches.",
    icon: Building2,
    badge: "0% Fee • Same Day",
    timeframe: "Same Business Day",
  },
  {
    name: "Wise Multi-Currency Rail",
    tag: "Global • Low Cost",
    description:
      "Cross-border electronic disbursement with live mid-market exchange rates. Direct deposits to bank accounts across the United States, Europe, UK, Canada, and Australia.",
    icon: Globe,
    badge: "Live Mid-Market FX",
    timeframe: "1 to 2 Business Days",
  },
  {
    name: "Institutional SWIFT Wire",
    tag: "Global • Institutional",
    description:
      "Direct international telegraphic transfers for high-value milestone payouts. Dispatched with official SWIFT MT103 advice copies for corporate record-keeping.",
    icon: Banknote,
    badge: "SWIFT MT103 Advice",
    timeframe: "2 to 4 Business Days",
  },
  {
    name: "Payoneer Direct Transfer",
    tag: "Freelance • Digital Wallet",
    description:
      "Direct wallet-to-wallet balance transfers for global engineering, design, and AI specialists holding verified Payoneer beneficiary profiles.",
    icon: CreditCard,
    badge: "Wallet Settlement",
    timeframe: "12 to 24 Hours",
  },
  {
    name: "Direct Client & Partner Rails",
    tag: "Custom Contracts",
    description:
      "Custom billing arrangements, escrow disbursements, or milestone splits agreed in enterprise Master Services Agreements (MSAs).",
    icon: FileCheck,
    badge: "Enterprise MSA",
    timeframe: "As Specified in Scope",
  },
];

const CYCLES = [
  {
    title: "Bi-Weekly Regular Cycle",
    timing: "1st & 15th of Every Month",
    cutoff: "Cutoff 48h prior (28th/29th & 13th)",
    description:
      "Standard recurring cycle for dedicated contractors, retained engineering staff, and recurring service agreements.",
  },
  {
    title: "Project Milestone Settlements",
    timing: "On Client Signoff",
    cutoff: "Within 48h of Deliverable Acceptance",
    description:
      "Triggered immediately when milestone deliverables (e.g. staging approval, security audit completion, code freeze) receive final client sign-off.",
  },
  {
    title: "Sales & Lead Gen Commissions",
    timing: "Monthly on the 1st",
    cutoff: "Calculated after month-end reconciliation",
    description:
      "Booked discovery calls and closed commercial deals calculated against declared incentive tiers and disbursed alongside the month's first regular batch.",
  },
  {
    title: "Expense Reimbursements",
    timing: "Fast-Tracked (Every Tuesday & Friday)",
    cutoff: "Receipt submitted 24h prior",
    description:
      "Verified infrastructure, tooling, cloud hosting, or emergency software licenses approved by project managers.",
  },
];

const FAQS = [
  {
    q: "How do I know when my payout has been sent?",
    a: "Every disbursement generates an automated email and SMS receipt with the bank transaction ID / Retrieval Reference Number (RRN). You can also enter your reference code anytime in our Live Settlement Lookup tracker on this page.",
  },
  {
    q: "Are there any fees deducted from my payout?",
    a: "Tauqeer Mustafa Inc. does not charge any internal platform, withdrawal, or administrative fees. For local Pakistani accounts via Raast or 1LINK, you receive 100% of your invoiced amount. For international wires or Wise transfers, only the actual third-party network clearance cost is applied at cost.",
  },
  {
    q: "Can I receive payment in a bank account under someone else's name?",
    a: "No. In compliance with corporate anti-money laundering (AML), tax reporting, and banking security guidelines, the destination bank account title must match the legal contractor agreement on file. Payouts to third-party accounts are strictly prohibited and will be rejected by compliance.",
  },
  {
    q: "How does currency conversion work for international disbursements?",
    a: "Invoices issued in USD, EUR, or GBP are disbursed either in the original currency or converted via Wise's real-time interbank rate without inflated retail exchange markups. State Bank of Pakistan proceeds realization certificates (PRC) can be provided upon request for local remittances.",
  },
  {
    q: "What should I do if my bank details change?",
    a: "To protect your funds against unauthorized redirection, banking detail updates require verification from your registered contract email or via the authenticated Employee / Client Portal settings. Do not send banking changes through informal chat messages.",
  },
  {
    q: "What is the minimum payout threshold?",
    a: "The minimum payout threshold is PKR 10,000 for domestic direct bank transfers and $50 USD for international electronic transfers. Amounts below this threshold roll over into the next settlement cycle.",
  },
];

export default function PayoutsPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Disbursements & Settlements"
        title="Transparent, reliable payouts for our global workforce."
        description="Clear payout cycles, zero-fee direct local deposits, global remittance rails, and real-time disbursement tracking for contractors, consultants, creators, and team members."
        image="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Corporate Treasury & Disbursements"
        imageCaption="Audited electronic banking rails and real-time verification."
      >
        <a
          href="#tracker"
          className="inline-flex min-h-12 items-center justify-center bg-action px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-on-action transition hover:bg-action-strong active:scale-[0.98]"
        >
          Track Payout Status
        </a>
        <a
          href="#request"
          className="inline-flex min-h-12 items-center justify-center border border-line-2 bg-surface px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:border-action hover:text-action active:scale-[0.98]"
        >
          Submit Payout Request
        </a>
      </PageHero>

      {/* Metrics Bar */}
      <Section className="border-b border-line-2 bg-surface py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {METRICS.map((m) => (
            <Stat key={m.label} value={m.value} label={m.label} detail={m.detail} />
          ))}
        </div>
      </Section>

      {/* Section 1: Live Tracker */}
      <Section id="tracker" className="bg-canvas" labelledBy="tracker-heading">
        <SectionHeader
          id="tracker-heading"
          eyebrow="Verification Portal"
          title="Live Disbursement Status"
          description="Enter your payout reference number or invoice identifier to check real-time processing and bank clearing confirmation."
        />
        <div className="mt-12 max-w-4xl mx-auto">
          <PayoutTracker />
        </div>
      </Section>

      {/* Section 2: Supported Rails */}
      <Section className="bg-surface" labelledBy="rails-heading">
        <SectionHeader
          id="rails-heading"
          eyebrow="Remittance Infrastructure"
          title="Supported Payout Rails"
          description="We operate enterprise electronic clearing channels ensuring rapid, low-friction settlements regardless of where you work."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RAILS.map((rail) => {
            const Icon = rail.icon;
            return (
              <Card key={rail.name}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-none border border-line-2 bg-surface-2 text-action">
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action border border-action/30 bg-action/10 px-2.5 py-1">
                    {rail.badge}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold uppercase text-ink">{rail.name}</h3>
                <p className="mt-1 font-mono text-[11px] font-semibold text-action">
                  {rail.tag}
                </p>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
                  {rail.description}
                </p>
                <div className="mt-6 flex items-center gap-1.5 border-t border-line/60 pt-4 font-mono text-xs text-ink/70">
                  <Clock size={13} className="text-action" />
                  <span>Settlement: <strong>{rail.timeframe}</strong></span>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Section 3: Cycles & Schedules */}
      <Section className="bg-canvas" labelledBy="cycles-heading">
        <SectionHeader
          id="cycles-heading"
          eyebrow="Timelines & Cadence"
          title="Payout Cycles & Cutoffs"
          description="Predictable disbursement windows ensure timely cash flow for our engineers, designers, and delivery partners."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CYCLES.map((c) => (
            <GlowCard key={c.title}>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-action" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-action">
                  {c.timing}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">{c.title}</h3>
              <p className="mt-2 text-xs font-semibold text-ink-muted border-l-2 border-action pl-2">
                {c.cutoff}
              </p>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
                {c.description}
              </p>
            </GlowCard>
          ))}
        </div>
      </Section>

      {/* Section 4: Estimator */}
      <Section className="bg-surface" labelledBy="calculator-heading">
        <SectionHeader
          id="calculator-heading"
          eyebrow="Transparent Math"
          title="Net Settlement Calculator"
          description="Model your estimated proceeds after network transmission costs across domestic and cross-border payment rails."
        />
        <div className="mt-12 max-w-4xl mx-auto">
          <PayoutCalculator />
        </div>
      </Section>

      {/* Section 5: Submit Request Form */}
      <Section id="request" className="bg-canvas" labelledBy="request-heading">
        <SectionHeader
          id="request-heading"
          eyebrow="Invoice Submission"
          title="Submit Disbursement Request"
          description="Deliverables ready for settlement? Submit your milestone details and banking coordinates directly to our finance queue."
        />
        <div className="mt-12 max-w-4xl mx-auto">
          <PayoutRequestForm />
        </div>
      </Section>

      {/* Section 6: Compliance & Security */}
      <Section className="bg-surface" labelledBy="security-heading">
        <SectionHeader
          id="security-heading"
          eyebrow="Integrity & Standards"
          title="Security, Taxes & Legal Compliance"
          description="Every disbursement operates under strict financial compliance to protect both the firm and our contributors."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <div className="border border-line-2 bg-card p-6 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-action text-on-action mb-5">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-ink">Zero Third-Party Payouts</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
              To prevent financial impersonation and unauthorized account redirection, payouts are
              strictly disbursed to banking or digital wallet accounts matching the verified
              contributor contract name.
            </p>
          </div>

          <div className="border border-line-2 bg-card p-6 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-action text-on-action mb-5">
              <FileCheck size={22} />
            </div>
            <h3 className="text-lg font-bold text-ink">Withholding & Tax Compliance</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
              Where applicable by local jurisdiction, withholding taxes are handled in accordance
              with FBR guidelines. Valid electronic tax deduction certificates (CPR) are issued
              promptly for company records.
            </p>
          </div>

          <div className="border border-line-2 bg-card p-6 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-action text-on-action mb-5">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-bold text-ink">Immutable Audit Trail</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
              Every disbursement generates an electronic banking confirmation advice, bank
              reference number, and ledger entry, ensuring complete transparency for personal
              accounting and corporate audits.
            </p>
          </div>
        </div>
      </Section>

      {/* Section 7: FAQs */}
      <Section className="bg-canvas" labelledBy="faq-heading">
        <SectionHeader
          id="faq-heading"
          eyebrow="Common Questions"
          title="Frequently Asked Questions"
          description="Answers to common questions regarding payout timelines, supported methods, currency handling, and verification."
        />
        <div className="mt-14 max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="border border-line-2 bg-surface p-6 transition hover:border-action/40"
            >
              <h4 className="text-base font-bold text-ink flex items-start gap-2.5">
                <HelpCircle size={18} className="text-action shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 8: Support & Escalation */}
      <Section className="border-t border-line-2 bg-surface py-16">
        <div className="max-w-4xl mx-auto border border-line-2 bg-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-action">
              Treasury & Billing Support
            </span>
            <h3 className="mt-1 text-2xl font-bold uppercase text-ink">
              Need assistance with an invoice?
            </h3>
            <p className="mt-2 text-sm font-light text-ink-muted max-w-xl">
              For urgent disbursement inquiries, tax certificates, or banking updates, contact our
              billing team quoting your Payout Reference Number.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="mailto:billing@tauqeermustafa.tech"
              className="inline-flex items-center justify-center gap-2 bg-action px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-on-action transition hover:bg-action-strong"
            >
              <Mail size={15} />
              <span>Email Billing</span>
            </a>
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 border border-line-2 bg-surface px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:border-action hover:text-action"
            >
              <span>Support Desk</span>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
