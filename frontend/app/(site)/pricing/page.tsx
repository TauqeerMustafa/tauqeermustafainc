import type { Metadata } from "next";
import PricingClient from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "ClipSonic Pricing — AI Video Clipper Plans & Lifetime Deal",
  description:
    "One price, unlimited clips. No per-clip fees, no monthly caps, no watermark. Free tier to start — or pay once and clip forever with the lifetime deal.",
  openGraph: {
    title: "ClipSonic Pricing — AI Video Clipper Plans & Lifetime Deal",
    description:
      "One price, unlimited clips. No per-clip fees, no monthly caps, no watermark. Free tier to start — or pay once and clip forever with the lifetime deal.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
