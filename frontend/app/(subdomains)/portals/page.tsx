import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, ShieldCheck, Users, type LucideIcon, CreditCard, LifeBuoy, Lock, CheckCircle2 } from "lucide-react";

import { PageHero, Section, Badge, BadgeMuted, MStripe } from "@/components/home/ui";

export const metadata = {
  title: "Portals & Workspaces | Qorlune",
  description: "Secure client workspace, administrative governance, and corporate portals for Qorlune.",
};

export default function PortalsPage() {
  return (
    <>
      <PageHero
        eyebrow="Identity & Access // Workspaces"
        title="Qorlune Workspaces & Client Portals"
        description="All active project deliverables, enterprise contracts, and client data have transitioned to Qorlune. Select your authorized workspace below."
      >
        <Badge>256-Bit SSL Encrypted</Badge>
        <BadgeMuted>Role-Based Access Control</BadgeMuted>
        <BadgeMuted>Client Data Preserved</BadgeMuted>
      </PageHero>

      <Section className="bg-canvas py-12 sm:py-16">
        {/* Active Client Spotlight */}
        <div className="mb-10">
          <div className="relative border-2 border-action bg-surface p-8 sm:p-10 shadow-lg">
            <span className="absolute -top-3 left-6 bg-action text-on-action font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              Primary Active Workspace
            </span>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center border border-action bg-action/10 text-action">
                    <Briefcase className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-ink">
                      Client Workspace
                    </h2>
                    <p className="font-mono text-xs text-action font-semibold">Active & Monitored 24/7</p>
                  </div>
                </div>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted font-light">
                  Direct access for authorized enterprise clients. Monitor active development sprints, review cloud infrastructure telemetry, download milestone deliverables, and communicate directly with your dedicated Qorlune technical lead.
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-ink-muted">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 size={14} /> Full Project Continuity
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 size={14} /> Historical Deliverables Intact
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 size={14} /> Active SLA Telemetry
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href="/client/login"
                  className="inline-flex items-center justify-center gap-2 bg-action px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-on-action transition hover:bg-action-strong shadow-md"
                >
                  <span>Sign In To Client Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/client/register"
                  className="inline-flex items-center justify-center gap-2 border border-line bg-card px-7 py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink transition hover:border-action"
                >
                  <span>Activate Client Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Administrative & Transitioned Workspaces */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Admin Workspace */}
          <Link
            href="/admin/login"
            className="group relative flex flex-col justify-between border border-line bg-surface p-6 transition-all duration-300 hover:border-action/60 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center border border-line bg-card text-ink group-hover:border-action group-hover:text-action">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-action border border-action/20 bg-action/[0.08] px-2 py-0.5">
                  Authorized Admin
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold uppercase tracking-tight text-ink group-hover:text-action">
                Admin Console
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted font-light">
                Qorlune corporate administration, system audit logs, and client telemetry governance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-action">
              <span>Admin Access</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Employee Workspace - Concluded */}
          <div className="relative flex flex-col justify-between border border-line bg-card/60 p-6 opacity-75">
            <div>
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-ink-muted">
                  <Lock className="h-5 w-5 text-amber-500" />
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5">
                  Operations Concluded
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold uppercase tracking-tight text-ink-muted">
                Employee Portal
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted font-light">
                Staff operations under previous management have concluded. All corporate assets and active client pipelines have transitioned to Qorlune.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <span>Handover Complete</span>
              <Lock className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>

          {/* Management Workspace - Concluded */}
          <div className="relative flex flex-col justify-between border border-line bg-card/60 p-6 opacity-75">
            <div>
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center border border-line bg-surface text-ink-muted">
                  <Lock className="h-5 w-5 text-amber-500" />
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5">
                  Operations Concluded
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold uppercase tracking-tight text-ink-muted">
                Management Portal
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted font-light">
                Executive governance transferred to Qorlune LLC. Inquiries should be directed to the incoming executive directorate at contact@qorlune.com.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <span>Handover Complete</span>
              <Lock className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Treasury & Support Auxiliary Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-line bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                <CreditCard size={14} />
                <span>Treasury & Billing</span>
              </div>
              <p className="text-sm font-bold text-ink mt-1">Client Invoices & Settlement</p>
              <p className="text-xs text-ink-muted mt-0.5 font-light">Direct Card/Paddle payments & verified corporate wire rails.</p>
            </div>
            <a
              href="https://billing.qorlune.com"
              className="inline-flex items-center gap-1.5 bg-action px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-action transition hover:bg-action-strong shrink-0"
            >
              <span>Billing Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="border border-line bg-surface p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                <LifeBuoy size={14} />
                <span>24/7 Client Dispatch</span>
              </div>
              <p className="text-sm font-bold text-ink mt-1">Technical Assistance & Hotline</p>
              <p className="text-xs text-ink-muted mt-0.5 font-light">Open an enterprise ticket or check real-time system status.</p>
            </div>
            <a
              href="https://support.qorlune.com"
              className="inline-flex items-center gap-1.5 border border-line bg-surface px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink transition hover:border-action hover:text-action shrink-0"
            >
              <span>Helpdesk</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
