import Link from "next/link";

import { Section } from "@/components/home/ui";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <Section className="bg-zinc-50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900 sm:text-4xl">
          Ready to build with clarity?
        </h2>
        <p className="mt-6 text-lg leading-8 text-zinc-600">
          Start a conversation to see how our approach to technology delivery
          can help your organization move forward with confidence.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link href="/contact">Start a Conversation</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}