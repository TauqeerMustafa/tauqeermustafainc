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
import { PageHero, Section, SectionHeader } from "@/components/home/ui";
import { IconFrame } from "@/components/home/IconFrame";
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
        image="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
        imageTitle="Let's talk"
        imageCaption="We usually reply within one business day."
      />

      {/* ── Form + info ── warm cream canvas */}
      <Section className="bg-surface" labelledBy="contact-form">
        <SectionHeader
          id="contact-form"
          eyebrow="Get in touch"
          title="Send us a message"
          description="Fill out the form and our team will get back to you shortly, or reach out directly using the details alongside it."
        />
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <ContactForm />
          <div className="flex flex-col gap-6">
            <ContactInfo />
            <ContactMap />
          </div>
        </div>
      </Section>

      {/* ── What happens next ── lifted white surface */}
      <Section className="bg-canvas" labelledBy="contact-expectations">
        <SectionHeader
          id="contact-expectations"
          eyebrow="What happens next"
          title="A straightforward first step"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {expectations.map((item, i) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-line bg-surface p-8"
            >
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                0{i + 1}
              </span>
              <IconFrame icon={item.icon} className="mt-5" />
              <h2 className="mt-5 text-[19px] font-semibold leading-[1.3] tracking-[-0.374px] text-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-[15px] leading-[1.6] tracking-[-0.1px] text-ink-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Department contacts ── BMW M dark strip */}
      <Section className="bg-canvas" labelledBy="contact-departments">
        <SectionHeader
          id="contact-departments"
          eyebrow="Reach the right team"
          title="Department contacts"
          description="For a faster response, reach out to the team that matches your question directly."
          light
        />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => (
            <a
              key={dept.title}
              href={`mailto:${dept.email}`}
              className="group rounded-[14px] border border-line/10 bg-white/5 p-5 transition hover:border-action/40 hover:bg-ink/[0.08]"
            >
              <IconFrame icon={dept.icon} dark />
              <h3 className="mt-4 text-[14px] font-semibold tracking-[-0.1px] text-ink">
                {dept.title}
              </h3>
              <p className="mt-1 break-all text-[13px] leading-[1.5] text-ink-muted transition group-hover:text-action">
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
