import Link from "next/link";

import { PageHero, Section } from "@/components/home/ui";

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Login"
        title="Access your client workspace."
        description="Sign in to access project updates, deliverables, and communication with your engagement team."
      />

      <Section className="bg-[#F8FAFC]" labelledBy="login-title">
        <div className="mx-auto max-w-md rounded-none border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <h2 id="login-title" className="text-2xl font-semibold tracking-tight text-[#0A1628]">
            Sign in
          </h2>
          <form className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-[#0A1628]">
              Email
              <input
                type="email"
                autoComplete="email"
                className="rounded-none border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#0A1628]">
              Password
              <input
                type="password"
                autoComplete="current-password"
                className="rounded-none border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0B5FFF] focus:ring-2 focus:ring-[#0B5FFF]/20"
                placeholder="Password"
              />
            </label>
            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-medium text-[#374151]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#E5E7EB] accent-[#0A1628]"
                />
                Remember me
              </label>
              <Link
                href="/login"
                className="font-semibold text-[#0A1628] transition hover:text-[#0A46A8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="button"
              className="rounded-none bg-[#0A1628] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1F2937] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5FFF]"
            >
              Sign in
            </button>
          </form>
        </div>
      </Section>
    </>
  );
}
