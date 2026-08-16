import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/home/ui";
import { blogPosts, blogReadingTime } from "@/data/blog";
import { buildMetadata } from "@/lib/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const related = blogPosts
    .filter((item) => item.category === post.category && item.slug !== post.slug)
    .slice(0, 3);
  const others = related.length > 0 ? related : blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  // Generate structured data for SEO
  const article = articleSchema({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    publishedAt: new Date(post.date).toISOString(),
    author: "Tauqeer Mustafa",
    image: post.coverImage,
  });

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "https://tauqeermustafa.tech" },
    { name: "Blog", url: "https://tauqeermustafa.tech/blog" },
    { name: post.title, url: `https://tauqeermustafa.tech/blog/${post.slug}` },
  ]);

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* Hero with cover image */}
      <div className="relative bg-[#000000]">
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[980px] px-5 pb-12 sm:px-6 sm:pb-16">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold leading-none tracking-[-0.12px] text-white backdrop-blur-sm">
                {post.category}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold leading-none tracking-[-0.12px] text-white backdrop-blur-sm">
                {post.date}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-semibold leading-none tracking-[-0.12px] text-white backdrop-blur-sm">
                {blogReadingTime(post.body)}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl text-[48px] font-semibold leading-[1.08] tracking-[-0.374px] text-white sm:text-[56px]">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[21px] font-[400] leading-[1.38] tracking-[-0.374px] text-white/90">
              {post.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Article body */}
      <Section className="bg-white" labelledBy="article-content">
        <article id="article-content" className="mx-auto max-w-[720px]">
          {post.body.map((block, idx) => {
            if (block.type === "p") {
              return (
                <p
                  key={idx}
                  className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#1d1d1f] first:mt-0"
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "h2") {
              return (
                <h2
                  key={idx}
                  className="mt-12 text-[32px] font-semibold leading-[1.13] tracking-[-0.374px] text-[#1d1d1f] first:mt-0"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "h3") {
              return (
                <h3
                  key={idx}
                  className="mt-10 text-[24px] font-semibold leading-[1.17] tracking-[-0.374px] text-[#1d1d1f] first:mt-0"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.type === "quote") {
              return (
                <blockquote
                  key={idx}
                  className="my-12 border-l-4 border-[#0066cc] bg-[#f5f5f7] px-6 py-8 first:mt-0"
                >
                  <p className="text-[21px] font-semibold leading-[1.38] tracking-[-0.374px] text-[#1d1d1f]">
                    {block.text}
                  </p>
                  {block.attribution && (
                    <cite className="mt-3 block text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a] not-italic">
                      — {block.attribution}
                    </cite>
                  )}
                </blockquote>
              );
            }
            if (block.type === "img") {
              return (
                <figure key={idx} className="my-12 first:mt-0">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[18px]">
                    <Image
                      src={block.src}
                      alt={block.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 720px"
                      className="object-cover"
                      style={{ boxShadow: "rgba(0,0,0,0.12) 0px 4px 16px 0" }}
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="mt-3 text-center text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return null;
          })}
        </article>

        {/* Tags */}
        <div className="mx-auto mt-16 max-w-[720px] border-t border-[#e0e0e0] pt-8">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#e0e0e0] bg-[#f5f5f7] px-4 py-2 text-[14px] font-semibold leading-none tracking-[-0.224px] text-[#1d1d1f]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Related posts */}
      <Section className="bg-[#f5f5f7]" labelledBy="related-posts">
        <div className="mx-auto max-w-[980px]">
          <h2
            id="related-posts"
            className="text-[21px] font-semibold leading-[1.19] tracking-[0.231px] text-[#1d1d1f]"
          >
            Keep reading
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group flex flex-col overflow-hidden rounded-[18px] border border-[#e0e0e0] bg-white transition hover:border-[#0066cc]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={item.coverImage}
                    alt={item.coverAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[#0066cc]">
                    {item.category}
                  </span>
                  <h3 className="mt-3 text-[17px] font-semibold leading-[1.24] tracking-[-0.374px] text-[#1d1d1f]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#7a7a7a]">
                    {blogReadingTime(item.body)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
