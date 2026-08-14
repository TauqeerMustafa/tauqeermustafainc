import type { Metadata } from "next";

import AboutPreview from "@/components/home/AboutPreview";
import CTA from "@/components/home/CTA";
import CoreServices from "@/components/home/CoreServices";
import FeaturedWork from "@/components/home/FeaturedWork";
import Hero from "@/components/home/Hero";
import LatestBlogs from "@/components/home/LatestBlogs";
import OperatingModel from "@/components/home/OperatingModel";
import Technology from "@/components/home/Technology";
import VisualIndex from "@/components/home/VisualIndex";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Tauqeer Mustafa Inc. | Secure Digital Products for Small Businesses",
  description:
    "A founder-led digital agency in Islamabad, Pakistan. Web development, cybersecurity, AI automation, cloud engineering, and product design for small businesses and startups.",
  path: "/",
});

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutPreview />
      <FeaturedWork />
      <VisualIndex />
      <CoreServices />
      <OperatingModel />
      <WhyChooseUs />
      <Technology />
      <LatestBlogs />
      <CTA />
    </main>
  );
}
