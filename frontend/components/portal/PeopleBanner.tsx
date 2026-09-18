"use client";

import {
  Bell,
  CalendarDays,
  Clock,
  FileText,
  LayoutGrid,
  Users,
} from "lucide-react";

import { SubNav } from "@/components/portal/PortalUI";
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

/**
 * The People & HR sub-tab bar — the "sub" layer over every People sub-tool page
 * (Employees, Teams, Attendance, Leave, Documents, Announcements). A thin
 * adapter over the shared {@link SubNav}: it supplies live counts from the admin
 * dashboard and translated labels, and lets `SubNav` derive the active pill from
 * the route. The `/admin/people` overview page itself renders a `SectionOverview`
 * instead of this bar.
 */
export default function PeopleBanner() {
  const { t } = useI18n();
  const { data } = useAdminDashboard();

  const overview = data?.overview;
  const pendingLeave = data?.pendingLeave ?? [];
  const documents = data?.documents ?? [];
  const announcements = data?.announcements ?? [];

  return (
    <SubNav
      label={t("People & HR")}
      alert={
        pendingLeave.length > 0
          ? { count: pendingLeave.length, label: t("leave pending"), tone: "amber" }
          : undefined
      }
      items={[
        { label: t("Overview"), href: "/admin/people", icon: LayoutGrid },
        {
          label: t("Employees"),
          href: "/admin/employees",
          icon: Users,
          count: overview?.totalEmployees,
        },
        { label: t("Teams"), href: "/admin/teams", icon: Users },
        {
          label: t("Attendance"),
          href: "/admin/attendance",
          icon: Clock,
          count: overview?.present,
        },
        {
          label: t("Leave"),
          href: "/admin/leave",
          icon: CalendarDays,
          count: pendingLeave.length,
          countTone: "amber",
        },
        {
          label: t("Documents"),
          href: "/admin/documents",
          icon: FileText,
          count: documents.length,
        },
        {
          label: t("Announcements"),
          href: "/admin/announcements",
          icon: Bell,
          count: announcements.length,
        },
      ]}
    />
  );
}
