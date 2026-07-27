import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Section } from "./ui";

export default function CTA() {
  return (
    <Section className="bg-[linear-gradient(180deg,#F8F9FB_0%,#FFFFFF_100%)]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#E4E4DE] bg-white p-8 text-center shadow-[0_22px_70px_rgba(17,24,39,0.09)] sm:p-12">
        <h2 className="text-balance text-3xl font-semibold tracking-normal text-zinc-900 sm:text-4xl">
          Start a conversation
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-zinc-600">
          Have a project in mind or need advice on a technical challenge? We are
          ready to listen and explore how we can help your organization
          succeed.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="min-h-12 px-6">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
