import type { Metadata } from "next";
import BillingHubClient from "./BillingHubClient";

export const metadata: Metadata = {
  title: "Billing, Payouts & Policies | Tauqeer Mustafa Inc.",
  description:
    "Official corporate portal for client payments, contractor payout tracking, net fee calculators, and payment policies.",
};

export default async function BillingHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawTab = params.tab;
  const initialTab =
    rawTab === "portal" || rawTab === "payouts" || rawTab === "policies" ? rawTab : "pay";

  return <BillingHubClient initialTab={initialTab} />;
}
