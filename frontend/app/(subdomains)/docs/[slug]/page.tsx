import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ALL_DOCS, getDocBySlug } from '@/data/docs-registry';
import DocReaderClient from './DocReaderClient';

export function generateStaticParams() {
  return ALL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'Document Not Found | TMI Docs',
    };
  }

  return {
    title: `${doc.title} | TMI Documentation & Policies`,
    description: doc.shortDescription,
  };
}

export default async function DocDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const currentIndex = ALL_DOCS.findIndex((d) => d.slug === doc.slug);
  const prevDoc = currentIndex > 0 ? ALL_DOCS[currentIndex - 1] : undefined;
  const nextDoc = currentIndex < ALL_DOCS.length - 1 ? ALL_DOCS[currentIndex + 1] : undefined;

  return <DocReaderClient doc={doc} prevDoc={prevDoc} nextDoc={nextDoc} />;
}
