import type { Metadata } from "next";

import { Badge, Card, PageHero, Section, SectionHeader } from "@/components/home/ui";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: `Cookie Policy | ${company.name}`,
  description: `How ${company.name} uses cookies and similar technologies on our website.`,
};

const lastUpdated = "July 28, 2026";

const cookieCategories = [
  {
    title: "Essential Cookies",
    description:
      "Required for core site functionality, such as navigation, session security, and remembering form progress. The Site cannot function properly without these.",
  },
  {
    title: "Analytics Cookies",
    description:
      "Help us understand how visitors use the Site, such as which pages are visited and how long users stay, so we can improve content and performance.",
  },
  {
    title: "Functional Cookies",
    description:
      "Remember choices you make, such as language or region, to provide a more personalized experience on return visits.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
        description="This page explains what cookies are, how we use them on our website, and how you can control your preferences."
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Last updated: {lastUpdated}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="cookies-intro">
        <article
          id="cookies-intro"
          className="mx-auto max-w-3xl rounded-none border border-[#E5E7EB] bg-white p-7 shadow-sm sm:p-10"
        >
          <h2 className="mb-4 mt-0 text-xl font-semibold text-[#0A1628]">What Are Cookies</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            Cookies are small text files placed on your device when you visit a website. They are widely used to
            make websites work, work more efficiently, and provide information to site owners. We use cookies and
            similar technologies, such as local storage, on {company.website}.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">How to Control Cookies</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            Most browsers allow you to control cookies through their settings, including blocking or deleting
            cookies. Because cookies allow you to take advantage of some essential features of the Site, we
            recommend leaving them enabled where functionality depends on them. Disabling non-essential cookies
            should not affect your ability to browse the Site.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">Third-Party Cookies</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            Some cookies may be placed by third-party services we use for analytics or embedded content. These
            third parties have their own privacy and cookie policies governing how they use information collected
            through their cookies.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">Changes to This Policy</h2>
          <p className="mb-6 text-base leading-8 text-[#374151]">
            We may update this Cookie Policy periodically to reflect changes in the cookies we use or for
            operational, legal, or regulatory reasons. The &quot;Last updated&quot; date above reflects the most
            recent revision.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A1628]">Contact Us</h2>
          <p className="text-base leading-8 text-[#374151]">
            If you have questions about our use of cookies, contact us at{" "}
            <a href={`mailto:${company.emails.legal}`} className="font-medium text-[#0A46A8] underline underline-offset-2">
              {company.emails.legal}
            </a>
            .
          </p>
        </article>
      </Section>

      <Section className="bg-white" labelledBy="cookie-categories">
        <SectionHeader
          id="cookie-categories"
          eyebrow="Cookie categories"
          title="The types of cookies we use"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {cookieCategories.map((category) => (
            <Card key={category.title}>
              <h2 className="text-xl font-semibold text-[#0A1628]">{category.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">{category.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
