"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Sparkles,
  Users,
  X,
  FileText,
} from "lucide-react";

import {
  communityGuidelines,
  communityMembers,
  communityPosts,
  communityStats,
  communityTopics,
  type CommunityPost,
} from "@/data/community";
import { PageHero, Section, Badge, BadgeMuted, MStripe } from "@/components/home/ui";

const avatarColors = ["bg-action", "bg-[#0066b1]", "bg-[#e22718]", "bg-canvas"];

function Avatar({
  initials,
  index = 0,
  size = "md",
}: {
  initials: string;
  index?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-[11px]",
    lg: "h-12 w-12 text-xs",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-mono font-bold text-white ${
        avatarColors[index % avatarColors.length]
      } ${sizes[size]}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function PostCard({
  post,
  index,
  onLike,
}: {
  post: CommunityPost;
  index: number;
  onLike: (slug: string) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <article className="group border-b border-line py-8 first:pt-2 transition hover:bg-surface/30 px-2 sm:px-4">
      <div className="flex items-start gap-4">
        <Avatar initials={post.initials} index={index} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-semibold text-ink">{post.author}</span>
            <span className="text-ink-muted">//</span>
            <span className="text-ink-muted">{post.role}</span>
            <span className="text-ink-muted">//</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              {post.time}
            </span>
          </div>

          <Link
            href={`/community/${post.slug}`}
            className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
          >
            <h3 className="max-w-2xl text-xl font-bold uppercase leading-[1.2] tracking-[-0.02em] text-ink transition-colors group-hover:text-action sm:text-2xl">
              {post.title}
            </h3>
            <p className="mt-2.5 max-w-2xl text-sm font-light leading-relaxed text-ink-muted">
              {post.excerpt}
            </p>
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="border border-line bg-surface px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink">
              {post.category}
            </span>
            {post.solved && (
              <span className="inline-flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" aria-hidden /> Solved
              </span>
            )}
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="font-mono text-[10px] text-ink-muted">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-ink-muted">
            <button
              type="button"
              onClick={() => onLike(post.slug)}
              aria-label={`Like ${post.title}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-line bg-surface hover:text-[#e22718] transition cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5" aria-hidden />
              <span>{post.likes}</span>
            </button>

            <Link
              href={`/community/${post.slug}#replies`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-line bg-surface hover:text-action transition"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              <span>{post.replies}</span>
            </Link>

            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-label={saved ? `Remove saved post` : `Save post`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-line bg-surface hover:text-action transition cursor-pointer ${
                saved ? "text-action border-action" : ""
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} aria-hidden />
            </button>

            <button
              type="button"
              onClick={() => setShared((v) => !v)}
              aria-label={`Share ${post.title}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-line bg-surface hover:text-action transition cursor-pointer ${
                shared ? "text-action border-action" : ""
              }`}
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              <span>{shared ? "Copied" : "Share"}</span>
            </button>

            <span className="ml-auto hidden font-mono text-[10px] text-ink-muted sm:inline">
              {post.views.toLocaleString()} READS
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Composer({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posted, setPosted] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-title"
    >
      <div className="w-full max-w-2xl border border-line bg-surface p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">
              Start a discussion // Open Forum
            </p>
            <h2 id="composer-title" className="mt-2 text-2xl font-bold uppercase tracking-tight text-ink">
              What are you building or solving?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close composer"
            className="inline-flex h-9 w-9 items-center justify-center border border-line text-ink-muted hover:border-ink hover:text-ink cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {posted ? (
          <div className="mt-6 border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-relaxed text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" aria-hidden />
            <p className="font-semibold">Your discussion topic is published.</p>
            <p className="mt-1 text-xs text-ink-muted">
              Thank you for contributing to the Tauqeer Mustafa Inc. technical community.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-action underline underline-offset-4 cursor-pointer"
            >
              Return to community
            </button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim() && body.trim()) setPosted(true);
            }}
          >
            <div>
              <label
                htmlFor="post-title"
                className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted"
              >
                Topic Headline
              </label>
              <input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Choosing between FastAPI microservices and Next.js Route Handlers..."
                className="h-11 w-full border border-line bg-card px-4 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-action"
                required
              />
            </div>

            <div>
              <label
                htmlFor="post-body"
                className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted"
              >
                Technical Context & Question
              </label>
              <textarea
                id="post-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your architecture context, what you've tried, and what questions you have..."
                rows={5}
                className="w-full resize-y border border-line bg-card px-4 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-muted focus:border-action"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-line">
              <p className="text-xs text-ink-muted">
                Be specific, generous with code snippets, and protect confidential credentials.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-action px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-action hover:bg-action-strong transition cursor-pointer"
              >
                <span>Publish Topic</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CommunityHub() {
  const [activeTopic, setActiveTopic] = useState("All conversations");
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);

  const filteredPosts = useMemo(
    () =>
      communityPosts.filter((post) => {
        const matchesTopic =
          activeTopic === "All conversations" || post.category === activeTopic;
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          !normalizedQuery ||
          [post.title, post.excerpt, post.author, ...post.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        return matchesTopic && matchesQuery;
      }),
    [activeTopic, query]
  );

  const toggleLike = (slug: string) =>
    setLiked((cur) =>
      cur.includes(slug) ? cur.filter((item) => item !== slug) : [...cur, slug]
    );

  return (
    <>
      <PageHero
        eyebrow="Open Engineering // Technical Exchange"
        title="TMI Developer Community"
        description="A thoughtful space for software engineers, founders, and system architects shaping production products and sharing real-world decisions."
      >
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-action px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-on-action hover:bg-action-strong transition cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden />
          <span>Start a conversation</span>
        </button>

        <Link
          href="/community/guidelines"
          className="inline-flex items-center justify-center gap-2 border border-line bg-surface px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-action hover:text-action transition"
        >
          <span>Community Guidelines</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </PageHero>

      {/* Main Section */}
      <Section className="bg-canvas py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* Main Feed Column */}
          <div>
            {/* Filter Pills & Search */}
            <div className="space-y-4 mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-line">
                {communityTopics.map((topic) => (
                  <button
                    type="button"
                    key={topic.name}
                    onClick={() => setActiveTopic(topic.name)}
                    className={`inline-flex shrink-0 items-center gap-2 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition cursor-pointer border ${
                      activeTopic === topic.name
                        ? "bg-action text-on-action border-action"
                        : "bg-surface text-ink-muted border-line hover:text-ink hover:border-action/40"
                    }`}
                  >
                    <span>{topic.name}</span>
                    <span className="text-[9px] opacity-70">({topic.count})</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH CONVERSATIONS, ARCHITECTURES, OR TAGS..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line font-mono text-xs uppercase tracking-wider text-ink outline-none transition placeholder:text-ink-muted focus:border-action"
                />
              </div>
            </div>

            {/* Posts Feed */}
            <div className="border border-line bg-surface p-4 sm:p-6 divide-y divide-line">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <PostCard
                    key={post.slug}
                    post={{
                      ...post,
                      likes: post.likes + (liked.includes(post.slug) ? 1 : 0),
                    }}
                    index={index}
                    onLike={toggleLike}
                  />
                ))
              ) : (
                <div className="p-12 text-center text-ink-muted font-mono text-xs uppercase">
                  <Search className="mx-auto h-6 w-6 text-ink-muted mb-2" aria-hidden />
                  <p className="font-bold">No discussions found</p>
                  <p className="mt-1 text-[11px]">Try another topic or clear your search term.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            {/* Community Stats */}
            <div className="border border-line bg-surface p-6 space-y-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-action block">
                Community Telemetry
              </span>
              <div className="grid grid-cols-1 gap-4">
                {communityStats.map((stat) => (
                  <div key={stat.label} className="border-l-2 border-action pl-3 py-0.5">
                    <p className="font-mono text-xl font-bold text-ink">{stat.value}</p>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="border border-line bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-action">
                  Top Contributors
                </span>
                <Users className="h-4 w-4 text-ink-muted" aria-hidden />
              </div>

              <div className="space-y-3">
                {communityMembers.slice(0, 4).map((member, index) => (
                  <Link
                    href="/community/members"
                    key={member.name}
                    className="flex items-center gap-3 border-b border-line pb-3 last:border-0 last:pb-0 hover:text-action transition"
                  >
                    <Avatar initials={member.initials} index={index} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-ink">{member.name}</p>
                      <p className="truncate text-[11px] text-ink-muted font-light">{member.specialty}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/community/members"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-action hover:underline pt-2"
              >
                <span>View all members</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Code of Conduct */}
            <div className="border border-line bg-surface p-6 space-y-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-action block">
                Community Principles
              </span>
              <ul className="space-y-2.5 text-xs text-ink-muted font-light leading-relaxed">
                {communityGuidelines.slice(0, 3).map((item) => (
                  <li key={item.number} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] font-bold text-action shrink-0 mt-0.5">
                      {item.number}
                    </span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/community/guidelines"
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink hover:text-action transition pt-2 block"
              >
                <span>Read Full Guidelines</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      {composerOpen && <Composer onClose={() => setComposerOpen(false)} />}
    </>
  );
}

