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
    <div className="flex flex-col gap-3 border-b border-adm-border pb-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Department indicator */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-adm-text">
            {t("Access Control")}
          </span>
          {pendingCount > 0 && (
            <span className="rounded-full border border-adm-amber/30 bg-adm-amber-light px-2 py-0.5 text-[11px] font-medium text-adm-amber tabular-nums">
              {pendingCount} {t("pending approval")}
            </span>
          )}
        </div>

        {/* Function pills */}
        <nav aria-label={t("Access functions")} className="flex flex-wrap items-center gap-1.5">
          {ACCESS_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const count =
              item.countKey === "users" && pendingCount > 0 ? pendingCount : undefined;

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
  );
}
