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
    href: "/admin/management",
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
    <div className="relative overflow-hidden rounded-[18px] border border-adm-border bg-adm-surface p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Top title & summary section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
              <span>{t("Revenue & Growth")}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
              {t("Sales Pipeline & Client Relationships")}
            </h2>
            {!compact && (
              <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-adm-text-3 sm:text-sm">
                {t(
                  "Qualify inbound prospects, track sales follow-ups, advance deal stages, and coordinate through WhatsApp and reporting.",
                )}
              </p>
            )}
          </div>

          {/* Real-time pulse stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue" />
              <span className="text-adm-text-3">{t("Active Leads:")}</span>
              <span className="font-semibold text-adm-text tabular-nums">{totalLeads}</span>
            </div>
            {followUpsDue > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-adm-amber/30 bg-adm-amber-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-amber" />
                <span className="font-semibold text-adm-amber">
                  {followUpsDue} {t("follow-ups due")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
                <span className="text-adm-text-3">{t("Follow-ups:")}</span>
                <span className="font-semibold text-adm-text">{t("Up to date")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Function navigation capsules */}
        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
            {t("Revenue Functions")}
          </p>
          <nav aria-label={t("Revenue functions")} className="flex flex-wrap items-center gap-2">
            {REVENUE_FUNCTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const count = item.countKey === "leads" && totalLeads > 0 ? totalLeads : undefined;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    isActive
                      ? "bg-adm-blue text-white font-semibold"
                      : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${isActive ? "text-white" : "text-adm-text-3"}`}
                  />
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
    </div>
  );
}
