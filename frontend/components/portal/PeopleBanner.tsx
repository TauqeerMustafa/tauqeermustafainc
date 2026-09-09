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
  | "teams"
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
    id: "teams",
    label: "Department Teams",
    shortLabel: "Teams",
    href: "/admin/teams",
    icon: Users,
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
    <div className="flex flex-col gap-3 border-b border-adm-border pb-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Department indicator */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-adm-text">
            {t("People & HR")}
          </span>
          {pendingLeave.length > 0 && (
            <span className="rounded-full border border-adm-amber/30 bg-adm-amber-light px-2 py-0.5 text-[11px] font-medium text-adm-amber tabular-nums">
              {pendingLeave.length} {t("leave pending")}
            </span>
          )}
        </div>

        {/* Function pills */}
        <nav aria-label={t("People functions")} className="flex flex-wrap items-center gap-1.5">
          {PEOPLE_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const count = item.countKey ? counts[item.countKey] : undefined;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-medium transition active:scale-95 ${
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
  );
}
