import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, PageHero, Section, SectionHeader } from "@/components/home/ui";
import { posts } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";
import { readingTime } from "@/lib/utils";

const imageByCategory: Record<string, string> = {
  Engineering: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=1600&q=80",
  Automation: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80",
  Cybersecurity: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1600&q=80",
  "Cloud Engineering": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  "Product Design": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  Culture: "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80",
  "Product Strategy": "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: imageByCategory[post.category] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
  });
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

  const related = posts.filter((item) => item.category === post.category && item.slug !== post.slug).slice(0, 3);
  const others = related.length > 0 ? related : posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        description={post.excerpt}
        image={imageByCategory[post.category] ?? "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"}
        imageTitle={post.category}
        imageCaption={post.date}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{post.date}</Badge>
          <Badge>{post.category}</Badge>
          <Badge>{readingTime(post.body)}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#FAFAFA]" labelledBy="article-content">
        <article
          id="article-content"
          className="mx-auto max-w-3xl rounded-none border border-[#E5E5E5] bg-white p-7 shadow-sm sm:p-10"
        >
          {post.body.map((paragraph) => (
            <p
              key={paragraph}
              className="mb-6 text-base leading-8 text-[#171717] last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </article>
      </Section>

      <Section className="bg-white" labelledBy="related-posts">
        <SectionHeader id="related-posts" eyebrow="Keep reading" title="More from the blog" />
        <div className="mt-10 flex flex-wrap gap-4">
          {others.map((item) => (
            <Link
              key={item.slug}
              href={`/blog/${item.slug}`}
              className="border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold text-[#0A0A0A] transition hover:border-[#0A0A0A] hover:text-[#262626]"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
