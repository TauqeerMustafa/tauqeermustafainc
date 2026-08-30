import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, ShieldCheck, Users, type LucideIcon } from "lucide-react";

import {
  PORTAL,
  PORTAL_CHOOSER,
  PORTAL_DESCRIPTION,
  PORTAL_LABEL,
  PORTAL_LOGIN_PATH,
  PORTAL_ROLES_HINT,
  type PortalId,
} from "@/lib/rbac";

export const metadata = {
  title: "Portals | Tauqeer Mustafa Inc.",
  description: "Choose your secure workspace to sign in.",
};

/** One icon per portal, kept here rather than in rbac so the lib stays UI-free. */
const PORTAL_ICON: Record<PortalId, LucideIcon> = {
  [PORTAL.ADMIN]: ShieldCheck,
  [PORTAL.MANAGEMENT]: BarChart3,
  [PORTAL.EMPLOYEES]: Users,
  [PORTAL.CLIENT]: Briefcase,
};

export default function PortalsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <div className="m-stripe w-16" aria-hidden="true" />
        <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-ink sm:text-5xl">
          TMI Portals
        </h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">
          Select your secure workspace to sign in and reach your dashboard.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
        {PORTAL_CHOOSER.map((portal) => {
          const Icon = PORTAL_ICON[portal];
          return (
            <Link
              key={portal}
              href={PORTAL_LOGIN_PATH[portal]}
              className="group flex flex-col bg-canvas p-8 transition-colors hover:bg-surface"
            >
              <div className="flex items-start justify-between">
                <span className="border border-ink/10 bg-surface p-3 text-ink transition-colors group-hover:border-adm-blue group-hover:text-adm-blue">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <ArrowRight className="h-5 w-5 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </div>
              <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-adm-blue">
                {PORTAL_ROLES_HINT[portal]}
              </p>
              <h2 className="mt-2 text-xl font-bold uppercase tracking-tight text-ink">
                {PORTAL_LABEL[portal]} Portal
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {PORTAL_DESCRIPTION[portal]}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
