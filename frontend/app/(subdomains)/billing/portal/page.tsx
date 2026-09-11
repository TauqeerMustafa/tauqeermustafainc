import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomerPortalSection from "@/components/payment/CustomerPortalSection";
import { PageHero, Section } from "@/components/home/ui";

export const metadata: Metadata = {
  title: "Customer Billing Portal | Invoices & Self-Service",
  description:
    "Access official Paddle customer billing portal to download tax invoices, view receipts, and update payment methods.",
};

export default function BillingPortalPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHero
        eyebrow="Paddle Self-Service // Tax Invoices"
        title="Customer Billing Portal"
        description="Access official Paddle customer billing portal to download tax invoices, view receipts, and update payment methods."
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
        <div className="max-w-4xl mx-auto">
          <CustomerPortalSection />
        </div>
      </Section>
    </div>
  );
}

