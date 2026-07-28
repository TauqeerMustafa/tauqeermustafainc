import type { Metadata } from "next";
import { Building2, MessageSquareText, ShieldCheck } from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import FAQ from "@/components/contact/FAQ";
import { Card, IconFrame, PageHero, Section, SectionHeader } from "@/components/home/ui";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: `Contact | ${company.name}`,
  description:
    "Start a conversation with Tauqeer Mustafa Inc. about enterprise web development, cybersecurity, AI solutions, cloud engineering, or product design.",
};

const expectations = [
  {
    title: "We respond within one business day",
    description: "Every message reaches the delivery team directly, not a queue.",
    icon: MessageSquareText,
  },
  {
    title: "A short discovery call",
    description: "We ask focused questions to understand scope before proposing an approach.",
    icon: Building2,
  },
  {
    title: "No pressure, no lock-in",
    description: "You get a clear recommendation, even if the answer is a smaller scope than expected.",
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us about the problem you're solving."
        description="Whether you need a new platform, a security review, an AI workflow, or help scaling infrastructure, share a few details and we'll follow up with next steps."
        image="/images/about/tmi-about-business.jpg"
        imageTitle="Let's talk"
        imageCaption="We usually reply within one business day."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="contact-form">
        <SectionHeader
          id="contact-form"
          eyebrow="Get in touch"
          title="Send us a message"
          description="Fill out the form and our team will get back to you shortly, or reach out directly using the details alongside it."
        />
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ContactForm />
          <ContactInfo />
        </div>
      </Section>

      <Section className="bg-white" labelledBy="contact-expectations">
        <SectionHeader
          id="contact-expectations"
          eyebrow="What happens next"
          title="A straightforward first step"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {expectations.map((item) => (
            <Card key={item.title}>
              <IconFrame icon={item.icon} />
              <h2 className="mt-6 text-xl font-semibold text-[#0A1628]">{item.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">{item.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <FAQ />
    </>
  );
}
