import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  Globe,
  ShieldCheck,
  Lock,
  FileCheck,
  HelpCircle,
  Mail,
  Zap,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  PageHero,
  Section,
  SectionHeader,
  Stat,
} from "@/components/home/ui";
import { buildMetadata } from "@/lib/metadata";
import PaymentCheckout from "@/components/payment/PaymentCheckout";
import BankDetailsCard from "@/components/payment/BankDetailsCard";

export const metadata: Metadata = buildMetadata({
  title: "Make a Payment | Client Invoices & Retainers",
  description:
    "Settle project milestones, engineering retainers, and service invoices online securely via credit/debit card, direct bank wire, Raast instant, or Wise.",
  path: "/pay",
  image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80",
});

const TRUST_STATS = [
  { value: "256-Bit", label: "SSL Encryption", detail: "Bank-grade transmission security" },
  { value: "0%", label: "Platform Surcharge", detail: "Zero hidden fees on direct transfers" },
  { value: "Level 1", label: "PCI-DSS Gateway", detail: "Zero stored card credentials" },
  { value: "Instant", label: "Automated Receipts", detail: "Real-time ledger reconciliation" },
];

const METHODS = [
  {
    title: "Credit & Debit Cards",
    scope: "Visa • Mastercard • American Express",
    description:
      "Instant checkout processed through our PCI DSS compliant payment gateway. Cards are authorized immediately with 3D Secure fraud defense.",
    icon: CreditCard,
    badge: "Instant Clearance",
  },
  {
    title: "Raast Instant Transfer",
    scope: "Pakistan • State Bank Gateway",
    description:
      "Real-time 24/7 direct clearance from any Pakistani mobile banking app directly into our corporate Meezan Bank IBAN with zero processing fees.",
    icon: Zap,
    badge: "Instant • 0% Fee",
  },
  {
    title: "1LINK Commercial Bank Wire",
    scope: "Pakistan • All Commercial Banks",
    description:
      "Direct IBAN transfer from Meezan, HBL, UBL, Standard Chartered, or Alfalah. Invoices reconcile same-day upon entering your transaction RRN.",
    icon: Building2,
    badge: "Same-Day Clearance",
  },
  {
    title: "Wise Multi-Currency Wire",
    scope: "United States • Europe • UK • Canada",
    description:
      "Cross-border payments in USD, EUR, and GBP with real-time interbank conversion rates. Direct settlement to our UK entity account.",
    icon: Globe,
    badge: "Live Interbank Rate",
  },
];

const PAYMENT_FAQS = [
  {
    q: "How soon does my payment reflect on my project balance?",
    a: "Card payments and Raast instant transfers reconcile immediately and generate an official receipt on screen. Direct bank wires within Pakistan clear same-day (within 2–4 hours during banking windows). International SWIFT wires settle within 1–3 business days.",
  },
  {
    q: "Will I receive an official invoice and tax receipt?",
    a: "Yes. Every completed transaction generates an official electronic payment receipt complete with transaction ID, invoice reference, and timestamp. Corporate tax receipts and withholding certificates (CPR) are dispatched by our billing desk.",
  },
  {
    q: "Can I pay in US Dollars or Pakistani Rupees?",
    a: "Yes. We accept both USD and PKR natively. You can switch your billing currency directly on the payment terminal above, or pay the exact equivalent stated on your project agreement.",
  },
  {
    q: "What should I do after completing an offline bank transfer?",
    a: "After transferring funds through your banking app or wire window, switch to the 'Direct Bank Transfer' option in the terminal above, enter your transaction reference / RRN, and click confirm. Our accounts team will instantly match your transfer against our ledger.",
  },
  {
    q: "Is my payment information safe?",
    a: "Completely. All card payments are tokenized and processed through certified Level 1 PCI DSS infrastructure. Tauqeer Mustafa Inc. never sees, handles, or stores sensitive card credentials, CVVs, or bank logins on our servers.",
  },
];

