import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/home/ui";
import { blogPosts, blogReadingTime } from "@/data/blog";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Practical guidance on engineering, cybersecurity, AI automation, cloud infrastructure, and product design.",
  path: "/blog",
  image: "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=1600&q=80",
});

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      {/* Hero */}
      <div className="bg-white px-5 pb-16 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
        <div className="mx-auto max-w-[980px]">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066b1]">
            Blog
          </p>
          <h1 className="mt-4 max-w-4xl text-[40px] font-bold uppercase leading-[1.05] tracking-[-0.02em] sm:text-[56px] lg:text-[64px] text-[#141413]">
            Practical guidance for engineering, security, and automation leaders.
          </h1>
          <p className="mt-6 max-w-2xl text-[21px] font-[400] leading-[1.38] tracking-[-0.374px] text-[#6a6a6a]">
            Short, focused writing on building secure platforms, evaluating operational risk, and adopting automation responsibly.
          </p>
        </div>
      </div>

      {/* Featured article */}
      <Section className="bg-[#f3f0ee]" labelledBy="featured-article">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066b1]">
              Featured article
            </p>
            <h2
              id="featured-article"
              className="mt-4 text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] sm:text-[42px] text-[#141413]"
            >
              {featured.title}
            </h2>
            <p className="mt-6 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#6a6a6a]">
              {featured.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#e2ded9] bg-white px-3 py-1.5 text-[12px] font-semibold leading-none tracking-[-0.12px] text-[#6a6a6a]">
                {featured.category}
              </span>
              <span className="rounded-full border border-[#e2ded9] bg-white px-3 py-1.5 text-[12px] font-semibold leading-none tracking-[-0.12px] text-[#6a6a6a]">
                {featured.date}
              </span>
              <span className="rounded-full border border-[#e2ded9] bg-white px-3 py-1.5 text-[12px] font-semibold leading-none tracking-[-0.12px] text-[#6a6a6a]">
                {blogReadingTime(featured.body)}
              </span>
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="mt-6 inline-flex items-center justify-center bg-[#1c69d4] px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#0066b1]"
            >
              Read Article
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image
              src={featured.coverImage}
              alt={featured.coverAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
              style={{ boxShadow: "rgba(0,0,0,0.22) 3px 5px 30px 0" }}
            />
          </div>
        </div>
      </Section>

      {/* Latest posts */}
      <Section className="bg-white" labelledBy="latest-posts">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066b1]">
              Latest posts
            </p>
            <h2
              id="latest-posts"
              className="mt-4 text-[32px] font-bold uppercase leading-[1.1] tracking-[-0.02em] sm:text-[42px] text-[#141413]"
            >
              Recent insights
            </h2>
          </div>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[#e2ded9] bg-white transition hover:border-[#1c69d4]"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[#1c69d4]">
                    {post.category}
                  </span>
                  <span className="text-[12px] leading-none tracking-[-0.12px] text-[#6a6a6a]">
                    {post.date}
                  </span>
                </div>
                <h3 className="mt-4 text-[21px] font-semibold leading-[1.19] tracking-[-0.374px] text-[#141413] transition group-hover:text-[#1c69d4]">
                  {post.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.43] tracking-[-0.224px] text-[#6a6a6a]">
                  {post.excerpt}
                </p>
                <div className="mt-4 text-[12px] leading-none tracking-[-0.12px] text-[#6a6a6a]">
                  {blogReadingTime(post.body)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
