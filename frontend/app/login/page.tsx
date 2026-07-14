import Link from "next/link";

import { PageHero, Section } from "@/components/home/ui";

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Login"
        title="Access your client workspace."
        description="Sign in UI for future client portal access. Authentication will be connected in a later milestone."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="login-title">
        <div className="mx-auto max-w-md rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <h2 id="login-title" className="text-2xl font-semibold tracking-tight text-[#111827]">
            Sign in
          </h2>
          <form className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Email
              <input
                type="email"
                autoComplete="email"
                className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                placeholder="Password"
              />
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-medium text-[#374151]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#E5E7EB] accent-[#111827]"
                />
                Remember me
              </label>
              <Link
                href="/login"
                className="font-semibold text-[#111827] transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="button"
              className="rounded-lg bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F2937] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
            >
              Sign in
            </button>
          </form>
        </div>
      </Section>
    </>
  );
}
