import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import PaymentCheckout from "@/components/payment/PaymentCheckout";

export const metadata: Metadata = buildMetadata({
  title: "Billing & Online Payments | Tauqeer Mustafa Inc.",
  description:
    "Secure corporate billing terminal. Settle project invoices, retainers, and advance deposits online.",
  path: "/pay",
});

export default function PayPage() {
  return (
    <div className="min-h-[85vh] bg-canvas py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Minimal Header */}
        <div className="text-center mb-8">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-action">
            Tauqeer Mustafa Inc. • Billing Terminal
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
            Online Payment
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
            Pay by invoice number or enter a custom amount to settle milestones securely.
          </p>
        </div>

        {/* Pure Billing Checkout */}
        <PaymentCheckout />

        {/* Minimal Security Footer */}
        <div className="mt-8 text-center text-xs text-ink/40 font-mono space-y-1">
          <p>256-Bit SSL Encrypted • PCI-DSS Compliant • Direct Bank Clearance</p>
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
    </div>
  );
}

