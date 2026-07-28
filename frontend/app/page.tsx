import CTA from "@/components/home/CTA";
import CoreServices from "@/components/home/CoreServices";
import FeaturedWork from "@/components/home/FeaturedWork";
import Hero from "@/components/home/Hero";
import LatestBlogs from "@/components/home/LatestBlogs";
import OperatingModel from "@/components/home/OperatingModel";
import Technology from "@/components/home/Technology";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedWork />
      <CoreServices />
      <OperatingModel />
      <Technology />
      <LatestBlogs />
      <CTA />
    </main>
  );
}
