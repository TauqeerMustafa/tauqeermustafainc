import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { communityGuidelines } from "@/data/community";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Community Guidelines | TMI Community",
  description: "The principles that keep the TMI community useful, generous, and safe for everyone.",
  path: "/community/guidelines",
});

const checklist = ["Lead with context", "Credit the people and sources behind your work", "Use descriptive titles and relevant tags", "Keep sensitive information out of public threads", "Report issues privately so they can be handled with care"];

export default function CommunityGuidelinesPage() {
  return (
    <main className="bg-black text-white">
      <div className="m-stripe" aria-hidden="true" />
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-20 lg:px-12">
        <Link href="/community" className="inline-flex min-h-11 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#bbbbbb] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to community</Link>
        <div className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-24"><div><div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#bbbbbb]"><span className="h-px w-8 bg-[#1c69d4]" /> Community handbook</div><h1 className="mt-6 max-w-4xl text-[clamp(3rem,8vw,6.5rem)] font-bold uppercase leading-[0.94] tracking-[-0.04em] text-white">Keep the room<br /><span className="text-[#8fc1ff]">worth returning to.</span></h1><p className="mt-8 max-w-2xl text-base font-light leading-7 text-[#bbbbbb] sm:text-lg">The TMI community is built for thoughtful exchange. These guidelines are simple by design: they give good conversations the conditions to become great ones.</p><div className="mt-12 border-t border-[#3c3c3c]">{communityGuidelines.map((item) => <section key={item.number} className="grid gap-5 border-b border-[#3c3c3c] py-7 sm:grid-cols-[64px_minmax(0,1fr)]"><span className="font-mono text-xs font-bold text-[#1c69d4]">{item.number}</span><div><h2 className="text-2xl font-bold uppercase tracking-[-0.02em] text-white">{item.title}</h2><p className="mt-3 max-w-xl text-sm font-light leading-7 text-[#bbbbbb]">{item.body}</p></div></section>)}</div></div><aside className="space-y-8 lg:pt-20"><div className="border border-[#3c3c3c] bg-[#1a1a1a] p-6"><ShieldCheck className="h-5 w-5 text-[#8fc1ff]" aria-hidden /><p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">A quick check</p><ul className="mt-5 space-y-4">{checklist.map((item) => <li key={item} className="flex gap-3 text-xs font-light leading-5 text-[#bbbbbb]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0fa336]" aria-hidden />{item}</li>)}</ul></div><div className="border-t border-[#3c3c3c] pt-6"><p className="text-sm font-light leading-7 text-[#bbbbbb]">Need to flag something? Start with a private note through our <Link href="/contact" className="font-semibold text-white underline decoration-[#1c69d4] decoration-2 underline-offset-4">contact page</Link>. We review every report with care.</p></div></aside></div>
        <div className="mt-20 border border-[#3c3c3c] bg-[#1a1a1a] p-7 sm:p-10"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#8fc1ff]">Ready when you are</p><div className="mt-4 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between"><p className="max-w-2xl text-2xl font-bold uppercase leading-tight tracking-[-0.03em] text-white">Bring a question, a work-in-progress, or a lesson you learned the hard way.</p><Link href="/community" className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-white px-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore conversations <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></div>
      </div>
    </main>
  );
}
