import type { Metadata } from "next";

import MonasHero from "@/components/home/MonasHero";
import MonasBrandMarquee from "@/components/home/MonasBrandMarquee";
import MonasAbout from "@/components/home/MonasAbout";
import MonasProjects from "@/components/home/MonasProjects";
import MonasServices from "@/components/home/MonasServices";
import MonasTestimonials from "@/components/home/MonasTestimonials";
import MonasPricing from "@/components/home/MonasPricing";
import MonasBlog from "@/components/home/MonasBlog";
import WhatsAppChat from "@/components/whatsapp/WhatsAppChat";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: { absolute: "Qorlune — Enterprise Platforms & AI Automation" },
  description:
    "We engineer mission-critical platforms, autonomous AI pipelines, and resilient cloud architectures for high-growth businesses. Zero downtime, enterprise-grade engineering.",
  path: "/",
});

export default function Home() {
  return (
    <div>
      <MonasHero />
      <MonasBrandMarquee />
      <MonasAbout />
      <MonasProjects />
      <MonasServices />
      <MonasTestimonials />
      <MonasPricing />
      <MonasBlog />
      <WhatsAppChat />
    </div>
  );
}
