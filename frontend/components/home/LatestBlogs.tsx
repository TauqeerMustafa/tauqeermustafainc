import Link from "next/link";
import { Calendar } from "lucide-react";

import { ImagePlaceholder, Section, SectionHeader, TextLink } from "@/components/home/ui";
import { posts } from "@/lib/site-data";

export default function LatestBlogs() {
  const [featuredPost, ...otherPosts] = posts.slice(0, 3);

  return (
    <Section className="bg-[#F4F7FC]" labelledBy="blogs-title">
      <SectionHeader
        id="blogs-title"
        eyebrow="Latest insights"
        title="Practical guidance for digital leaders"
        action={<TextLink href="/blog">Read All Articles</TextLink>}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-none border border-[#D7DEE8] bg-white">
          <ImagePlaceholder
            src="/images/backgrounds/tmi-bg-abstract.jpg"
            title={featuredPost.category}
            caption={featuredPost.date}
            className="rounded-none border-0 shadow-none"
          />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              <span className="font-semibold text-[#0A46A8]">{featuredPost.category}</span>
              <span aria-hidden="true">/</span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {featuredPost.date}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold leading-snug text-[#0A1628] sm:text-3xl">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="transition hover:text-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
              >
                {featuredPost.title}
              </Link>
            </h3>
            <p className="mt-4 text-base leading-7 text-[#5F6673]">
              {featuredPost.excerpt}
            </p>
          </div>
        </article>

        <div className="grid gap-5">
          {otherPosts.map((post) => (
            <article key={post.slug} className="border-t border-[#C7D2E0] pt-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                <span className="font-semibold text-[#0A46A8]">{post.category}</span>
                <span aria-hidden="true">/</span>
                <span>{post.date}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold leading-snug text-[#0A1628]">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#5F6673]">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
