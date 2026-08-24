"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { posts } from "@/lib/site-data";
import { BadgeMuted, Reveal, Section, SectionHeader, TextLink, fadeUp } from "./ui";

export default function LatestBlogs() {
  const [featuredPost, ...otherPosts] = posts.slice(0, 3);

  return (
    <Section className="bg-[#FAFAFA]" labelledBy="blogs-title">
      <SectionHeader
        id="blogs-title"
        eyebrow="Latest Insights"
        title="Practical guidance for digital leaders"
        action={<TextLink href="/blog">Read All Articles</TextLink>}
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

        <Reveal variant={fadeUp} className="lift group overflow-hidden border border-[#E5E5E5] bg-white hover:border-[#0A0A0A]">
          <div className="img-zoom relative aspect-video overflow-hidden">
            <Image
              src={imageLibrary.backgrounds[0]}
              alt={featuredPost.title}
              fill
              sizes="(min-width:1024px) 55vw,100vw"
              className="object-cover grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center border border-white/40 bg-black/40 px-2.5 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur">
                {featuredPost.category}
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#A3A3A3]">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden />{featuredPost.date}</span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />6 min read</span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold leading-snug text-[#0A0A0A] sm:text-3xl">
              <Link href={`/blog/${featuredPost.slug}`} className="transition hover:text-[#404040]">
                {featuredPost.title}
              </Link>
            </h3>
            <p className="mt-4 text-base leading-7 text-[#525252]">{featuredPost.excerpt}</p>
            <div className="mt-6">
              <Link href={`/blog/${featuredPost.slug}`} className="link-ul inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0A] hover:text-[#404040]">
                Read article <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          {otherPosts.map((post, i) => (
            <Reveal
              key={post.slug}
              variant={fadeUp}
              delay={0.08 * (i + 1)}
              className="lift group flex flex-col gap-4 border border-[#E5E5E5] bg-white p-5 hover:border-[#0A0A0A] sm:flex-row sm:items-start sm:p-6"
            >
              <div className="img-zoom relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-square sm:w-28">
                <Image
                  src={imageLibrary.backgrounds[(i + 1) % imageLibrary.backgrounds.length]}
                  alt={post.title}
                  fill
                  sizes="112px"
                  className="object-cover grayscale"
                />
              </div>
              <div className="min-w-0">
                <BadgeMuted>{post.category}</BadgeMuted>
                <h3 className="mt-2 text-base font-semibold leading-snug text-[#0A0A0A]">
                  <Link href={`/blog/${post.slug}`} className="transition hover:text-[#404040]">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#525252]">{post.excerpt}</p>
                <p className="mt-2 text-xs text-[#A3A3A3]">{post.date}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
