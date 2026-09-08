"use client";

import Link from "next/link";
import { Activity, Shield, Users, type LucideIcon } from "lucide-react";

import { useAdminMetrics } from "@/hooks/useAdmin";
import { useI18n } from "@/lib/i18n";

export type AccessFunctionId = "users" | "roles" | "settings";

interface AccessControlBannerProps {
  active?: AccessFunctionId;
  compact?: boolean;
}

interface FunctionItem {
  id: AccessFunctionId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  countKey?: "users";
}

const ACCESS_FUNCTIONS: FunctionItem[] = [
  {
    id: "users",
    label: "User Accounts",
    shortLabel: "Users",
    href: "/admin/users",
    icon: Users,
    countKey: "users",
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    shortLabel: "Roles",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    id: "settings",
    label: "Account Settings",
    shortLabel: "Settings",
    href: "/admin/settings",
    icon: Activity,
  },
];

export default function AccessControlBanner({
  active = "users",
  compact = false,
}: AccessControlBannerProps) {
  const { t } = useI18n();
  const { data } = useAdminMetrics();

  const metrics = data?.data;
  const pendingCount = metrics?.pending ?? 0;
  const totalCount = metrics?.total ?? 0;

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-adm-border bg-adm-surface p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Top title & summary section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
              <span>{t("Security & Governance")}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
              {t("Access Control & Security")}
            </h2>
            {!compact && (
              <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-adm-text-3 sm:text-sm">
                {t(
                  "Configure operator permissions, user account approvals, role hierarchies, and administrator credentials.",
                )}
              </p>
            )}
          </div>

          {/* Real-time pulse stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue" />
              <span className="text-adm-text-3">{t("Total Users:")}</span>
              <span className="font-semibold text-adm-text tabular-nums">{totalCount}</span>
            </div>
            {pendingCount > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-adm-amber/30 bg-adm-amber-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-amber" />
                <span className="font-semibold text-adm-amber">
                  {pendingCount} {t("pending approval")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-adm-green/30 bg-adm-green-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-green" />
                <span className="font-semibold text-adm-green">{t("All accounts approved")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Function navigation capsules */}
        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
            {t("Access Control Functions")}
          </p>
          <nav aria-label={t("Access functions")} className="flex flex-wrap items-center gap-2">
            {ACCESS_FUNCTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const count =
                item.countKey === "users" && pendingCount > 0 ? pendingCount : undefined;

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
                          : "border border-adm-amber/30 bg-adm-amber-light text-adm-amber"
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
