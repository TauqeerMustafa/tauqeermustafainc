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
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Tauqeer Mustafa Inc. | Web Development, Cybersecurity & AI Services",
  description:
    "Custom web development, cybersecurity consulting, AI automation, cloud engineering, and product design. Security-first engineering for businesses worldwide — built by TMI.",
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
    </main>
  );
}
