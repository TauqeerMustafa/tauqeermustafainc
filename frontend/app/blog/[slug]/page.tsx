import { notFound } from "next/navigation";

import { Badge, PageHero, Section } from "@/components/home/ui";
import { posts } from "@/lib/site-data";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title} description={post.excerpt}>
        <div className="flex flex-wrap gap-2">
          <Badge>{post.date}</Badge>
          <Badge>{post.category}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="article-content">
        <article
          id="article-content"
          className="mx-auto max-w-3xl rounded-lg border border-[#E5E7EB] bg-white p-7 shadow-sm sm:p-10"
        >
          {post.body.map((paragraph) => (
            <p
              key={paragraph}
              className="mb-6 text-base leading-8 text-[#374151] last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </article>
      </Section>
    </>
  );
}
