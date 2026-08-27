import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge, PageHero, Section } from "@/components/home/ui";
import { company } from "@/data/company";
import { getLegalDoc, legalDocs } from "@/data/legal-docs";

export function generateStaticParams() {
  return legalDocs.map((doc) => ({ doc: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc: slug } = await params;
  const doc = getLegalDoc(slug);

  if (!doc) return {};

  return {
    title: `${doc.title} | ${company.name}`,
    description: doc.shortDescription,
  };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc: slug } = await params;
  const doc = getLegalDoc(slug);

  if (!doc) {
    notFound();
  }

  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} description={doc.shortDescription}>
        <div className="flex flex-wrap gap-2">
          <Badge>Last updated: {doc.lastUpdated}</Badge>
        </div>
      </PageHero>

      <Section className="bg-surface" labelledBy="legal-doc-content">
        <article
          id="legal-doc-content"
          className="mx-auto max-w-3xl border border-line bg-canvas p-7 shadow-sm sm:p-10"
        >
          <p className="mb-6 text-base leading-8 text-ink">{doc.intro}</p>

          {doc.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="mb-4 mt-10 text-xl font-semibold text-ink">{section.heading}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i} className="mb-4 text-base leading-8 text-ink">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}

          <div className="mt-10 border-t border-line pt-6">
            <p className="text-sm text-ink-muted">
              Questions about this document? Contact our legal team at{" "}
              <a href={`mailto:${company.emails.legal}`} className="link-ul font-semibold text-ink">
                {company.emails.legal}
              </a>
              .
            </p>
          </div>
        </article>
      </Section>
    </>
  );
}
