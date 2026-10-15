import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Briefcase } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Management Governance Transferred",
  description: "Management and governance transferred to Qorlune LLC. Inquiries directed to contact@qorlune.com.",
  path: "/management/login",
  noIndex: true,
});

export default function ManagementLoginPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="mx-auto w-full max-w-lg flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft size={14} />
          <span>Return Home</span>
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-widest text-action font-bold">
          Qorlune LLC
        </span>
      </div>

      {/* Center Notice Card */}
      <div className="mx-auto w-full max-w-lg border border-line bg-surface p-8 sm:p-10 shadow-xl rounded-xl">
        {/* Top 3-Color Stripe */}
        <div className="flex h-1 w-full -mt-8 -mx-8 sm:-mt-10 sm:-mx-10 mb-8 rounded-t-xl overflow-hidden" aria-hidden="true">
          <div className="w-1/3 bg-[#0066b1]" />
          <div className="w-1/3 bg-[#1c69d4]" />
          <div className="w-1/3 bg-[#e22718]" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-12 w-12 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-ink">
              Governance Transferred
            </h1>
            <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
              Executive Handover Complete
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-ink-muted border-t border-line pt-6">
          <p>
            Management and executive oversight of all business units, client contracts, and technology operations have officially transferred to <strong>Qorlune LLC</strong>.
          </p>
          <p>
            Authorized clients may continue to access their active deliverables, telemetry, and project boards via the <strong>Client Workspace</strong>.
          </p>
          <p className="text-xs">
            For executive inquiries or corporate matters, contact: <a href="mailto:contact@qorlune.com" className="text-action underline">contact@qorlune.com</a>.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row gap-3">
          <Link
            href="/client/login"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-action px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-on-action transition hover:bg-action-strong"
          >
            <Briefcase size={14} />
            <span>Client Workspace</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-line bg-card px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink transition hover:border-action"
          >
            <span>Qorlune Home</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-lg text-center pt-8 text-xs font-mono text-ink-muted">
        &copy; {new Date().getFullYear()} Qorlune LLC. All rights reserved.
      </div>
    </div>
  );
}
