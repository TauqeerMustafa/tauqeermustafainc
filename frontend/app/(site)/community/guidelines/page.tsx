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
    <main className="bg-[#f3f0ee] text-[#141413]">
      <div className="mx-auto max-w-[1000px] px-5 py-10 sm:px-6 sm:py-16">
        <Link href="/community" className="inline-flex min-h-10 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#6a6a6a] transition hover:text-[#1c69d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1c69d4]"><ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to community</Link>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-20"><div><div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#1c69d4]"><span className="h-px w-8 bg-[#1c69d4]" /> Community handbook</div><h1 className="mt-5 text-[clamp(2.7rem,7vw,5.3rem)] font-semibold leading-[0.95] tracking-[-0.07em]">Keep the room<br /><span className="text-[#1c69d4]">worth returning to.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-[#5a5a5a] sm:text-lg">The TMI community is built for thoughtful exchange. These guidelines are simple by design: they give good conversations the conditions to become great ones.</p><div className="mt-10 space-y-0 border-t border-[#d8d4d1]">{communityGuidelines.map((item) => <section key={item.number} className="grid gap-4 border-b border-[#d8d4d1] py-6 sm:grid-cols-[60px_minmax(0,1fr)]"><span className="font-mono text-xs font-bold text-[#1c69d4]">{item.number}</span><div><h2 className="text-xl font-semibold tracking-[-0.02em]">{item.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#5a5a5a]">{item.body}</p></div></section>)}</div></div><aside className="space-y-6 lg:pt-16"><div className="border border-[#d8d4d1] bg-[#fcfbfa] p-5"><ShieldCheck className="h-5 w-5 text-[#1c69d4]" aria-hidden /><p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1c69d4]">A quick check</p><ul className="mt-4 space-y-3">{checklist.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-[#5a5a5a]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#26733b]" aria-hidden />{item}</li>)}</ul></div><div className="border-t border-[#d8d4d1] pt-5"><p className="text-sm leading-6 text-[#5a5a5a]">Need to flag something? Start with a private note through our <Link href="/contact" className="font-semibold text-[#1c69d4] underline decoration-1 underline-offset-4">contact page</Link>. We review every report.</p></div></aside></div>
        <div className="mt-16 border border-[#d8d4d1] bg-[#1a2129] p-6 text-white sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#8fc1ff]">Ready when you are</p><div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><p className="max-w-xl text-2xl font-semibold leading-tight tracking-[-0.03em]">Bring a question, a work-in-progress, or a lesson you learned the hard way.</p><Link href="/community" className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#8fc1ff]">Explore conversations <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link></div></div>
      </div>
    </main>
  );
}
