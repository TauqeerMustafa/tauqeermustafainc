import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PaymentCheckout from "@/components/payment/PaymentCheckout";
import { PageHero, Section } from "@/components/home/ui";

export const metadata: Metadata = {
  title: "Make a Payment | Online Checkout Terminal",
  description: "Settle project milestones, engineering retainers, and invoices online securely.",
};

export default function SubdomainPayPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHero
        eyebrow="Online Checkout // 256-Bit Encrypted"
        title="Pay Invoice or Deposit"
        description="Instant 256-bit encrypted checkout via Card, Meezan Bank IBAN, Raast, or Wise."
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
        <div className="max-w-3xl mx-auto space-y-8">
          <PaymentCheckout />

          <div className="text-center text-[11px] text-ink-muted font-mono space-y-1">
            <p>256-Bit SSL Encrypted // Direct Bank Clearance // PCI-DSS Compliant</p>
            <p>
              Billing Desk:{" "}
              <a
                href="mailto:billing@tauqeermustafa.tech"
                className="text-action hover:underline font-semibold"
              >
                billing@tauqeermustafa.tech
              </a>
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

