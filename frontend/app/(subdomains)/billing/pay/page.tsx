import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PaymentCheckout from "@/components/payment/PaymentCheckout";

export const metadata: Metadata = {
  title: "Make a Payment | Online Checkout Terminal",
  description: "Settle project milestones, engineering retainers, and invoices online securely.",
};

export default function SubdomainPayPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Back to Hub */}
      <div className="mb-6">
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted hover:text-action transition"
        >
          <ArrowLeft size={13} />
          <span>Back to Billing & Payouts Hub</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-action">
          Online Payment Terminal
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
          Pay Invoice or Advance Deposit
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted">
          Instant 256-bit encrypted checkout via Card, Meezan Bank IBAN, Raast, or Wise.
        </p>
      </div>

      <PaymentCheckout />

      <div className="mt-8 text-center text-xs text-ink/40 font-mono space-y-1">
        <p>256-Bit SSL Encrypted � Direct Bank Clearance � PCI-DSS Compliant</p>
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
  );
}
