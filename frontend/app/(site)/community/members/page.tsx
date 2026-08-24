import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, Search, Users } from "lucide-react";
import { communityMembers } from "@/data/community";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Members | TMI Community",
  description: "Meet the builders, designers, security practitioners, and leaders making up the TMI community.",
  path: "/community/members",
});

export default function CommunityMembersPage() {
  return (
    <main className="bg-[#f3f0ee] text-[#141413]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-6 sm:py-16">
        <Link href="/community" className="inline-flex min-h-10 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#6a6a6a] transition hover:text-[#1c69d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1c69d4]"><ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to community</Link>
        <div className="mt-12 max-w-3xl"><div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#1c69d4]"><span className="h-px w-8 bg-[#1c69d4]" /> The people behind the posts</div><h1 className="mt-5 text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.07em]">Meet the<br /><span className="text-[#1c69d4]">community.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-[#5a5a5a] sm:text-lg">Different disciplines. Different time zones. The same curiosity about making useful things with care.</p></div>
        <div className="mt-12 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label className="flex h-12 items-center gap-3 border border-[#d8d4d1] bg-[#fcfbfa] px-4 text-[#6a6a6a] focus-within:border-[#1c69d4] focus-within:ring-2 focus-within:ring-[#1c69d4]/10"><Search className="h-4 w-4" aria-hidden /><span className="sr-only">Search members</span><input placeholder="Search by name, role, or specialty" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9a9a96]" /></label><button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#d8d4d1] px-5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#5a5a5a] transition hover:border-[#141413] hover:text-[#141413] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c69d4]"><Users className="h-4 w-4" aria-hidden /> All specialties</button></div>
        <div className="mt-10 grid gap-px border border-[#d8d4d1] bg-[#d8d4d1] sm:grid-cols-2 lg:grid-cols-3">{communityMembers.map((member) => <article key={member.name} className="bg-[#fcfbfa] p-5 transition hover:bg-white sm:p-6"><div className="flex items-start justify-between"><span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2129] font-mono text-sm font-bold text-white">{member.initials}</span><span className="h-2.5 w-2.5 rounded-full bg-[#38a169]" title="Active this week" /></div><h2 className="mt-6 text-lg font-semibold tracking-[-0.02em]">{member.name}</h2><p className="mt-1 text-sm text-[#5a5a5a]">{member.role}</p><div className="mt-5 space-y-2 border-t border-[#e2ded9] pt-4 text-xs text-[#6a6a6a]"><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#1c69d4]" aria-hidden />{member.location}</p><p className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-[#1c69d4]" aria-hidden />{member.specialty}</p></div><div className="mt-5 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#9a9a96]">{member.contribution}</span><Link href="/community" className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#1c69d4] transition hover:text-[#0066b1]">View posts <ArrowRight className="h-3 w-3" aria-hidden /></Link></div></article>)}</div>
        <div className="mt-12 border border-[#d8d4d1] bg-[#1a2129] p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#8fc1ff]">Your perspective belongs here</p><p className="mt-2 max-w-xl text-lg font-semibold tracking-[-0.02em]">The best communities are shaped by people who are willing to share the unfinished version.</p></div><Link href="/community" className="mt-5 inline-flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#8fc1ff] sm:mt-0">Join the conversation <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div>
      </div>
    </main>
  );
}
