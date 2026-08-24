"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  communityGuidelines,
  communityMembers,
  communityPosts,
  communityStats,
  communityTopics,
  type CommunityPost,
} from "@/data/community";

const avatarColors = ["bg-[#1c69d4]", "bg-[#0066b1]", "bg-[#e22718]", "bg-[#1a2129]"];

function Avatar({ initials, index = 0, size = "md" }: { initials: string; index?: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-[11px]", lg: "h-12 w-12 text-xs" };
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-white ${avatarColors[index % avatarColors.length]} ${sizes[size]}`} aria-hidden="true">
      {initials}
    </span>
  );
}

function PostCard({ post, index, onLike }: { post: CommunityPost; index: number; onLike: (slug: string) => void }) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <article className="group border-b border-[#e2ded9] py-7 first:pt-2 last:border-b-0">
      <div className="flex items-start gap-3.5">
        <Avatar initials={post.initials} index={index} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-[#141413]">{post.author}</span>
            <span className="text-[#9a9a96]">·</span>
            <span className="text-[#6a6a6a]">{post.role}</span>
            <span className="text-[#9a9a96]">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a6a6a]">{post.time}</span>
          </div>

          <Link href={`/community/${post.slug}`} className="mt-2 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1c69d4]">
            <h3 className="max-w-2xl text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#141413] transition-colors group-hover:text-[#1c69d4] sm:text-[21px]">{post.title}</h3>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#5a5a5a]">{post.excerpt}</p>
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="border border-[#d8d4d1] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#5a5a5a]">{post.category}</span>
            {post.solved ? (
              <span className="inline-flex items-center gap-1 border border-[#b9d5c2] bg-[#f2f8f3] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-[#26733b]"><CheckCircle2 className="h-3 w-3" aria-hidden />Solved</span>
            ) : null}
            {post.tags.slice(0, 2).map((tag) => <span key={tag} className="text-[12px] text-[#8a8986]">#{tag}</span>)}
          </div>

          <div className="mt-5 flex items-center gap-1 text-[#6a6a6a]">
            <button type="button" onClick={() => onLike(post.slug)} aria-label={`Like ${post.title}`} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-[12px] transition-colors hover:text-[#e22718] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]"><Heart className="h-4 w-4" aria-hidden />{post.likes}</button>
            <Link href={`/community/${post.slug}#replies`} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-[12px] transition-colors hover:text-[#1c69d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]"><MessageCircle className="h-4 w-4" aria-hidden />{post.replies}</Link>
            <button type="button" onClick={() => setSaved((value) => !value)} aria-label={saved ? `Remove ${post.title} from saved posts` : `Save ${post.title}`} className={`inline-flex min-h-10 items-center gap-1.5 px-2 text-[12px] transition-colors hover:text-[#1c69d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] ${saved ? "text-[#1c69d4]" : ""}`}><Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden /></button>
            <button type="button" onClick={() => setShared((value) => !value)} aria-label={`Share ${post.title}`} className={`inline-flex min-h-10 items-center gap-1.5 px-2 text-[12px] transition-colors hover:text-[#1c69d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] ${shared ? "text-[#1c69d4]" : ""}`}><Share2 className="h-4 w-4" aria-hidden />{shared ? "Copied" : ""}</button>
            <span className="ml-auto hidden font-mono text-[10px] text-[#9a9a96] sm:inline">{post.views.toLocaleString()} reads</span>
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#141413]/45 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="composer-title">
      <div className="w-full max-w-2xl border border-[#d8d4d1] bg-[#fcfbfa] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">Start a conversation</p><h2 id="composer-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#141413]">What are you working through?</h2></div>
          <button type="button" onClick={onClose} aria-label="Close composer" className="inline-flex h-10 w-10 items-center justify-center border border-[#d8d4d1] text-[#5a5a5a] transition hover:border-[#141413] hover:text-[#141413] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        {posted ? (
          <div className="mt-8 border border-[#b9d5c2] bg-[#f2f8f3] p-5 text-sm leading-6 text-[#26733b]"><CheckCircle2 className="mb-2 h-5 w-5" aria-hidden /><p className="font-semibold">Your draft is ready for review.</p><p className="mt-1">In the live community, this is where moderation and publishing would take over.</p><button type="button" onClick={onClose} className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] underline underline-offset-4">Return to community</button></div>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); if (title.trim() && body.trim()) setPosted(true); }}>
            <div><label htmlFor="post-title" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a5a5a]">Title</label><input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your idea a clear headline" className="w-full border border-[#d8d4d1] bg-white px-4 py-3 text-sm text-[#141413] outline-none transition placeholder:text-[#9a9a96] focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/15" required /></div>
            <div><label htmlFor="post-body" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a5a5a]">Your perspective</label><textarea id="post-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Share the context, what you tried, and where the community can help..." rows={6} className="w-full resize-y border border-[#d8d4d1] bg-white px-4 py-3 text-sm leading-6 text-[#141413] outline-none transition placeholder:text-[#9a9a96] focus:border-[#1c69d4] focus:ring-2 focus:ring-[#1c69d4]/15" required /></div>
            <div className="flex flex-col-reverse gap-3 border-t border-[#e2ded9] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#6a6a6a]">Be specific, be generous, and protect confidential information.</p><button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#1c69d4] px-5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#0066b1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]">Publish draft <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button></div>
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

  const filteredPosts = useMemo(() => communityPosts.filter((post) => {
    const matchesTopic = activeTopic === "All conversations" || post.category === activeTopic;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [post.title, post.excerpt, post.author, ...post.tags].join(" ").toLowerCase().includes(normalizedQuery);
    return matchesTopic && matchesQuery;
  }), [activeTopic, query]);

  const toggleLike = (slug: string) => setLiked((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);

  return (
    <>
      <main className="bg-[#f3f0ee] text-[#141413]">
        <section className="relative overflow-hidden border-b border-[#e2ded9] bg-[#1a2129] text-white">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
            <div className="max-w-3xl"><div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#8fc1ff]"><span className="h-px w-8 bg-[#1c69d4]" /> TMI community</div><h1 className="mt-6 max-w-3xl text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.065em]">Build in the open.<br /><span className="text-[#8fc1ff]">Learn together.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">A thoughtful space for people shaping products, strengthening systems, and sharing the decisions behind the work.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => setComposerOpen(true)} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#1c69d4] px-6 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#0066b1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fc1ff]"><Plus className="h-4 w-4" aria-hidden /> Start a conversation</button><Link href="/community/guidelines" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 px-6 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/75 transition hover:border-white/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fc1ff]">Read the guidelines <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></div>
            <div className="mt-14 grid max-w-2xl grid-cols-3 gap-5 border-t border-white/15 pt-6 sm:mt-20 sm:gap-10">{communityStats.map((stat) => <div key={stat.label}><p className="font-mono text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">{stat.value}</p><p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-white/45">{stat.label}</p></div>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-20">
            <div>
              <div className="flex flex-col gap-5 border-b border-[#e2ded9] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">The latest</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Conversations worth your time.</h2></div><Link href="/community/members" className="inline-flex items-center gap-2 text-xs font-semibold text-[#1c69d4] transition hover:text-[#0066b1]">Meet the members <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Community topics">{communityTopics.map((topic) => <button type="button" key={topic.name} onClick={() => setActiveTopic(topic.name)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 border px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4] ${activeTopic === topic.name ? "border-[#141413] bg-[#141413] text-white" : "border-[#d8d4d1] bg-transparent text-[#6a6a6a] hover:border-[#141413] hover:text-[#141413]"}`}>{topic.name}<span className={activeTopic === topic.name ? "text-white/50" : "text-[#9a9a96]"}>{topic.count}</span></button>)}</div>
              <label className="mt-3 flex h-11 items-center gap-3 border border-[#d8d4d1] bg-[#fcfbfa] px-3 text-[#6a6a6a] focus-within:border-[#1c69d4] focus-within:ring-2 focus-within:ring-[#1c69d4]/10"><Search className="h-4 w-4 shrink-0" aria-hidden /><span className="sr-only">Search conversations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations, topics, or people" className="min-w-0 flex-1 bg-transparent text-sm text-[#141413] outline-none placeholder:text-[#9a9a96]" /></label>
              <div className="mt-7">{filteredPosts.length > 0 ? filteredPosts.map((post, index) => <PostCard key={post.slug} post={{ ...post, likes: post.likes + (liked.includes(post.slug) ? 1 : 0) }} index={index} onLike={toggleLike} />) : <div className="border border-dashed border-[#d8d4d1] p-10 text-center"><Search className="mx-auto h-6 w-6 text-[#9a9a96]" aria-hidden /><p className="mt-3 font-semibold">No conversations found</p><p className="mt-1 text-sm text-[#6a6a6a]">Try another topic or a shorter search.</p></div>}</div>
            </div>

            <aside className="space-y-8">
              <div className="border border-[#d8d4d1] bg-[#fcfbfa] p-5"><div className="flex items-center justify-between"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">Community pulse</p><Sparkles className="h-4 w-4 text-[#e22718]" aria-hidden /></div><div className="mt-5 space-y-4">{[{ label: "Most discussed", value: "AI & automation", detail: "+18% this week" }, { label: "Fastest growing", value: "Build in public", detail: "+12 new members" }, { label: "Next office hours", value: "Thursday, 18:00 UTC", detail: "Bring a hard question" }].map((item) => <div key={item.label} className="border-t border-[#e2ded9] pt-3"><p className="text-[11px] uppercase tracking-[0.08em] text-[#8a8986]">{item.label}</p><p className="mt-1 text-sm font-semibold text-[#141413]">{item.value}</p><p className="mt-1 text-xs text-[#6a6a6a]">{item.detail}</p></div>)}</div></div>
              <div><div className="flex items-center justify-between"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">People to know</p><Users className="h-4 w-4 text-[#6a6a6a]" aria-hidden /></div><div className="mt-4 space-y-3">{communityMembers.slice(0, 4).map((member, index) => <Link href="/community/members" key={member.name} className="flex items-center gap-3 rounded-sm p-1 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]"><Avatar initials={member.initials} index={index} size="sm" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{member.name}</span><span className="block truncate text-xs text-[#6a6a6a]">{member.specialty}</span></span></Link>)}</div><Link href="/community/members" className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#1c69d4]">View all members <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
              <div className="border-t border-[#e2ded9] pt-6"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">A good community is</p><ul className="mt-4 space-y-3">{communityGuidelines.slice(0, 3).map((item) => <li key={item.number} className="flex gap-3 text-sm leading-6 text-[#5a5a5a]"><span className="font-mono text-[10px] font-bold text-[#141413]">{item.number}</span><span>{item.title}</span></li>)}</ul><Link href="/community/guidelines" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#141413] underline decoration-[#1c69d4] decoration-2 underline-offset-4">Read all guidelines <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
            </aside>
          </div>
        </section>

        <section className="border-t border-[#e2ded9] bg-[#fcfbfa]"><div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">Not just a feed</p><p className="mt-2 max-w-xl text-lg font-semibold tracking-[-0.02em]">Come for the answer. Stay for the people who help you think better.</p></div><Link href="/contact" className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#1c69d4] transition hover:text-[#0066b1]">Work with TMI <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></section>
      </main>
      {composerOpen ? <Composer onClose={() => setComposerOpen(false)} /> : null}
    </>
  );
}
