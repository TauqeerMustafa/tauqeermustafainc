import type { Metadata } from "next";
import {
  Briefcase,
  Building2,
  CreditCard,
  Handshake,
  Headphones,
  Megaphone,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactMap from "@/components/contact/ContactMap";
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

const departments = [
  { title: "General inquiries", email: company.emails.general, icon: Building2 },
  { title: "Customer support", email: company.emails.support, icon: Headphones },
  { title: "Sales & new business", email: company.emails.sales, icon: Briefcase },
  { title: "Partnerships", email: company.emails.business, icon: Handshake },
  { title: "Marketing & press", email: company.emails.marketing, icon: Megaphone },
  { title: "Careers", email: company.emails.careers, icon: Users },
  { title: "Billing & invoices", email: company.emails.billing, icon: CreditCard },
  { title: "Legal & privacy", email: company.emails.legal, icon: Scale },
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
          <div className="flex flex-col gap-6">
            <ContactInfo />
            <ContactMap />
          </div>
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

      <Section className="bg-[#F8FAFC]" labelledBy="contact-departments">
        <SectionHeader
          id="contact-departments"
          eyebrow="Reach the right team"
          title="Department contacts"
          description="For a faster response, reach out to the team that matches your question directly."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => (
            <a
              key={dept.title}
              href={`mailto:${dept.email}`}
              className="group border border-[#D7DEE8] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition hover:border-[#0B5FFF]"
            >
              <IconFrame icon={dept.icon} />
              <h3 className="mt-4 text-sm font-semibold text-[#0A1628]">{dept.title}</h3>
              <p className="mt-1 break-all text-sm text-[#6B7280] transition group-hover:text-[#0A46A8]">
                {dept.email}
              </p>
            </a>
          ))}
        </div>
      </Section>

      <FAQ />
    </>
  );
}
