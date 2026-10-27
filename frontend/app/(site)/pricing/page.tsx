import MonasView from "@/components/layout/MonasView";
import { pricingHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Pricing & Retainer Plans | Qorlune",
  description: "Transparent engineering retainer tiers with direct Whop checkout.",
};

export default function PricingPage() {
  return <MonasView html={pricingHtml} />;
}
