"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  Mail,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Shield,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Label,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  SegmentBar,
  StatCard,
  StatusPill,
  Td,
} from "@/components/portal/PortalUI";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { useAdminMetrics } from "@/hooks/useAdmin";
import { useMessages } from "@/hooks/useMessages";
import { useI18n } from "@/lib/i18n";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type MainTag =
  | "overview"
  | "people"
  | "delivery"
  | "revenue"
  | "inbox"
  | "website"
  | "access";

interface TagDefinition {
  id: MainTag;
  label: string;
  badge?: string;
  count?: number;
  countTone?: "blue" | "green" | "amber" | "red";
  icon: LucideIcon;
}

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const [mainTag, setMainTag] = useState<MainTag>("overview");

  const dashboardQuery = useAdminDashboard();
  const metricsQuery = useAdminMetrics();
  const inquiriesQuery = useMessages({ unreadOnly: true });

  if (dashboardQuery.isLoading) {
    return <LoadingBlock label="Loading company administration…" />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ErrorBlock
        message={
          dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "Could not load the dashboard."
        }
        onRetry={() => dashboardQuery.refetch()}
      />
    );
  }

  const {
    overview,
    attendanceToday,
    pendingLeave,
    recentActivity,
    tasks,
    projects,
    announcements,
    documents,
  } = dashboardQuery.data;

  const openTaskCount = tasks.filter((t) => t.status !== "done").length;
  const metrics = metricsQuery.data?.data;
  const unreadInquiries = inquiriesQuery.data?.data?.items?.length ?? 0;

  // 7 Main Category Tags
  const mainTags: TagDefinition[] = [
    {
      id: "overview",
      label: t("Overview"),
      icon: LayoutDashboard,
    },
    {
      id: "people",
      label: t("People & HR"),
      icon: Users,
      count: pendingLeave.length > 0 ? pendingLeave.length : overview.totalEmployees,
      countTone: pendingLeave.length > 0 ? "amber" : "blue",
    },
    {
      id: "delivery",
      label: t("Delivery & Tasks"),
      icon: FolderKanban,
      count: openTaskCount > 0 ? openTaskCount : projects.length,
      countTone: openTaskCount > 0 ? "blue" : undefined,
    },
    {
      id: "revenue",
      label: t("Revenue & CRM"),
      icon: Briefcase,
    },
    {
      id: "inbox",
      label: t("Communications"),
      icon: MessagesSquare,
      count: unreadInquiries > 0 ? unreadInquiries : undefined,
      countTone: "amber",
    },
    {
      id: "website",
      label: t("Website CMS"),
      icon: Globe,
    },
    {
      id: "access",
      label: t("Access Control"),
      icon: Shield,
      count: metrics?.pending && metrics.pending > 0 ? metrics.pending : undefined,
      countTone: "amber",
    },
  ];

  const renderDepartmentBanner = (
    badge: string,
    title: string,
    description: string,
    subOptions: Array<{ label: string; href: string; icon: LucideIcon; count?: number; countTone?: "amber" | "blue" }>,
  ) => (
    <div className="relative overflow-hidden rounded-2xl border border-adm-border bg-adm-surface p-5 sm:p-6 shadow-sm">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-adm-blue/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-blue/20 bg-adm-blue-light px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-adm-blue">
            <Sparkles size={11} className="shrink-0" />
            <span>{badge}</span>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-adm-text sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-adm-text-3 sm:text-sm">
            {description}
          </p>
        </div>

        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-adm-text-3">
            {t("Related Options & Tools")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {subOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <Link
                  key={opt.href}
                  href={opt.href}
                  className="group inline-flex items-center gap-2 rounded-xl border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs font-semibold text-adm-text-2 transition hover:border-adm-blue hover:bg-adm-surface hover:text-adm-blue"
                >
                  <Icon size={14} className="text-adm-blue shrink-0" />
                  <span>{opt.label}</span>
                  {typeof opt.count === "number" && opt.count > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                        opt.countTone === "amber"
                          ? "bg-adm-amber-light text-adm-amber border border-adm-amber/30"
                          : "bg-adm-blue-light text-adm-blue border border-adm-blue/30"
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                  <ChevronRight
                    size={13}
                    className="opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const rosterPanel = (
    <Panel title="Today's roster" icon={Clock} tone="green">
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
          <div key={label}>
            <dd className={`text-2xl font-bold tabular-nums ${colour}`}>{value}</dd>
            <dt className="mt-1">
              <Label>{label}</Label>
            </dt>
          </div>
        ))}
      </dl>
    </Panel>
  );

  const actionRequiredPanel = (
    <Panel
      title="Action required"
      icon={AlertCircle}
      tone="amber"
      padded={false}
      action={
        <Link href="/admin/leave" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
          Open inbox
        </Link>
      }
    >
      {pendingLeave.length === 0 ? (
        <div className="p-5">
          <EmptyBlock title="Inbox zero" description="No leave requests are waiting on approval." />
        </div>
      ) : (
        <ul className="divide-y divide-adm-border">
          {pendingLeave.map((request) => (
            <li key={request.id}>
              <Link
                href="/admin/leave"
                className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-adm-surface-2"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-adm-amber-light text-xs font-bold text-adm-amber">
                    {request.employee.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-adm-text">{request.employee}</span>
                    <span className="block text-xs text-adm-text-3">
                      {request.leaveType ?? "leave"} · {formatDate(request.startDate)} → {formatDate(request.endDate)}
                    </span>
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-adm-text-3 transition group-hover:text-adm-blue" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );

  const taskBoardPanel = (
    <Panel
      title="Task board"
      icon={CheckSquare}
      padded={false}
      action={<Label>{openTaskCount} open</Label>}
    >
      {tasks.length === 0 ? (
        <div className="p-5">
          <EmptyBlock title="No tasks" description="Nothing has been assigned yet." />
        </div>
      ) : (
        <DataTable head={["Task", "Status"]}>
          {tasks.slice(0, 6).map((task) => (
            <tr key={task.id} className="transition hover:bg-adm-surface-2">
              <Td strong>{task.title}</Td>
              <Td>
                <StatusPill status={task.status} />
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </Panel>
  );

  const activityFeedPanel = (
    <Panel title="Activity feed" icon={Activity} padded={false}>
      {recentActivity.length === 0 ? (
        <div className="p-5">
          <EmptyBlock title="No activity" description="Audit entries will appear here." />
        </div>
      ) : (
        <ol className="flex flex-col gap-5 p-5">
          {recentActivity.map((entry) => (
            <li key={entry.id} className="relative border-l border-adm-border pl-5">
              <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 bg-adm-blue" aria-hidden="true" />
              <p className="text-sm text-adm-text">
                <span className="font-semibold">{entry.action}</span>
                {entry.entity ? ` · ${entry.entity}` : ""}
              </p>
              <p className="mt-0.5 text-xs text-adm-text-3">{formatDate(entry.createdAt)}</p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );

  const activeProjectsPanel = (
    <Panel
      title="Active projects"
      icon={FolderKanban}
      padded={false}
      action={
        <Link href="/admin/projects" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
          All
        </Link>
      }
    >
      {projects.length === 0 ? (
        <div className="p-5">
          <EmptyBlock title="No projects" description="Create a project to track delivery." />
        </div>
      ) : (
        <ul className="divide-y divide-adm-border">
          {projects.slice(0, 6).map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="truncate text-sm font-semibold text-adm-text">{project.name}</span>
              <StatusPill status={project.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );

  const announcementsPanel = (
    <Panel title="Announcements" icon={Bell} padded={false}>
      {announcements.length === 0 ? (
        <p className="p-5 text-sm text-adm-text-3">Nothing published.</p>
      ) : (
        <ul className="divide-y divide-adm-border">
          {announcements.slice(0, 4).map((item) => (
            <li key={item.id} className="px-5 py-3.5">
              <p className="truncate text-sm font-semibold text-adm-text">{item.title}</p>
              <p className="mt-0.5 text-xs text-adm-text-3">{formatDate(item.publishedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );

  const documentsPanel = (
    <Panel title="Documents" icon={FileText} padded={false}>
      {documents.length === 0 ? (
        <p className="p-5 text-sm text-adm-text-3">Vault is empty.</p>
      ) : (
        <ul className="divide-y divide-adm-border">
          {documents.slice(0, 4).map((doc) => (
            <li key={doc.id} className="px-5 py-3.5">
              <p className="truncate text-sm font-semibold text-adm-text">{doc.title}</p>
              <p className="mt-0.5">
                <Label>{doc.type}</Label>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );

  return (
    <div className="flex flex-col gap-7">
      <PortalPageHeader
        title="Admin Operations"
        description="Select any department tag below to dive into its live operations and related tools."
      />

      {/* ── Main Category Tags (Pill Navigation) ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-adm-border pb-4">
        {mainTags.map((tag) => {
          const Icon = tag.icon;
          const isActive = mainTag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setMainTag(tag.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-adm-blue text-white shadow-sm font-bold scale-[1.02]"
                  : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
              }`}
            >
              <Icon size={15} className={`shrink-0 ${isActive ? "text-white" : "text-adm-blue"}`} />
              <span>{tag.label}</span>
              {typeof tag.count === "number" && tag.count > 0 && (
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                    isActive
                      ? "bg-white/25 text-white"
                      : tag.countTone === "amber"
                        ? "bg-adm-amber-light text-adm-amber border border-adm-amber/30"
                        : "bg-adm-blue-light text-adm-blue border border-adm-blue/30"
                  }`}
                >
                  {tag.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 1: OVERVIEW ── */}
      {mainTag === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Employees" value={overview.totalEmployees} icon={Users} href="/admin/employees" tone="blue" />
            <StatCard label="Present today" value={overview.present} icon={Clock} href="/admin/attendance" tone="green" />
            <StatCard label="On leave" value={overview.onLeave} icon={AlertCircle} href="/admin/leave" tone="amber" />
            <StatCard label="Open tasks" value={overview.openTasks} icon={CheckSquare} href="/admin/tasks" tone="blue" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {rosterPanel}
            {actionRequiredPanel}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {taskBoardPanel}
            {activeProjectsPanel}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activityFeedPanel}
            <div className="flex flex-col gap-6">
              {announcementsPanel}
              {documentsPanel}
            </div>
          </div>
        </div>
      )}

      {/* ── 2: PEOPLE & HR ── */}
      {mainTag === "people" && (
        <div className="flex flex-col gap-6">
          {renderDepartmentBanner(
            "PEOPLE & WORKFORCE",
            "People & Culture Operations",
            "Oversee staff directory, daily attendance tracking, time-off review, document distribution, and broadcasts.",
            [
              { label: "Employees Roster", href: "/admin/employees", icon: Users, count: overview.totalEmployees },
              { label: "Daily Attendance", href: "/admin/attendance", icon: Clock, count: overview.present },
              { label: "Leave Requests", href: "/admin/leave", icon: CalendarDays, count: pendingLeave.length, countTone: "amber" },
              { label: "Documents Vault", href: "/admin/documents", icon: FileText, count: documents.length },
              { label: "Announcements", href: "/admin/announcements", icon: Bell, count: announcements.length },
              { label: "People Hub", href: "/admin/people", icon: Sparkles },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/employees"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <Users size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-bold text-adm-text tabular-nums">
                  {overview.totalEmployees} staff
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Employees Roster</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Manage active personnel, departments, job titles, and member onboarding.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Directory</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/attendance"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-green-light text-adm-green">
                  <Clock size={20} />
                </div>
                <span className="rounded-full bg-adm-green-light px-2.5 py-1 text-xs font-bold text-adm-green tabular-nums">
                  {overview.present} present
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Daily Attendance</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Live daily check-in signals, late arrivals, absences, and log audits.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>View Attendance</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/leave"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-amber-light text-adm-amber">
                  <CalendarDays size={20} />
                </div>
                {pendingLeave.length > 0 ? (
                  <span className="rounded-full bg-adm-amber-light px-2.5 py-1 text-xs font-bold text-adm-amber tabular-nums">
                    {pendingLeave.length} pending
                  </span>
                ) : (
                  <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-medium text-adm-text-3">
                    Inbox zero
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Leave Approvals</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Review time-off requests, approve medical/annual leaves, and record decisions.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Review Queue</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/documents"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FileText size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-bold text-adm-text tabular-nums">
                  {documents.length} files
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Documents Vault</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Secure company policies, employee contracts, certifications, and payslips.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Browse Vault</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/announcements"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <Bell size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-bold text-adm-text tabular-nums">
                  {announcements.length} posts
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Announcements</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Broadcast company news, leadership updates, and official communications.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>View Bulletins</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/people"
              className="group flex flex-col justify-between rounded-2xl border border-adm-blue bg-adm-blue-light/40 p-5 shadow-sm transition hover:bg-adm-blue-light"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue text-white">
                  <Sparkles size={20} />
                </div>
                <span className="rounded-full bg-adm-blue px-2.5 py-1 text-xs font-bold text-white">
                  Unified Hub
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Open People Hub</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  View the dedicated full-screen People Operations command center with banner.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Launch Hub</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {rosterPanel}
            {actionRequiredPanel}
          </div>
        </div>
      )}

      {/* ── 3: DELIVERY & PROJECTS ── */}
      {mainTag === "delivery" && (
        <div className="flex flex-col gap-6">
          {renderDepartmentBanner(
            "DELIVERY & EXECUTION",
            "Projects & Task Delivery",
            "Monitor client milestone delivery, sprint backlog, Kanban boards, and project statuses.",
            [
              { label: "Projects Hub", href: "/admin/projects", icon: FolderKanban, count: projects.length },
              { label: "Tasks Kanban Board", href: "/admin/tasks", icon: CheckSquare, count: openTaskCount, countTone: "blue" },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/admin/projects"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <FolderKanban size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-bold text-adm-text tabular-nums">
                  {projects.length} active
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Projects Delivery Hub</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Track client engagement status (Discovery, Build, Review, Live), milestones, and progress.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Projects</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/tasks"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <CheckSquare size={20} />
                </div>
                <span className="rounded-full bg-adm-blue-light px-2.5 py-1 text-xs font-bold text-adm-blue tabular-nums">
                  {openTaskCount} open tasks
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Task Board & Kanban</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  4-column drag-and-drop workflow: To Do, In Progress, Review, and Done. Assign trial playbooks.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Launch Kanban</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activeProjectsPanel}
            {taskBoardPanel}
          </div>
        </div>
      )}

      {/* ── 4: REVENUE & CRM ── */}
      {mainTag === "revenue" && (
        <div className="flex flex-col gap-6">
          {renderDepartmentBanner(
            "REVENUE & CRM",
            "Sales Pipeline & Client Relationships",
            "Manage client leads, deal qualification, follow-up dates, activity logs, and WhatsApp customer lines.",
            [
              { label: "Leads & Pipeline", href: "/admin/client", icon: Briefcase },
              { label: "WhatsApp Lead Line", href: "/admin/whatsapp", icon: MessageCircle },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/admin/client"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <Briefcase size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-bold text-adm-text">
                  CRM
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Lead Workbench & CRM</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Qualify inbound prospects, log calls & meetings, track follow-ups, and move deals through stages.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Workbench</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/whatsapp"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-green-light text-adm-green">
                  <MessageCircle size={20} />
                </div>
                <span className="rounded-full bg-adm-green-light px-2.5 py-1 text-xs font-bold text-adm-green">
                  Live Chat
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">WhatsApp Business</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Real-time WhatsApp Cloud API lines, automated lead reply bots, template approvals, and multi-line inbox.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open WhatsApp</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── 5: INBOX & COMMUNICATIONS ── */}
      {mainTag === "inbox" && (
        <div className="flex flex-col gap-6">
          {renderDepartmentBanner(
            "COMMUNICATIONS",
            "Unified Messaging & Customer Inboxes",
            "Monitor and reply across all channels: WhatsApp Business, company Webmail, Client Portal threads, and website forms.",
            [
              { label: "WhatsApp Inbox", href: "/admin/whatsapp", icon: MessageCircle },
              { label: "Webmail", href: "/admin/mail", icon: Mail },
              { label: "Client Portal Messages", href: "/admin/client-messages", icon: MessagesSquare },
              { label: "Website Inquiries", href: "/admin/messages", icon: Mail, count: unreadInquiries, countTone: "amber" },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/whatsapp"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-green-light text-adm-green">
                <MessageCircle size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-adm-text group-hover:text-adm-blue">WhatsApp</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  WhatsApp Cloud API inbox with bot flows and Meta templates.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Chat</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/mail"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <Mail size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-adm-text group-hover:text-adm-blue">Webmail</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Company mailbox email client powered by Open.email.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Mail</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/client-messages"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <MessagesSquare size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-adm-text group-hover:text-adm-blue">Client Portal</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Direct conversation threads between clients and staff leads.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>View Threads</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/messages"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-amber-light text-adm-amber">
                <Mail size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold text-adm-text group-hover:text-adm-blue">Website Inquiries</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Contact forms, service requests, and career applicant inquiries.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Review ({unreadInquiries})</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── 6: WEBSITE CMS ── */}
      {mainTag === "website" && (
        <div className="flex flex-col gap-6">
          {renderDepartmentBanner(
            "DIGITAL PRESENCE",
            "Website Content Management (CMS)",
            "Publish blog articles, client case study showcases, service offerings, and job vacancy postings.",
            [
              { label: "Blog Posts", href: "/admin/blog", icon: Newspaper },
              { label: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
              { label: "Services", href: "/admin/services", icon: Wrench },
              { label: "Careers", href: "/admin/careers", icon: GraduationCap },
              { label: "Community", href: "/admin/community", icon: Globe },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/blog"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <Newspaper size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Blog & Insights</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Write, edit, and publish engineering and design articles to your public site.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Manage Posts</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/portfolio"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <ImageIcon size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Portfolio Case Studies</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Showcase enterprise client deliveries, deliverables, tech stacks, and results.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Manage Portfolio</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/services"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <Wrench size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Services & Capabilities</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Configure high-impact service catalog, delivery outcomes, and deliverables.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Manage Services</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/careers"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <GraduationCap size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Careers & Job Openings</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Publish open positions and review job applicant resumes with 1-click onboarding.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Manage Careers</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/community"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                <Globe size={20} />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Community Network</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Review applicant profiles for the creator and engineer community circle.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Community</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── 7: ACCESS CONTROL & SECURITY ── */}
      {mainTag === "access" && (
        <div className="flex flex-col gap-6">
          {renderDepartmentBanner(
            "SECURITY & GOVERNANCE",
            "Access Control, Roles & Permissions",
            "Control user authentication, account approvals, role hierarchies, and granular permissions.",
            [
              { label: "User Accounts", href: "/admin/users", icon: Users, count: metrics?.total },
              { label: "Roles & Permissions", href: "/admin/roles", icon: Shield },
              { label: "Settings", href: "/admin/settings", icon: Activity },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/users"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <Users size={20} />
                </div>
                {metrics?.pending && metrics.pending > 0 ? (
                  <span className="rounded-full bg-adm-amber-light px-2.5 py-1 text-xs font-bold text-adm-amber tabular-nums">
                    {metrics.pending} pending
                  </span>
                ) : (
                  <span className="rounded-full bg-adm-green-light px-2.5 py-1 text-xs font-bold text-adm-green tabular-nums">
                    {metrics?.approved ?? 0} active
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">User Accounts</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Manage staff logins, account statuses, Open.email mailboxes, and onboarding.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Manage Users</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/roles"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-blue-light text-adm-blue">
                  <Shield size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-bold text-adm-text">
                  RBAC Matrix
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Roles & Permissions</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Configure hierarchy levels, create custom roles, and assign fine-grained permissions.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Configure Roles</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="group flex flex-col justify-between rounded-2xl border border-adm-border bg-adm-surface p-5 shadow-sm transition hover:border-adm-blue hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-adm-surface-2 text-adm-text-2">
                  <Activity size={20} />
                </div>
                <span className="rounded-full bg-adm-surface-2 px-2.5 py-1 text-xs font-medium text-adm-text-3">
                  Account
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-adm-text group-hover:text-adm-blue">Account Settings</h3>
                <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                  Update your administrator profile, change password, and manage active sessions.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-adm-blue">
                <span>Open Settings</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
