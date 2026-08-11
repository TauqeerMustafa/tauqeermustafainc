import type { Metadata } from "next";

import { Badge, Card, PageHero, Section, SectionHeader } from "@/components/home/ui";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: `Accessibility Statement | ${company.name}`,
  description: `Our commitment to digital accessibility and how to report accessibility issues on ${company.name}'s website.`,
};

const lastUpdated = "July 30, 2026";

const commitments = [
  {
    title: "WCAG 2.1 AA as our baseline",
    description:
      "We design and build against the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as a working standard, covering color contrast, keyboard navigation, and semantic structure.",
  },
  {
    title: "Keyboard and screen reader support",
    description:
      "Interactive elements are built to be operable by keyboard alone, with visible focus states and labels that work with assistive technology.",
  },
  {
    title: "Ongoing review, not a one-time fix",
    description:
      "Accessibility is checked as part of our normal build process, not treated as a final step before launch, so it doesn't regress silently over time.",
  },
];

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Accessibility Statement"
        description="We want this site to be usable by as many people as possible, including people who rely on assistive technology."
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Last updated: {lastUpdated}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#FAFAFA]" labelledBy="accessibility-intro">
        <article
          id="accessibility-intro"
          className="mx-auto max-w-3xl rounded-none border border-[#E5E5E5] bg-white p-7 shadow-sm sm:p-10"
        >
          <h2 className="mb-4 mt-0 text-xl font-semibold text-[#0A0A0A]">Our Approach</h2>
          <p className="mb-6 text-base leading-8 text-[#171717]">
            {company.name} is committed to providing a website that is accessible to the widest
            possible audience, regardless of technology or ability. We aim to meet WCAG 2.1 Level
            AA guidance across the pages we control, and we treat accessibility as an ongoing
            responsibility rather than a single project milestone.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A0A0A]">Known Limitations</h2>
          <p className="mb-6 text-base leading-8 text-[#171717]">
            No website is perfectly accessible to every user in every situation. Some third-party
            embedded content, such as the map on our Contact page, is provided by external
            services and may not fully meet the same standard we hold for our own pages. We
            continue to review and improve these areas as better options become available.
          </p>

          <h2 className="mb-4 mt-10 text-xl font-semibold text-[#0A0A0A]">Reporting an Issue</h2>
          <p className="text-base leading-8 text-[#171717]">
            If you encounter a barrier using this site, please tell us the page URL, what you were
            trying to do, and the assistive technology or browser you were using, so we can
            investigate. Contact us at{" "}
            <a
              href={`mailto:${company.emails.support}`}
              className="font-medium text-[#262626] underline underline-offset-2"
            >
              {company.emails.support}
            </a>
            . We aim to acknowledge accessibility reports within one business day.
          </p>
        </article>
      </Section>

      <Section className="bg-white" labelledBy="accessibility-commitments">
        <SectionHeader
          id="accessibility-commitments"
          eyebrow="What this means in practice"
          title="How accessibility shows up in our work"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {commitments.map((item) => (
            <Card key={item.title}>
              <h2 className="text-xl font-semibold text-[#0A0A0A]">{item.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#737373]">{item.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
