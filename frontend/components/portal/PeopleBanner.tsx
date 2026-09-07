"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Clock,
  FileText,
  LayoutGrid,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAdminDashboard } from "@/hooks/useDashboard";
import { useI18n } from "@/lib/i18n";

export type PeopleFunctionId =
  | "overview"
  | "employees"
  | "attendance"
  | "leave"
  | "documents"
  | "announcements";

interface PeopleBannerProps {
  active?: PeopleFunctionId;
  compact?: boolean;
}

interface FunctionItem {
  id: PeopleFunctionId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  countKey?: "employees" | "present" | "leave" | "documents" | "announcements";
}

const PEOPLE_FUNCTIONS: FunctionItem[] = [
  {
    id: "overview",
    label: "People Overview",
    shortLabel: "Overview",
    href: "/admin/people",
    icon: LayoutGrid,
  },
  {
    id: "employees",
    label: "Employees Roster",
    shortLabel: "Employees",
    href: "/admin/employees",
    icon: Users,
    countKey: "employees",
  },
  {
    id: "attendance",
    label: "Daily Attendance",
    shortLabel: "Attendance",
    href: "/admin/attendance",
    icon: Clock,
    countKey: "present",
  },
  {
    id: "leave",
    label: "Leave Approvals",
    shortLabel: "Leave",
    href: "/admin/leave",
    icon: CalendarDays,
    countKey: "leave",
  },
  {
    id: "documents",
    label: "Document Vault",
    shortLabel: "Documents",
    href: "/admin/documents",
    icon: FileText,
    countKey: "documents",
  },
  {
    id: "announcements",
    label: "Company Broadcasts",
    shortLabel: "Announcements",
    href: "/admin/announcements",
    icon: Bell,
    countKey: "announcements",
  },
];

export default function PeopleBanner({ active = "overview", compact = false }: PeopleBannerProps) {
  const { t } = useI18n();
  const { data } = useAdminDashboard();

  const overview = data?.overview;
  const pendingLeave = data?.pendingLeave ?? [];
  const documents = data?.documents ?? [];
  const announcements = data?.announcements ?? [];

  const counts: Record<string, number | undefined> = {
    employees: overview?.totalEmployees,
    present: overview?.present,
    leave: pendingLeave.length,
    documents: documents.length,
    announcements: announcements.length,
  };

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-adm-border bg-adm-surface p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Top title & summary section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
              <span>{t("People Operations")}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
              {t("People & Workforce Hub")}
            </h2>
            {!compact && (
              <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-adm-text-3 sm:text-sm">
                {t(
                  "Unified management of team personnel, live daily attendance, leave approvals, company policy vault, and internal announcements.",
                )}
              </p>
            )}
          </div>

          {/* Real-time pulse stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-green" />
              <span className="text-adm-text-3">{t("Present:")}</span>
              <span className="font-semibold text-adm-text tabular-nums">
                {overview?.present ?? "—"}
              </span>
            </div>
            {pendingLeave.length > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-adm-amber/30 bg-adm-amber-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-amber" />
                <span className="font-semibold text-adm-amber">
                  {pendingLeave.length} {t("leave awaiting review")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="text-adm-text-3">{t("Staff:")}</span>
              <span className="font-semibold text-adm-text tabular-nums">
                {overview?.totalEmployees ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Function navigation capsules — all functions present */}
        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
            {t("People Functions")}
          </p>
          <nav
            aria-label={t("People functions")}
            className="flex flex-wrap items-center gap-2"
          >
            {PEOPLE_FUNCTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const count = item.countKey ? counts[item.countKey] : undefined;

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
                          : item.id === "leave"
                            ? "border border-adm-amber/30 bg-adm-amber-light text-adm-amber"
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
