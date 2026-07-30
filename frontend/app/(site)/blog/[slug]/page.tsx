import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, PageHero, Section, SectionHeader } from "@/components/home/ui";
import { posts } from "@/lib/site-data";
import { buildMetadata } from "@/lib/metadata";

const imageByCategory: Record<string, string> = {
  Engineering: "/images/hero/tmi-hero-code.jpg",
  Automation: "/images/services/tmi-service-ai-security.jpg",
  Cybersecurity: "/images/services/tmi-service-cyber-shield.jpg",
  "Cloud Engineering": "/images/services/tmi-service-global-network.jpg",
  "Product Design": "/images/backgrounds/tmi-bg-bokeh.jpg",
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
    image: imageByCategory[post.category] ?? "/images/hero/tmi-hero-digital.jpg",
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
        image={imageByCategory[post.category] ?? "/images/hero/tmi-hero-digital.jpg"}
        imageTitle={post.category}
        imageCaption={post.date}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{post.date}</Badge>
          <Badge>{post.category}</Badge>
        </div>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="article-content">
        <article
          id="article-content"
          className="mx-auto max-w-3xl rounded-none border border-[#E5E7EB] bg-white p-7 shadow-sm sm:p-10"
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

      <Section className="bg-white" labelledBy="related-posts">
        <SectionHeader id="related-posts" eyebrow="Keep reading" title="More from the blog" />
        <div className="mt-10 flex flex-wrap gap-4">
          {others.map((item) => (
            <Link
              key={item.slug}
              href={`/blog/${item.slug}`}
              className="border border-[#D7DEE8] bg-white px-5 py-3 text-sm font-semibold text-[#0A1628] transition hover:border-[#0B5FFF] hover:text-[#0A46A8]"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