export default function PayPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Client Checkout Terminal"
        title="Settle project milestones and invoices with precision."
        description="Pay invoices, deposit advance bookings, or settle monthly engineering retainers online via 256-bit SSL encrypted cards, instant domestic Raast, or direct cross-border wire."
        image="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Corporate Billing & Settlement Terminal"
        imageCaption="PCI DSS compliant gateway and direct institutional banking."
      >
        <a
          href="#checkout"
          className="inline-flex min-h-12 items-center justify-center bg-action px-7 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-on-action transition hover:bg-action-strong active:scale-[0.98]"
        >
          Pay Invoice Online
        </a>
        <a
          href="#bank-details"
          className="inline-flex min-h-12 items-center justify-center border border-line-2 bg-surface px-7 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:border-action hover:text-action active:scale-[0.98]"
        >
          View Bank Coordinates
        </a>
      </PageHero>

      {/* Trust Stats Bar */}
      <Section className="border-b border-line-2 bg-surface py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {TRUST_STATS.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} detail={s.detail} />
          ))}
        </div>
      </Section>

      {/* Section 1: Main Checkout Terminal */}
      <Section id="checkout" className="bg-canvas" labelledBy="checkout-heading">
        <SectionHeader
          id="checkout-heading"
          eyebrow="Payment Gateway"
          title="Online Payment Terminal"
          description="Look up your pending invoice or enter a custom milestone amount to initiate secure settlement."
        />
        <div className="mt-12 max-w-4xl mx-auto">
          <PaymentCheckout />
        </div>
      </Section>

      {/* Section 2: Verified Bank Coordinates */}
      <Section id="bank-details" className="bg-surface" labelledBy="bank-heading">
        <SectionHeader
          id="bank-heading"
          eyebrow="Direct Institutional Wire"
          title="Official Corporate Bank Accounts"
          description="Prefer to pay directly via online banking or commercial branch wire? Use our verified banking coordinates below."
        />
        <div className="mt-12 max-w-3xl mx-auto">
          <BankDetailsCard />
        </div>
      </Section>

      {/* Section 3: Supported Payment Rails */}
      <Section className="bg-canvas" labelledBy="methods-heading">
        <SectionHeader
          id="methods-heading"
          eyebrow="Payment Methods"
          title="Flexible Payment Rails"
          description="We support modern electronic payment rails designed for domestic clients and multinational enterprises alike."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.title}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center border border-line-2 bg-surface text-action">
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action border border-action/30 bg-action/10 px-2 py-0.5">
                    {m.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold uppercase text-ink">{m.title}</h3>
                <p className="mt-1 font-mono text-[11px] font-semibold text-action">{m.scope}</p>
                <p className="mt-3 text-xs font-light leading-relaxed text-ink-muted">
                  {m.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Section 4: Security Notice */}
      <Section className="bg-surface" labelledBy="security-notice-heading">
        <div className="max-w-4xl mx-auto border-l-4 border-action bg-card p-8 sm:p-10 border border-line">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={24} className="text-action" />
            <h3 id="security-notice-heading" className="text-lg font-bold uppercase text-ink">
              Anti-Fraud & Payment Security Declaration
            </h3>
          </div>
          <div className="mt-4 text-sm font-light leading-relaxed text-ink-muted space-y-3">
            <p>
              Official invoices from <strong>Tauqeer Mustafa Inc.</strong> are dispatched solely
              from our verified email domain <code className="font-mono font-bold text-action">@tauqeermustafa.tech</code>.
              Our official bank account title is always <strong>Tauqeer Mustafa Inc.</strong> or{" "}
              <strong>Tauqeer Mustafa</strong>.
            </p>
            <p>
              Our staff will <strong>never</strong> ask you to transfer funds to an unlisted personal
              account, cryptocurrency address, or informal mobile wallet over WhatsApp, SMS, or
              direct messages. If you receive a payment request using unfamiliar bank details, do
              not proceed — immediately contact our billing desk at{" "}
              <a
                href="mailto:billing@tauqeermustafa.tech"
                className="font-semibold text-action hover:underline"
              >
                billing@tauqeermustafa.tech
              </a>
              .
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono">
            <Link
              href="/legal/payment-policy"
              className="font-bold text-action uppercase hover:underline"
            >
              Read Payment Policy &rarr;
            </Link>
            <span className="text-ink/30">•</span>
            <Link
              href="/legal/refund-policy"
              className="font-bold text-action uppercase hover:underline"
            >
              Read Refund Policy &rarr;
            </Link>
          </div>
        </div>
      </Section>

      {/* Section 5: FAQs */}
      <Section className="bg-canvas" labelledBy="pay-faq-heading">
        <SectionHeader
          id="pay-faq-heading"
          eyebrow="Help & Verification"
          title="Frequently Asked Questions"
          description="Common questions about paying invoices, clearance timeframes, tax deduction certificates, and currency options."
        />
        <div className="mt-14 max-w-3xl mx-auto space-y-4">
          {PAYMENT_FAQS.map((faq) => (
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

      {/* Section 6: Direct Help Desk */}
      <Section className="border-t border-line-2 bg-surface py-16">
        <div className="max-w-4xl mx-auto border border-line-2 bg-card p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-action">
              Questions About Your Invoice?
            </span>
            <h3 className="mt-1 text-2xl font-bold uppercase text-ink">
              Our Billing Team Is Here To Help.
            </h3>
            <p className="mt-2 text-sm font-light text-ink-muted max-w-xl">
              Need a custom split-milestone invoice, purchase order (PO) generation, or tax withholding certificate?
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
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-line-2 bg-surface px-6 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:border-action hover:text-action"
            >
              <span>Contact Team</span>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
