import Link from "next/link";

import { Section } from "@/components/home/ui";

export default function CTA() {
  return (
    <Section className="bg-zinc-50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900 sm:text-4xl">
          Start a conversation
        </h2>
        <p className="mt-6 text-lg leading-8 text-zinc-600">
          Have a project in mind or need advice on a technical challenge? We're
          ready to listen and explore how we can help your organization
          succeed.
        </p>
        <div className="mt-10">
          <Link
            href="/contact"
            className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </Section>
  );
}