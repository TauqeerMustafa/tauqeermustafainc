"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  Users,
} from "lucide-react";

import PeopleBanner from "@/components/portal/PeopleBanner";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalButton,
  SegmentBar,
  StatusPill,
  Tabs,
} from "@/components/portal/PortalUI";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { useEmployees } from "@/hooks/useEmployees";
import { useLeaveQueue } from "@/hooks/useLeave";
import { useAllDocuments } from "@/hooks/useDocuments";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useI18n } from "@/lib/i18n";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AdminPeoplePage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>("all");

  const dashboardQuery = useAdminDashboard();
  const employeesQuery = useEmployees();
  const pendingLeaveQuery = useLeaveQueue("pending");
  const documentsQuery = useAllDocuments(true);
  const announcementsQuery = useAnnouncements();

  if (dashboardQuery.isLoading) {
    return <LoadingBlock label="Loading people & workforce hub…" />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ErrorBlock
        message={
          dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "Could not load the people hub."
        }
        onRetry={() => dashboardQuery.refetch()}
      />
    );
  }

  const { overview, attendanceToday, pendingLeave } = dashboardQuery.data;
  const employees = employeesQuery.data ?? [];
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const documents = documentsQuery.data ?? [];
  const announcements = announcementsQuery.data?.items ?? [];

  const functionTabs = [
    { id: "all", label: t("All Functions") },
    { id: "employees", label: t("Employees"), count: employees.length },
    { id: "attendance", label: t("Attendance"), count: overview.present },
    {
      id: "leave",
      label: t("Leave Approvals"),
      count: pendingLeave.length > 0 ? pendingLeave.length : undefined,
      countTone: "amber" as const,
    },
    { id: "documents", label: t("Documents"), count: documents.length },
    { id: "announcements", label: t("Announcements"), count: announcements.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Prominent People Banner */}
      <PeopleBanner active="overview" />

      {/* Function Filter Switcher */}
      <Tabs tabs={functionTabs} value={activeTab} onChange={setActiveTab} />

      {/* Section 1: Overview Grid of All 5 Functions */}
      {(activeTab === "all" || activeTab === "employees") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Function 1: Employees */}
          <Panel
            title={t("Employees Roster")}
            icon={Users}
            padded={false}
            action={
              <div className="flex items-center gap-2">
                <PortalButton href="/admin/employees/create" size="sm" icon={Plus}>
                  {t("Add")}
                </PortalButton>
                <Link
                  href="/admin/employees"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-adm-blue hover:underline"
                >
                  <span>{t("Directory")}</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            }
          >
            <div className="border-b border-adm-border p-5 bg-adm-surface-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-adm-text-3">{t("Total Headcount")}</p>
                  <p className="mt-1 text-2xl font-bold text-adm-text">{employees.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-adm-text-3">{t("Active Staff")}</p>
                  <p className="mt-1 text-2xl font-bold text-adm-green">{activeEmployees}</p>
                </div>
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="p-5">
                <EmptyBlock
                  title={t("No employees")}
                  description={t("Start by adding team members to your organization.")}
                />
              </div>
            ) : (
              <ul className="divide-y divide-adm-border">
                {employees.slice(0, 5).map((employee) => (
                  <li
                    key={employee.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-adm-surface-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-adm-blue-light text-xs font-bold text-adm-blue">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-adm-text">
                          {employee.name}
                        </p>
                        <p className="truncate text-xs text-adm-text-3">
                          {employee.jobTitle || employee.email}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={employee.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Function 2: Attendance */}
          <Panel
            title={t("Daily Attendance Roster")}
            icon={Clock}
            tone="green"
            action={
              <Link
                href="/admin/attendance"
                className="inline-flex items-center gap-1 text-xs font-semibold text-adm-blue hover:underline"
              >
                <span>{t("Full Roster")}</span>
                <ChevronRight size={13} />
              </Link>
            }
          >
            <SegmentBar
              segments={[
                { value: attendanceToday.present, tone: "green" },
                { value: attendanceToday.late, tone: "amber" },
                { value: attendanceToday.absent, tone: "red" },
                { value: attendanceToday.onLeave, tone: "blue" },
              ]}
            />
            <dl className="mt-6 grid grid-cols-4 gap-4 text-center">
              {(
                [
                  ["Present", attendanceToday.present, "text-adm-green"],
                  ["Late", attendanceToday.late, "text-adm-amber"],
                  ["Absent", attendanceToday.absent, "text-adm-red"],
                  ["Leave", attendanceToday.onLeave, "text-adm-blue"],
                ] as const
              ).map(([label, value, colour]) => (
                <div key={label} className="rounded-xl border border-adm-border bg-adm-surface-2 p-3">
                  <dd className={`text-xl font-bold tabular-nums ${colour}`}>{value}</dd>
                  <dt className="mt-1 text-[11px] font-semibold text-adm-text-3">
                    {t(label)}
                  </dt>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      )}

      {/* Section 2: Leave & Documents */}
      {(activeTab === "all" || activeTab === "leave" || activeTab === "documents") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Function 3: Leave Approvals */}
          {(activeTab === "all" || activeTab === "leave") && (
            <Panel
              title={t("Leave Approvals")}
              icon={CalendarDays}
              tone={pendingLeave.length > 0 ? "amber" : "default"}
              padded={false}
              action={
                <Link
                  href="/admin/leave"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-adm-blue hover:underline"
                >
                  <span>{t("Review Queue")}</span>
                  <ChevronRight size={13} />
                </Link>
              }
            >
              {pendingLeave.length === 0 ? (
                <div className="p-5">
                  <EmptyBlock
                    title={t("Inbox Zero")}
                    description={t("No leave requests are currently waiting on review.")}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-adm-border">
                  {pendingLeave.slice(0, 5).map((request) => (
                    <li key={request.id}>
                      <Link
                        href="/admin/leave"
                        className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-adm-surface-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-adm-amber-light text-xs font-bold text-adm-amber">
                            {request.employee.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-adm-text">
                              {request.employee}
                            </span>
                            <span className="block text-xs text-adm-text-3">
                              {request.leaveType ?? "Leave"} · {formatDate(request.startDate)} →{" "}
                              {formatDate(request.endDate)}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-adm-amber-light px-2.5 py-0.5 text-xs font-semibold text-adm-amber">
                          {t("Pending")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {/* Function 4: Document Vault */}
          {(activeTab === "all" || activeTab === "documents") && (
            <Panel
              title={t("Company Document Vault")}
              icon={FileText}
              padded={false}
              action={
                <Link
                  href="/admin/documents"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-adm-blue hover:underline"
                >
                  <span>{t("Open Vault")}</span>
                  <ChevronRight size={13} />
                </Link>
              }
            >
              <div className="border-b border-adm-border p-5 bg-adm-surface-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-adm-text-3">{t("Stored Documents")}</p>
                    <p className="mt-1 text-2xl font-bold text-adm-text">{documents.length}</p>
                  </div>
                  <PortalButton href="/admin/documents" size="sm" icon={Plus}>
                    {t("Upload")}
                  </PortalButton>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="p-5">
                  <EmptyBlock
                    title={t("Vault empty")}
                    description={t("Upload policies, contracts, and certifications.")}
                  />
                </div>
              ) : (
                <ul className="divide-y divide-adm-border">
                  {documents.slice(0, 5).map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-adm-surface-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText size={16} className="shrink-0 text-adm-blue" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-adm-text">
                            {doc.title}
                          </p>
                          <p className="truncate text-xs text-adm-text-3 uppercase">
                            {doc.documentType || "Other"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-adm-text-3">
                        {formatDate(doc.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>
      )}

      {/* Section 3: Announcements */}
      {(activeTab === "all" || activeTab === "announcements") && (
        <Panel
          title={t("Company Announcements & Broadcasts")}
          icon={Bell}
          padded={false}
          action={
            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-1 text-xs font-semibold text-adm-blue hover:underline"
            >
              <span>{t("All Broadcasts")}</span>
              <ChevronRight size={13} />
            </Link>
          }
        >
          {announcements.length === 0 ? (
            <div className="p-6">
              <EmptyBlock
                title={t("No broadcasts")}
                description={t("Publish announcements to communicate with all staff members.")}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-adm-border md:grid-cols-2 md:divide-x md:divide-y-0">
              {announcements.slice(0, 4).map((item) => (
                <div key={item.id} className="p-5 transition hover:bg-adm-surface-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-adm-blue-light px-2 py-0.5 text-[10px] font-semibold text-adm-blue uppercase">
                      {item.isPublished ? t("Published") : t("Draft")}
                    </span>
                    <span className="text-xs text-adm-text-3">
                      {formatDate(item.publishedAt || item.createdAt)}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-adm-text line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs font-normal text-adm-text-3 line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
