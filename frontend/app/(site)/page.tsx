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
  title: "Tauqeer Mustafa Inc. | Enterprise Software, Security & AI",
  description:
    "Enterprise web development, cybersecurity, AI automation, cloud engineering, and product design for growing organizations.",
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
