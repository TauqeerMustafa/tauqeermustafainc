import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "./ui/Section";

export default function Hero() {
  return (
    <Section className="bg-white pt-32 pb-24 text-center sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl lg:text-7xl">
          A technology partner for the enterprise.
        </h1>
        <p className="mt-8 text-xl text-zinc-600">
          We help organizations build, modernize, and maintain secure,
          scalable, and intelligent software systems that drive measurable
          business growth.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/contact">Start a Conversation</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/work">View Our Work</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}