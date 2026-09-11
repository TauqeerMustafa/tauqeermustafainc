import type { Metadata } from "next";
import PricingClient from "@/components/pricing/PricingClient";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Pricing & Engineering Retainers | Tauqeer Mustafa Inc.",
  description:
    "Transparent pricing and dedicated engineering retainers for web applications, cloud infrastructure, AI automation, and cybersecurity.",
  path: "/pricing",
  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
});

export default function PricingPage() {
  return <PricingClient />;
}

