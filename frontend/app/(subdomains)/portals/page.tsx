import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, ShieldCheck, Users, type LucideIcon, CreditCard, LifeBuoy } from "lucide-react";

import {
  PORTAL,
  PORTAL_CHOOSER,
  PORTAL_DESCRIPTION,
  PORTAL_LABEL,
  PORTAL_LOGIN_PATH,
  PORTAL_ROLES_HINT,
  type PortalId,
} from "@/lib/rbac";
import { PageHero, Section, Badge, BadgeMuted, MStripe } from "@/components/home/ui";

export const metadata = {
  title: "Portals & Workspaces | Tauqeer Mustafa Inc.",
  description: "Choose your secure corporate workspace to sign in to your dashboard.",
};

const PORTAL_ICON: Record<PortalId, LucideIcon> = {
  [PORTAL.ADMIN]: ShieldCheck,
  [PORTAL.MANAGEMENT]: BarChart3,
  [PORTAL.EMPLOYEES]: Users,
  [PORTAL.CLIENT]: Briefcase,
};

export default function PortalsPage() {
  return (
    <>
      <PageHero
        eyebrow="Identity & Access // Secure Workspaces"
        title="TMI Corporate Portals"
        description="Select your authorized workspace to authenticate and access your dedicated management, engineering, or client dashboard."
      >
        <Badge>256-Bit SSL Encrypted</Badge>
        <BadgeMuted>Role-Based Access Control</BadgeMuted>
        <BadgeMuted>Single Sign-On Supported</BadgeMuted>
      </PageHero>

      <Section className="bg-canvas py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PORTAL_CHOOSER.map((portal) => {
            const Icon = PORTAL_ICON[portal];
            return (
              <Link
                key={portal}
                href={PORTAL_LOGIN_PATH[portal]}
                className="group relative flex flex-col justify-between border border-line bg-surface p-8 transition-all duration-300 hover:border-action/60 hover:shadow-[0_12px_40px_rgba(28,105,212,0.12)]"
              >
                <span
                  className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-action transition-transform duration-500 group-hover:scale-x-100"
                  aria-hidden
                />

                <div>
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center border border-line bg-card text-ink transition-colors group-hover:border-action group-hover:text-action">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-action border border-action/20 bg-action/[0.08] px-2.5 py-1">
                      {PORTAL_ROLES_HINT[portal]}
                    </span>
                  </div>

                  <h2 className="mt-6 text-2xl font-bold uppercase tracking-tight text-ink group-hover:text-action transition-colors">
                    {PORTAL_LABEL[portal]} Portal
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted font-light">
                    {PORTAL_DESCRIPTION[portal]}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-line flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-action">
                  <span>Sign In To Workspace</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Treasury & Support Auxiliary Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-line bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                <CreditCard size={14} />
                <span>Public Treasury & Billing</span>
              </div>
              <p className="text-sm font-bold text-ink mt-1">Looking to settle an invoice or track payouts?</p>
              <p className="text-xs text-ink-muted mt-0.5 font-light">Direct Card/Paddle payments & Raast instant settlement.</p>
            </div>
            <a
              href="https://billing.tauqeermustafa.tech"
              className="inline-flex items-center gap-1.5 bg-action px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-action transition hover:bg-action-strong shrink-0"
            >
              <span>Billing Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="border border-line bg-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                <LifeBuoy size={14} />
                <span>24/7 Technical Dispatch</span>
              </div>
              <p className="text-sm font-bold text-ink mt-1">Need emergency hotline or account assistance?</p>
              <p className="text-xs text-ink-muted mt-0.5 font-light">Open an enterprise ticket or check real-time uptime.</p>
            </div>
            <a
              href="https://support.tauqeermustafa.tech"
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

