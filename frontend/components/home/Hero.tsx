import { BarChart3, CheckCircle2, ShieldCheck } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/home/ui";

const capabilities = [
  "Secure web platforms",
  "AI automation",
  "Enterprise delivery",
];

const readiness = [
  ["Architecture", "Cloud-ready platform blueprint", "96%"],
  ["Security", "Risk controls and hardening", "99%"],
  ["Automation", "Workflow intelligence coverage", "88%"],
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
      <div className="absolute inset-x-0 top-0 h-px bg-[#C9A227]" aria-hidden="true" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/45 bg-white px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#C9A227]" aria-hidden="true" />
            Enterprise digital engineering partner
          </span>

          <h1 className="mt-8 max-w-5xl text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
            Secure, scalable digital products for ambitious enterprises.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]">
            Tauqeer Mustafa Inc. designs and builds high-performance web
            platforms, cybersecurity programs, and AI automation systems that
            help modern organizations operate with confidence.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/contact">Start a Project</PrimaryButton>
            <SecondaryButton href="/services">Explore Services</SecondaryButton>
          </div>

          <dl className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
            {capabilities.map((item) => (
              <div key={item} className="border-l border-[#C9A227] pl-4">
                <dt className="text-sm font-semibold text-[#111827]">{item}</dt>
                <dd className="mt-1 text-sm text-[#6B7280]">
                  Built for production teams
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-5 shadow-xl shadow-gray-200/60 sm:p-6"
          aria-label="Enterprise delivery metrics"
        >
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
              <div>
                <p className="text-sm text-[#6B7280]">Delivery Command Center</p>
                <p className="mt-1 text-2xl font-semibold text-[#111827]">
                  Live Readiness
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Operational
              </span>
            </div>

            <div className="mt-6 grid gap-5">
              {readiness.map(([label, description, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-[#111827]">{label}</p>
                      <p className="mt-1 text-[#6B7280]">{description}</p>
                    </div>
                    <span className="font-semibold text-[#C9A227]">{value}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-[#C9A227]"
                      style={{ width: value }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <BarChart3 className="h-5 w-5 text-[#C9A227]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#111827]">
                Measured delivery
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">Roadmaps tied to outcomes</p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
              <ShieldCheck className="h-5 w-5 text-[#C9A227]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[#111827]">
                Secure defaults
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">Controls from day one</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
