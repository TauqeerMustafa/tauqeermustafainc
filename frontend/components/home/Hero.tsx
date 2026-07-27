import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "./ui";

export default function Hero() {
  return (
    <Section
      className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#F7E8B7_0%,rgba(247,232,183,0.22)_28%,rgba(255,255,255,0)_56%),linear-gradient(180deg,#FFFFFF_0%,#F8F9FB_100%)] pt-28 pb-20 text-center sm:pt-36 sm:pb-28 lg:pt-40"
      containerClassName="relative"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mx-auto inline-flex rounded-full border border-[#E4E4DE] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6500] shadow-sm backdrop-blur">
          Enterprise software, security, cloud, and AI
        </p>
        <h1 className="mt-8 text-balance text-5xl font-semibold tracking-normal text-zinc-950 sm:text-6xl lg:text-7xl">
          Technology systems built for serious business outcomes.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-pretty text-lg leading-8 text-zinc-600 sm:text-xl">
          We help organizations build, modernize, and maintain secure,
          scalable, and intelligent software systems that drive measurable
          business growth.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-h-12 px-6">
            <Link href="/contact">Start a Conversation</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="min-h-12 px-6 bg-white/70">
            <Link href="/portfolio">View Our Work</Link>
          </Button>
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-3 sm:grid-cols-3">
          {["Architecture clarity", "Secure defaults", "Production ownership"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#E4E4DE] bg-white/75 px-5 py-4 text-sm font-semibold text-zinc-800 shadow-[0_12px_34px_rgba(17,24,39,0.05)] backdrop-blur"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
