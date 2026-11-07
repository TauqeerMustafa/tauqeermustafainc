import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "./Section";

export default function CTA() {
  return (
    <Section className="bg-zinc-50 border-t border-zinc-200">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Start a conversation
        </h2>
        <p className="mt-6 text-lg leading-8 text-zinc-600">
          Have a project in mind or need advice on a technical challenge? We&apos;re
          ready to listen and explore how we can help your organization
          succeed.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Explore Services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
