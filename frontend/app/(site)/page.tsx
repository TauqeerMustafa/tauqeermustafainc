import type { Metadata } from "next";

import CTA from "@/components/home/CTA";
import CoreServices from "@/components/home/CoreServices";
import FeaturedWork from "@/components/home/FeaturedWork";
import Hero from "@/components/home/Hero";
import OperatingModel from "@/components/home/OperatingModel";
import Technology from "@/components/home/Technology";
import WhatsAppChat from "@/components/whatsapp/WhatsAppChat";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Qorlune | Enterprise Technology Partner",
  description:
    "We help organizations build, modernize, and maintain secure, scalable, and intelligent software systems that drive measurable business growth.",
  path: "/",
});

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedWork />
      <CoreServices />
      <OperatingModel />
      <Technology />
      <CTA />
      <WhatsAppChat />
    </main>
  );
}
