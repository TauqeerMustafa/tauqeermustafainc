import type { Metadata } from "next";

import AboutPreview from "@/components/home/AboutPreview";
import CTA from "@/components/home/CTA";
import CoreServices from "@/components/home/CoreServices";
import FAQ from "@/components/home/FAQ";
import FeaturedWork from "@/components/home/FeaturedWork";
import Hero from "@/components/home/Hero";
import LatestBlogs from "@/components/home/LatestBlogs";
import OperatingModel from "@/components/home/OperatingModel";
import Technology from "@/components/home/Technology";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import WhatsAppChat from "@/components/whatsapp/WhatsAppChat";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: { absolute: "Qorlune LLC" },
  description:
    "We build production-ready platforms for businesses that can't afford downtime. Web engineering, AI automation, cloud infrastructure, and security — delivered as one integrated team.",
  path: "/",
});

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutPreview />
      <FeaturedWork />
      <CoreServices />
      <OperatingModel />
      <WhyChooseUs />
      <Technology />
      <FAQ />
      <LatestBlogs />
      <CTA />
      <WhatsAppChat />
    </main>
  );
}
