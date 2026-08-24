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

const avatarColors = ["bg-[#1c69d4]", "bg-[#0066b1]", "bg-[#e22718]", "bg-[#2b2b2b]"];

function Avatar({ initials, index = 0, size = "md" }: { initials: string; index?: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-[11px]", lg: "h-12 w-12 text-xs" };
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-white ${avatarColors[index % avatarColors.length]} ${sizes[size]}`} aria-hidden="true">{initials}</span>;
}

function PostCard({ post, index, onLike }: { post: CommunityPost; index: number; onLike: (slug: string) => void }) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  return (
    <article className="border-t border-[#3c3c3c] py-7 first:pt-6 last:border-b">
      <div className="flex items-start gap-4">
        <Avatar initials={post.initials} index={index} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-semibold text-white">{post.author}</span>
            <span className="text-[#7e7e7e]">/</span>
            <span className="text-[#bbbbbb]">{post.role}</span>
            <span className="text-[#7e7e7e]">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#7e7e7e]">{post.time}</span>
          </div>
          <Link href={`/community/${post.slug}`} className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <h3 className="max-w-2xl text-xl font-bold uppercase leading-[1.15] tracking-[-0.02em] text-white transition-colors group-hover:text-[#8fc1ff] sm:text-2xl">{post.title}</h3>
            <p className="mt-3 max-w-2xl text-sm font-light leading-6 text-[#bbbbbb]">{post.excerpt}</p>
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="border border-[#3c3c3c] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#bbbbbb]">{post.category}</span>
            {post.solved ? <span className="inline-flex items-center gap-1 border border-[#0fa336] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#0fa336]"><CheckCircle2 className="h-3 w-3" aria-hidden /> Solved</span> : null}
            {post.tags.slice(0, 2).map((tag) => <span key={tag} className="font-mono text-[10px] text-[#7e7e7e]">#{tag}</span>)}
          </div>
          <div className="mt-5 flex items-center gap-1 text-[#7e7e7e]">
            <button type="button" onClick={() => onLike(post.slug)} aria-label={`Like ${post.title}`} className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs transition-colors hover:text-[#e22718] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Heart className="h-4 w-4" aria-hidden />{post.likes}</button>
            <Link href={`/community/${post.slug}#replies`} className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><MessageCircle className="h-4 w-4" aria-hidden />{post.replies}</Link>
            <button type="button" onClick={() => setSaved((value) => !value)} aria-label={saved ? `Remove ${post.title} from saved posts` : `Save ${post.title}`} className={`inline-flex min-h-11 items-center gap-1.5 px-2 text-xs transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${saved ? "text-[#8fc1ff]" : ""}`}><Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden /></button>
            <button type="button" onClick={() => setShared((value) => !value)} aria-label={`Share ${post.title}`} className={`inline-flex min-h-11 items-center gap-1.5 px-2 text-xs transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${shared ? "text-[#8fc1ff]" : ""}`}><Share2 className="h-4 w-4" aria-hidden />{shared ? "Copied" : ""}</button>
            <span className="ml-auto hidden font-mono text-[10px] text-[#7e7e7e] sm:inline">{post.views.toLocaleString()} READS</span>
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="composer-title">
      <div className="w-full max-w-2xl border border-[#3c3c3c] bg-[#1a1a1a] p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">Start a conversation</p><h2 id="composer-title" className="mt-3 text-2xl font-bold uppercase tracking-[-0.02em] text-white">What are you working through?</h2></div><button type="button" onClick={onClose} aria-label="Close composer" className="inline-flex h-11 w-11 items-center justify-center border border-[#3c3c3c] text-[#bbbbbb] transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X className="h-5 w-5" aria-hidden /></button></div>
        {posted ? <div className="mt-8 border border-[#0fa336] bg-[#0d0d0d] p-5 text-sm font-light leading-6 text-[#bbbbbb]"><CheckCircle2 className="mb-2 h-5 w-5 text-[#0fa336]" aria-hidden /><p className="font-semibold text-white">Your draft is ready for review.</p><p className="mt-1">In the live community, moderation and publishing would take over here.</p><button type="button" onClick={onClose} className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white underline underline-offset-4">Return to community</button></div> : <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); if (title.trim() && body.trim()) setPosted(true); }}><div><label htmlFor="post-title" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#bbbbbb]">Title</label><input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your idea a clear headline" className="h-12 w-full border border-[#3c3c3c] bg-[#0d0d0d] px-4 text-sm font-light text-white outline-none transition placeholder:text-[#7e7e7e] focus:border-white" required /></div><div><label htmlFor="post-body" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#bbbbbb]">Your perspective</label><textarea id="post-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Share the context, what you tried, and where the community can help..." rows={6} className="w-full resize-y border border-[#3c3c3c] bg-[#0d0d0d] px-4 py-3 text-sm font-light leading-6 text-white outline-none transition placeholder:text-[#7e7e7e] focus:border-white" required /></div><div className="flex flex-col-reverse gap-3 border-t border-[#3c3c3c] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-light leading-5 text-[#7e7e7e]">Be specific, be generous, and protect confidential information.</p><button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 border border-white bg-black px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Publish draft <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button></div></form>}
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
      <main className="bg-black text-white">
        <div className="m-stripe" aria-hidden="true" />
        <section className="border-b border-[#3c3c3c] bg-black">
          <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-20">
              <div><div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#bbbbbb]"><span className="h-px w-8 bg-[#1c69d4]" /> TMI Community</div><h1 className="mt-6 max-w-4xl text-[clamp(3rem,8vw,6.5rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em] text-white">Build in the open.<br /><span className="text-[#8fc1ff]">Learn together.</span></h1><p className="mt-8 max-w-xl text-base font-light leading-7 text-[#bbbbbb] sm:text-lg">A thoughtful space for people shaping products, strengthening systems, and sharing the decisions behind the work.</p><div className="mt-10 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => setComposerOpen(true)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white bg-black px-6 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Plus className="h-4 w-4" aria-hidden /> Start a conversation</button><Link href="/community/guidelines" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#3c3c3c] px-6 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#bbbbbb] transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Read the guidelines <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></div>
              <div className="border-t border-[#3c3c3c] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#7e7e7e]">Community signal</p><div className="mt-5 grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-6">{communityStats.map((stat) => <div key={stat.label} className="border-l-2 border-[#1c69d4] pl-3"><p className="font-mono text-xl font-bold text-white sm:text-2xl">{stat.value}</p><p className="mt-1 text-[10px] font-light uppercase tracking-[0.12em] text-[#7e7e7e]">{stat.label}</p></div>)}</div></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-24">
            <div><div className="flex flex-col gap-5 border-b border-[#3c3c3c] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">The latest</p><h2 className="mt-3 text-3xl font-bold uppercase leading-tight tracking-[-0.03em] text-white sm:text-4xl">Conversations worth your time.</h2></div><Link href="/community/members" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:text-[#8fc1ff]">Meet the members <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
              <div className="mt-5 flex gap-6 overflow-x-auto border-b border-[#3c3c3c] pb-1" aria-label="Community topics">{communityTopics.map((topic) => <button type="button" key={topic.name} onClick={() => setActiveTopic(topic.name)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-0 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${activeTopic === topic.name ? "border-white text-white" : "border-transparent text-[#7e7e7e] hover:text-white"}`}>{topic.name}<span className="text-[#7e7e7e]">{topic.count}</span></button>)}</div>
              <label className="mt-6 flex h-12 items-center gap-3 border border-[#3c3c3c] bg-[#1a1a1a] px-4 text-[#7e7e7e] focus-within:border-white"><Search className="h-4 w-4 shrink-0" aria-hidden /><span className="sr-only">Search conversations</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations, topics, or people" className="min-w-0 flex-1 bg-transparent text-sm font-light text-white outline-none placeholder:text-[#7e7e7e]" /></label>
              <div className="mt-7">{filteredPosts.length > 0 ? filteredPosts.map((post, index) => <PostCard key={post.slug} post={{ ...post, likes: post.likes + (liked.includes(post.slug) ? 1 : 0) }} index={index} onLike={toggleLike} />) : <div className="border border-dashed border-[#3c3c3c] p-10 text-center"><Search className="mx-auto h-6 w-6 text-[#7e7e7e]" aria-hidden /><p className="mt-3 font-semibold text-white">No conversations found</p><p className="mt-1 text-sm font-light text-[#bbbbbb]">Try another topic or a shorter search.</p></div>}</div>
            </div>
            <aside className="space-y-12">
              <div className="border border-[#3c3c3c] bg-[#1a1a1a] p-6"><div className="flex items-center justify-between"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">Community pulse</p><Sparkles className="h-4 w-4 text-[#e22718]" aria-hidden /></div><div className="mt-6 space-y-5">{[{ label: "Most discussed", value: "AI & automation", detail: "+18% this week" }, { label: "Fastest growing", value: "Build in public", detail: "+12 new members" }, { label: "Next office hours", value: "Thursday, 18:00 UTC", detail: "Bring a hard question" }].map((item) => <div key={item.label} className="border-t border-[#3c3c3c] pt-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7e7e7e]">{item.label}</p><p className="mt-2 text-sm font-semibold text-white">{item.value}</p><p className="mt-1 text-xs font-light text-[#bbbbbb]">{item.detail}</p></div>)}</div></div>
              <div><div className="flex items-center justify-between"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">People to know</p><Users className="h-4 w-4 text-[#7e7e7e]" aria-hidden /></div><div className="mt-5 space-y-4">{communityMembers.slice(0, 4).map((member, index) => <Link href="/community/members" key={member.name} className="flex items-center gap-3 border-b border-[#3c3c3c] pb-4 transition hover:text-[#8fc1ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Avatar initials={member.initials} index={index} size="sm" /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{member.name}</span><span className="block truncate text-xs font-light text-[#bbbbbb]">{member.specialty}</span></span></Link>)}</div><Link href="/community/members" className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white">View all members <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
              <div className="border-t border-[#3c3c3c] pt-6"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">A good community is</p><ul className="mt-5 space-y-4">{communityGuidelines.slice(0, 3).map((item) => <li key={item.number} className="flex gap-3 text-sm font-light leading-6 text-[#bbbbbb]"><span className="font-mono text-[10px] font-bold text-white">{item.number}</span><span>{item.title}</span></li>)}</ul><Link href="/community/guidelines" className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white">Read all guidelines <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
            </aside>
          </div>
        </section>

        <section className="border-t border-[#3c3c3c] bg-[#1a1a1a]"><div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-16 lg:px-12"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">Not just a feed</p><p className="mt-3 max-w-xl text-2xl font-bold uppercase leading-tight tracking-[-0.02em] text-white">Come for the answer. Stay for the people who help you think better.</p></div><Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center gap-2 border border-white px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Work with TMI <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></section>
      </main>
      {composerOpen ? <Composer onClose={() => setComposerOpen(false)} /> : null}
    </>
  );
}
