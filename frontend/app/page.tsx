import AboutPreview from "@/components/home/AboutPreview";
import CTA from "@/components/home/CTA";
import Hero from "@/components/home/Hero";
import LatestBlogs from "@/components/home/LatestBlogs";
import PortfolioPreview from "@/components/home/PortfolioPreview";
import Services from "@/components/home/Services";
import Statistics from "@/components/home/Statistics";
import Testimonials from "@/components/home/Testimonials";
import TrustedCompanies from "@/components/home/TrustedCompanies";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedCompanies />
      <Services />
      <AboutPreview />
      <WhyChooseUs />
      <Statistics />
      <PortfolioPreview />
      <Testimonials />
      <LatestBlogs />
      <CTA />
    </>
  );
}
