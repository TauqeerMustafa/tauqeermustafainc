"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
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
  LayoutGrid,
  Mail,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Shield,
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

interface DepartmentCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  badgeText?: string;
  badgeTone?: "blue" | "green" | "amber" | "neutral";
  highlight?: boolean;
}

function DepartmentCard({
  href,
  icon: Icon,
  title,
  description,
  actionLabel,
  badgeText,
  badgeTone = "neutral",
  highlight = false,
}: DepartmentCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between rounded-none border p-5 transition-all active:scale-[0.98] ${
        highlight
          ? "border-adm-blue/40 bg-adm-surface hover:border-adm-blue"
          : "border-adm-border bg-adm-surface hover:border-adm-border-2 hover:bg-adm-surface-2/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-adm-border bg-adm-surface-2 text-adm-text transition-colors group-hover:border-adm-blue/40 group-hover:text-adm-blue">
          <Icon size={16} strokeWidth={1.75} />
        </div>
        {badgeText && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tabular-nums ${
              badgeTone === "amber"
                ? "border-adm-amber/30 bg-adm-amber-light text-adm-amber"
                : badgeTone === "green"
                  ? "border-adm-green/30 bg-adm-green-light text-adm-green"
                  : badgeTone === "blue"
                    ? "border-adm-blue/30 bg-adm-blue-light text-adm-blue"
                    : "border-adm-border bg-adm-surface-2 text-adm-text-3"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold tracking-tight text-adm-text group-hover:text-adm-blue">
          {title}
        </h3>
        <p className="mt-1 text-xs font-normal leading-relaxed text-adm-text-3">
          {description}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-adm-blue group-hover:underline">
        <span>{actionLabel}</span>
        <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
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
    <div className="flex flex-col gap-3 border-b border-adm-border pb-5">
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-adm-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
          <span>{badge}</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
          {title}
        </h2>
        <p className="max-w-2xl text-xs text-adm-text-3 sm:text-sm">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {subOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Link
              key={opt.href}
              href={opt.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-medium text-adm-text-2 transition hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text active:scale-95"
            >
              <Icon size={13} className="text-adm-text-3" />
              <span>{opt.label}</span>
              {typeof opt.count === "number" && opt.count > 0 && (
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums ${
                    opt.countTone === "amber"
                      ? "border border-adm-amber/30 bg-adm-amber-light text-adm-amber"
                      : "border border-adm-border bg-adm-surface-2 text-adm-text-3"
                  }`}
                >
                  {opt.count}
                </span>
              )}
              <ChevronRight size={12} className="text-adm-text-3 opacity-60" />
            </Link>
          );
        })}
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
        <DataTable head={["Task", "Assigned to", "Status"]}>
          {tasks.slice(0, 6).map((task) => (
            <tr key={task.id} className="transition hover:bg-adm-surface-2">
              <Td strong>{task.title}</Td>
              <Td>
                {task.assignedToName ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-adm-text font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
                    <span className="truncate max-w-[180px]" title={task.assignedToName}>
                      {task.assignedToName}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-adm-text-3 italic">Unassigned</span>
                )}
              </Td>
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all active:scale-95 ${
                isActive
                  ? "bg-adm-blue text-white font-semibold"
                  : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
              }`}
            >
              <Icon size={14} className={`shrink-0 ${isActive ? "text-white" : "text-adm-text-3"}`} />
              <span>{tag.label}</span>
              {typeof tag.count === "number" && tag.count > 0 && (
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tag.countTone === "amber"
                        ? "border border-adm-amber/30 bg-adm-amber-light text-adm-amber"
                        : "border border-adm-border bg-adm-surface-2 text-adm-text-3"
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
              { label: "People Hub", href: "/admin/people", icon: LayoutGrid },
            ],
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DepartmentCard
              href="/admin/employees"
              icon={Users}
              title="Employees Roster"
              description="Manage active personnel, departments, job titles, and member onboarding."
              actionLabel="Open Directory"
              badgeText={`${overview.totalEmployees} staff`}
            />

            <DepartmentCard
              href="/admin/attendance"
              icon={Clock}
              title="Daily Attendance"
              description="Live daily check-in signals, late arrivals, absences, and log audits."
              actionLabel="View Attendance"
              badgeText={`${overview.present} present`}
              badgeTone="green"
            />

            <DepartmentCard
              href="/admin/leave"
              icon={CalendarDays}
              title="Leave Approvals"
              description="Review time-off requests, approve medical/annual leaves, and record decisions."
              actionLabel="Review Queue"
              badgeText={pendingLeave.length > 0 ? `${pendingLeave.length} pending` : "Inbox zero"}
              badgeTone={pendingLeave.length > 0 ? "amber" : "neutral"}
            />

            <DepartmentCard
              href="/admin/documents"
              icon={FileText}
              title="Documents Vault"
              description="Secure company policies, employee contracts, certifications, and payslips."
              actionLabel="Browse Vault"
              badgeText={`${documents.length} files`}
            />

            <DepartmentCard
              href="/admin/announcements"
              icon={Bell}
              title="Announcements"
              description="Broadcast company news, leadership updates, and official communications."
              actionLabel="View Bulletins"
              badgeText={`${announcements.length} posts`}
            />

            <DepartmentCard
              href="/admin/people"
              icon={LayoutGrid}
              title="Open People Hub"
              description="View the dedicated full-screen People Operations command center with banner."
              actionLabel="Launch Hub"
              badgeText="Unified Hub"
              highlight
            />
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
            <DepartmentCard
              href="/admin/projects"
              icon={FolderKanban}
              title="Projects Delivery Hub"
              description="Track client engagement status (Discovery, Build, Review, Live), milestones, and progress."
              actionLabel="Open Projects"
              badgeText={`${projects.length} active`}
            />

            <DepartmentCard
              href="/admin/tasks"
              icon={CheckSquare}
              title="Task Board & Kanban"
              description="4-column drag-and-drop workflow: To Do, In Progress, Review, and Done. Assign trial playbooks."
              actionLabel="Launch Kanban"
              badgeText={`${openTaskCount} open tasks`}
              badgeTone="blue"
            />
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
            <DepartmentCard
              href="/admin/client"
              icon={Briefcase}
              title="Lead Workbench & CRM"
              description="Qualify inbound prospects, log calls & meetings, track follow-ups, and move deals through stages."
              actionLabel="Open Workbench"
              badgeText="CRM"
            />

            <DepartmentCard
              href="/admin/whatsapp"
              icon={MessageCircle}
              title="WhatsApp Business"
              description="Real-time WhatsApp Cloud API lines, automated lead reply bots, template approvals, and multi-line inbox."
              actionLabel="Open WhatsApp"
              badgeText="Live Chat"
              badgeTone="green"
            />
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
            <DepartmentCard
              href="/admin/whatsapp"
              icon={MessageCircle}
              title="WhatsApp"
              description="WhatsApp Cloud API inbox with bot flows and Meta templates."
              actionLabel="Open Chat"
            />

            <DepartmentCard
              href="/admin/mail"
              icon={Mail}
              title="Webmail"
              description="Company mailbox email client powered by Open.email."
              actionLabel="Open Mail"
            />

            <DepartmentCard
              href="/admin/client-messages"
              icon={MessagesSquare}
              title="Client Portal"
              description="Direct conversation threads between clients and staff leads."
              actionLabel="View Threads"
            />

            <DepartmentCard
              href="/admin/messages"
              icon={Mail}
              title="Website Inquiries"
              description="Contact forms, service requests, and career applicant inquiries."
              actionLabel={unreadInquiries > 0 ? `Review (${unreadInquiries})` : "View Inquiries"}
              badgeText={unreadInquiries > 0 ? `${unreadInquiries} unread` : undefined}
              badgeTone="amber"
            />
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
            <DepartmentCard
              href="/admin/blog"
              icon={Newspaper}
              title="Blog & Insights"
              description="Write, edit, and publish engineering and design articles to your public site."
              actionLabel="Manage Posts"
            />

            <DepartmentCard
              href="/admin/portfolio"
              icon={ImageIcon}
              title="Portfolio Case Studies"
              description="Showcase enterprise client deliveries, deliverables, tech stacks, and results."
              actionLabel="Manage Portfolio"
            />

            <DepartmentCard
              href="/admin/services"
              icon={Wrench}
              title="Services & Capabilities"
              description="Configure high-impact service catalog, delivery outcomes, and deliverables."
              actionLabel="Manage Services"
            />

            <DepartmentCard
              href="/admin/careers"
              icon={GraduationCap}
              title="Careers & Job Openings"
              description="Publish open positions and review job applicant resumes with 1-click onboarding."
              actionLabel="Manage Careers"
            />

            <DepartmentCard
              href="/admin/community"
              icon={Globe}
              title="Community Network"
              description="Review applicant profiles for the creator and engineer community circle."
              actionLabel="Open Community"
            />
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
            <DepartmentCard
              href="/admin/users"
              icon={Users}
              title="User Accounts"
              description="Manage staff logins, account statuses, Open.email mailboxes, and onboarding."
              actionLabel="Manage Users"
              badgeText={metrics?.pending && metrics.pending > 0 ? `${metrics.pending} pending` : `${metrics?.approved ?? 0} active`}
              badgeTone={metrics?.pending && metrics.pending > 0 ? "amber" : "green"}
            />

            <DepartmentCard
              href="/admin/roles"
              icon={Shield}
              title="Roles & Permissions"
              description="Configure hierarchy levels, create custom roles, and assign fine-grained permissions."
              actionLabel="Configure Roles"
              badgeText="RBAC Matrix"
            />

            <DepartmentCard
              href="/admin/settings"
              icon={Activity}
              title="Account Settings"
              description="Update your administrator profile, change password, and manage active sessions."
              actionLabel="Open Settings"
              badgeText="Account"
            />
          </div>
        </div>
      )}
    </div>
  );
}
