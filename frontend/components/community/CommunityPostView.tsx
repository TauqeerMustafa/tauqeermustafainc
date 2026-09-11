"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { communityPosts, type CommunityPost } from "@/data/community";
import { PageHero, Section, Badge, BadgeMuted, MStripe } from "@/components/home/ui";

const replies = [
  {
    initials: "SA",
    name: "Sara Ahmed",
    role: "Design Technologist",
    time: "Apr 02, 2026",
    body: "The idea of making the review ritual small enough to repeat is the part I am taking away. Security guidance is only useful when it survives a busy development sprint.",
  },
  {
    initials: "LM",
    name: "Leo Martins",
    role: "Cloud Architect",
    time: "Apr 03, 2026",
    body: "Would love to see the threat-model template you used. We have been trying to keep it close to the pull request without making the PR unreadable.",
  },
  {
    initials: "AK",
    name: "Ayesha Khan",
    role: "Product Engineer",
    time: "Apr 04, 2026",
    body: "The key is to record the architectural decision and the residual risk clearly, rather than producing a 30-page static specification.",
  },
];

function SmallAvatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center font-mono text-[10px] font-bold text-white bg-action">
      {initials}
    </span>
  );
}

export default function CommunityPostView({ post }: { post: CommunityPost }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);

  const related = communityPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={`TMI Community // ${post.category}`}
        title={post.title}
        description={post.excerpt}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 border border-line bg-surface px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-action hover:text-action transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Community</span>
          </Link>
          {post.solved && (
            <span className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Solved Discussion
            </span>
          )}
        </div>
      </PageHero>

      <Section className="bg-canvas py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* Main Post Article */}
          <article className="space-y-8">
            {/* Author Bar */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <SmallAvatar initials={post.initials} />
                <div>
                  <p className="text-sm font-bold text-ink uppercase">{post.author}</p>
                  <p className="text-xs text-ink-muted font-light">{post.role}</p>
                </div>
              </div>

              <div className="font-mono text-xs text-ink-muted">
                <span>{post.time}</span>
                <span className="mx-2">//</span>
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Post Content Body */}
            <div className="space-y-5 text-sm sm:text-base font-light leading-relaxed text-ink-muted">
              {post.body.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}

              {post.quote && (
                <blockquote className="border-l-2 border-action bg-surface p-6 font-mono text-xs sm:text-sm text-ink italic leading-relaxed">
                  &ldquo;{post.quote}&rdquo;
                </blockquote>
              )}
            </div>

            {/* Post Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 border-y border-line py-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border transition cursor-pointer ${
                  liked
                    ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold"
                    : "border-line bg-surface text-ink-muted hover:text-red-500 hover:border-red-500/40"
                }`}
              >
                <Heart className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} aria-hidden />
                <span>{post.likes + (liked ? 1 : 0)} Likes</span>
              </button>

              <button
                type="button"
                onClick={() => setSaved((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border transition cursor-pointer ${
                  saved
                    ? "border-action bg-action/10 text-action font-bold"
                    : "border-line bg-surface text-ink-muted hover:text-action hover:border-action/40"
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} aria-hidden />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-line bg-surface text-ink-muted hover:text-action hover:border-action/40 transition cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                <span>{shared ? "Link Copied" : "Share"}</span>
              </button>

              <span className="ml-auto text-ink-muted hidden sm:inline">
                {post.views.toLocaleString()} reads
              </span>
            </div>

            {/* Replies Section */}
            <section id="replies" className="pt-8 space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-xl font-bold uppercase tracking-tight text-ink">
                  Discussion ({post.replies} Replies)
                </h3>
                <MessageCircle className="h-4 w-4 text-action" />
              </div>

              <div className="space-y-4">
                {replies.map((reply, idx) => (
                  <div key={idx} className="border border-line bg-surface p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <SmallAvatar initials={reply.initials} />
                        <div>
                          <p className="text-xs font-bold uppercase text-ink">{reply.name}</p>
                          <p className="text-[11px] text-ink-muted font-light">{reply.role}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-ink-muted">{reply.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-muted font-light leading-relaxed pt-1">
                      {reply.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form
                className="border border-line bg-surface p-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (comment.trim()) {
                    setCommentSent(true);
                    setComment("");
                  }
                }}
              >
                <label htmlFor="reply-text" className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-action">
                  Add to Technical Thread
                </label>
                <textarea
                  id="reply-text"
                  value={comment}
                  onChange={(e) => {
                    setCommentSent(false);
                    setComment(e.target.value)}
                  }
                  rows={3}
                  placeholder="Share a code snippet, architectural perspective, or solution..."
                  className="w-full border border-line bg-card p-3 text-xs sm:text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-action"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-ink-muted">
                    {commentSent && <span className="text-emerald-600 dark:text-emerald-400 font-bold">Reply submitted for review!</span>}
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-action px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-on-action hover:bg-action-strong transition cursor-pointer"
                  >
                    <span>Post Reply</span>
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </section>
          </article>

          {/* Right Column / Related Discussions */}
          <aside className="space-y-8">
            <div className="border border-line bg-surface p-6 space-y-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-action block">
                Thread Metrics
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-ink-muted">Category</span>
                  <span className="font-bold text-ink uppercase">{post.category}</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-ink-muted">Read Time</span>
                  <span className="text-ink">{post.readTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-muted">Total Reads</span>
                  <span className="text-ink">{post.views.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border border-line bg-surface p-6 space-y-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-action block">
                Related Discussions
              </span>
              <div className="space-y-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/community/${item.slug}`}
                    className="block p-3 border border-line bg-card hover:border-action/40 transition group"
                  >
                    <p className="text-xs font-bold uppercase text-ink group-hover:text-action transition-colors line-clamp-2">
                      {item.title}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-action uppercase tracking-wider">
                      <span>Inspect Thread</span>
                      <ArrowRight size={10} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

