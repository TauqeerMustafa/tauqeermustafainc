"use client";

import { Bell, CalendarDays, Clock, FileText, Plus, Users } from "lucide-react";

import {
  ErrorBlock,
  LoadingBlock,
  PortalButton,
  SectionOverview,
} from "@/components/portal/PortalUI";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { useAllDocuments } from "@/hooks/useDocuments";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useI18n } from "@/lib/i18n";

/**
 * People & HR section overview — the "div" between the sidebar and each sub-tool.
 * A card grid that fans out to Employees, Teams, Attendance, Leave, Documents and
 * Announcements, each surfacing one live count. This replaced a mixed layout that
 * paired the sub-tab bar with an in-page show/hide filter (two navigations doing
 * the same job); the sub-tab bar now lives only on the sub-tool pages themselves.
 */
export default function AdminPeoplePage() {
  const { t } = useI18n();
  const dashboardQuery = useAdminDashboard();
  const documentsQuery = useAllDocuments(true);
  const announcementsQuery = useAnnouncements();

  if (dashboardQuery.isLoading) {
    return <LoadingBlock label={t("Loading people & workforce hub…")} />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ErrorBlock
        message={
          dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : t("Could not load the people hub.")
        }
        onRetry={() => dashboardQuery.refetch()}
      />
    );
  }

  const { overview, pendingLeave } = dashboardQuery.data;
  const documents = documentsQuery.data ?? [];
  const announcements = announcementsQuery.data?.data?.items ?? [];

  return (
    <SectionOverview
      eyebrow={t("People & HR")}
      title={t("People")}
      description={t(
        "The workforce at a glance — roster, attendance, leave, documents, and company broadcasts.",
      )}
      actions={
        <PortalButton href="/admin/employees/create" icon={Plus}>
          {t("Add employee")}
        </PortalButton>
      }
      cards={[
        {
          title: t("Employees"),
          description: t("The full roster — roles, accounts, and status."),
          icon: Users,
          href: "/admin/employees",
          stat: overview.totalEmployees,
          statLabel: t("on roster"),
          tone: "blue",
        },
        {
          title: t("Teams"),
          description: t("Group the roster into departments and assign leads."),
          icon: Users,
          href: "/admin/teams",
          tone: "neutral",
        },
        {
          title: t("Attendance"),
          description: t("Daily check-ins — who is in, late, or away."),
          icon: Clock,
          href: "/admin/attendance",
          stat: overview.present,
          statLabel: t("present today"),
          tone: "green",
        },
        {
          title: t("Leave"),
          description: t("Review and decide time-off requests."),
          icon: CalendarDays,
          href: "/admin/leave",
          stat: pendingLeave.length,
          statLabel: t("awaiting review"),
          tone: "amber",
          badge:
            pendingLeave.length > 0
              ? { label: t("Action needed"), tone: "amber" as const }
              : undefined,
        },
        {
          title: t("Documents"),
          description: t("Policies, contracts, and certifications."),
          icon: FileText,
          href: "/admin/documents",
          stat: documents.length,
          statLabel: t("stored"),
          tone: "blue",
        },
        {
          title: t("Announcements"),
          description: t("Company-wide broadcasts to every staff member."),
          icon: Bell,
          href: "/admin/announcements",
          stat: announcements.length,
          statLabel: t("posted"),
          tone: "blue",
        },
      ]}
    />
  );
}
