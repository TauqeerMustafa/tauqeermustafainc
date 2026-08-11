"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge, Card, ImagePlaceholder } from "@/components/home/ui";
import { readingTime } from "@/lib/utils";

type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string[];
};

const PAGE_SIZE = 6;

export function BlogGrid({
  posts,
  imageByCategory,
  fallbackImage,
}: {
  posts: Post[];
  imageByCategory: Record<string, string>;
  fallbackImage: string;
}) {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((post) => post.category)));
    return ["All", ...unique.sort()];
  }, [posts]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [posts, activeCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Filter posts by category"
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "rounded-none border border-[#0A0A0A] bg-[#0A0A0A] px-4 py-2 text-sm font-semibold text-white transition"
                  : "rounded-none border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-semibold text-[#171717] transition hover:border-[#0A0A0A] hover:text-[#262626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
              }
            >
              {category}
              {category !== "All" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({posts.filter((p) => p.category === category).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-14 text-base text-[#737373]">
          No posts in this category yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {visible.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden p-0">
              <div className="relative h-40 w-full overflow-hidden border-b border-[#E5E5E5]">
                <ImagePlaceholder
                  src={imageByCategory[post.category] ?? fallbackImage}
                  title={post.category}
                  className="h-full"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex flex-wrap gap-2">
                  <Badge>{post.category}</Badge>
                  <Badge>{post.date}</Badge>
                  <Badge>{readingTime(post.body)}</Badge>
                </div>
                <h2 className="mt-5 text-xl font-semibold leading-snug text-[#0A0A0A]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-[#262626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-4 text-base leading-7 text-[#737373]">{post.excerpt}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-none border border-[#0A0A0A] bg-transparent px-7 py-3 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
          >
            Load more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
