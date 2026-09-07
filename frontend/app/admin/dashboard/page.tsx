"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Bell,
  CheckSquare,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  Users,
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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  if (isLoading) return <LoadingBlock label="Loading company overview…" />;
  if (isError || !data) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "Could not load the dashboard."}
        onRetry={() => refetch()}
      />
    );
  }

  const { overview, attendanceToday, pendingLeave, recentActivity, tasks, projects, announcements, documents } = data;
  const openTaskCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Company Overview"
        description="Live headcount, today's roster, and everything waiting on a decision."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Employees" value={overview.totalEmployees} icon={Users} href="/admin/employees" tone="blue" />
        <StatCard label="Present today" value={overview.present} icon={Clock} href="/admin/attendance" tone="green" />
        <StatCard label="On leave" value={overview.onLeave} icon={AlertCircle} href="/admin/leave" tone="amber" />
        <StatCard label="Open tasks" value={overview.openTasks} icon={CheckSquare} href="/admin/tasks" tone="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
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
        </div>

        <div className="flex flex-col gap-6">
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
