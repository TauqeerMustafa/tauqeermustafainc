"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";

import { imageLibrary } from "@/data/media";
import { posts } from "@/lib/site-data";
import { Pill, Reveal, Section, SectionHeader, TextLink, fadeUp } from "./ui";

/* ── BMW M dark tile — editorial cards with Mastercard radius ── */

export default function LatestBlogs() {
  const [featuredPost, ...otherPosts] = posts.slice(0, 3);

  return (
    <Section className="bg-[#1a2129]" labelledBy="blogs-title">
      <SectionHeader
        id="blogs-title"
        eyebrow="Latest Insights"
        title="Practical guidance for digital leaders"
        light
        action={<TextLink href="/blog">Read All Articles</TextLink>}
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

        <Reveal
          variant={fadeUp}
          className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition-colors hover:border-[#1c69d4]/40"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageLibrary.backgrounds[0]}
              alt={featuredPost.title}
              fill
              sizes="(min-width:1024px) 55vw,100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a2129]/90 via-[#1a2129]/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur">
                {featuredPost.category}
              </span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden />{featuredPost.date}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />6 min read
              </span>
            </div>
            <h3 className="mt-4 text-[22px] font-bold uppercase leading-[1.2] tracking-[-0.01em] text-white sm:text-[26px]">
              <Link href={`/blog/${featuredPost.slug}`} className="transition-colors hover:text-[#1c69d4]">
                {featuredPost.title}
              </Link>
            </h3>
            <p className="mt-4 text-[15px] font-light leading-[1.6] tracking-[-0.01em] text-white/55">
              {featuredPost.excerpt}
            </p>
            <div className="mt-6">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group/link inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-[#1c69d4] transition-colors hover:text-white"
              >
                Read Article
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" aria-hidden />
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
              className="group flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#1c69d4]/40 sm:flex-row sm:items-start sm:p-6"
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[14px] sm:aspect-square sm:w-28">
                <Image
                  src={imageLibrary.backgrounds[(i + 1) % imageLibrary.backgrounds.length]}
                  alt={post.title}
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
              </div>
              <div className="min-w-0">
                <Pill dark>{post.category}</Pill>
                <h3 className="mt-3 text-[15px] font-bold uppercase leading-[1.3] tracking-[0.01em] text-white">
                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-[#1c69d4]">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-[14px] font-light leading-[1.6] tracking-[-0.01em] text-white/50">
                  {post.excerpt}
                </p>
                <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white/35">{post.date}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
