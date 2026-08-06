"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";

import { posts } from "@/lib/site-data";
import { Badge, Section, SectionHeader, TextLink, useScrollReveal } from "./ui";

export default function LatestBlogs() {
  const [featuredPost, ...otherPosts] = posts.slice(0, 3);
  const gridRef = useScrollReveal<HTMLDivElement>();

  return (
    <Section className="bg-[#F4F7FC]" labelledBy="blogs-title">
      <SectionHeader
        id="blogs-title"
        eyebrow="Latest Insights"
        title="Practical guidance for digital leaders"
        action={<TextLink href="/blog">Read All Articles</TextLink>}
      />

      <div ref={gridRef} className="sr anim-up mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

        {/* Featured post */}
        <article className="lift group overflow-hidden border border-[#D7DEE8] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.06)] hover:border-[#0B5FFF]">
          <div className="img-zoom relative aspect-video overflow-hidden">
            <Image
              src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-bg-abstract_a8lsu9.jpg"
              alt={featuredPost.title}
              fill
              sizes="(min-width:1024px) 55vw,100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Badge variant="blue">{featuredPost.category}</Badge>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA5B4]">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden />{featuredPost.date}</span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />5 min read</span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold leading-snug text-[#0A1628] sm:text-3xl">
              <Link href={`/blog/${featuredPost.slug}`} className="transition hover:text-[#0A46A8]">
                {featuredPost.title}
              </Link>
            </h3>
            <p className="mt-4 text-base leading-7 text-[#5F6673]">{featuredPost.excerpt}</p>
            <div className="mt-6">
              <Link href={`/blog/${featuredPost.slug}`} className="link-ul inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A46A8] hover:text-[#0B5FFF]">
                Read article <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </article>

        {/* Secondary posts */}
        <div className="flex flex-col gap-4">
          {otherPosts.map((post, i) => (
            <article
              key={post.slug}
              className={`lift group flex flex-col gap-4 border border-[#D7DEE8] bg-white p-5 transition hover:border-[#0B5FFF] sm:flex-row sm:items-start sm:p-6 d-${i + 1}`}
            >
              <div className="img-zoom relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-square sm:w-28">
                <Image
                  src="https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-bg-abstract_a8lsu9.jpg"
                  alt={post.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <Badge variant="blue">{post.category}</Badge>
                <h3 className="mt-2 text-base font-semibold leading-snug text-[#0A1628]">
                  <Link href={`/blog/${post.slug}`} className="transition hover:text-[#0A46A8]">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5F6673]">{post.excerpt}</p>
                <p className="mt-2 text-xs text-[#9AA5B4]">{post.date}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
