"use client";

import Link from "next/link";
import { Briefcase, MessageCircle, TrendingUp, type LucideIcon } from "lucide-react";

import { useLeadPipeline } from "@/hooks/useLeads";
import { useI18n } from "@/lib/i18n";

export type RevenueFunctionId = "client" | "whatsapp" | "management";

interface RevenueBannerProps {
  active?: RevenueFunctionId;
  compact?: boolean;
}

interface FunctionItem {
  id: RevenueFunctionId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  countKey?: "leads" | "followups";
}

const REVENUE_FUNCTIONS: FunctionItem[] = [
  {
    id: "client",
    label: "Lead Workbench & CRM",
    shortLabel: "Leads & CRM",
    href: "/admin/client",
    icon: Briefcase,
    countKey: "leads",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Lead Line",
    shortLabel: "WhatsApp Chat",
    href: "/admin/whatsapp",
    icon: MessageCircle,
  },
  {
    id: "management",
    label: "Management Reporting",
    shortLabel: "Reporting",
    href: "/management/dashboard",
    icon: TrendingUp,
  },
];

export default function RevenueBanner({
  active = "client",
  compact = false,
}: RevenueBannerProps) {
  const { t } = useI18n();
  const pipeline = useLeadPipeline();

  const totals = pipeline.data;
  const totalLeads = totals?.totalLeads ?? 0;
  const followUpsDue = totals?.followUpsDue ?? 0;

  return (
    <div className="flex flex-col gap-3 border-b border-adm-border pb-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Department indicator */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-adm-text">
            {t("Revenue & CRM")}
          </span>
          {followUpsDue > 0 && (
            <span className="rounded-full border border-adm-amber/30 bg-adm-amber-light px-2 py-0.5 text-[11px] font-medium text-adm-amber tabular-nums">
              {followUpsDue} {t("follow-ups due")}
            </span>
          )}
        </div>

        {/* Function pills */}
        <nav aria-label={t("Revenue functions")} className="flex flex-wrap items-center gap-1.5">
          {REVENUE_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const count = item.countKey === "leads" && totalLeads > 0 ? totalLeads : undefined;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
                  isActive
                    ? "bg-adm-blue text-white font-semibold"
                    : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
                }`}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-adm-text-3"} />
                <span>{t(item.shortLabel)}</span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "border border-adm-border bg-adm-surface-2 text-adm-text-3"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
