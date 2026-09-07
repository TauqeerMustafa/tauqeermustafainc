"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Plane,
  Users,
} from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  SegmentBar,
  StatCard,
  StatusPill,
  Td,
} from "@/components/portal/PortalUI";
import { useManagementDashboard } from "@/hooks/useDashboard";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ManagementDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useManagementDashboard();

  if (isLoading) return <LoadingBlock label="Loading leadership overview…" />;
  if (isError || !data) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "Could not load the overview."}
        onRetry={() => refetch()}
      />
    );
  }

  const { overview, attendanceToday, delivery, pendingLeave, tasks, projects } = data;
  const rosterTotal =
    attendanceToday.present + attendanceToday.late + attendanceToday.absent + attendanceToday.onLeave;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Leadership overview"
        description="Headcount, attendance, approvals and delivery health for today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Headcount"
          value={overview.headcount}
          icon={Users}
          href="/management/headcount"
          hint="Active employee records"
        />
        <StatCard
          label="Present today"
          value={overview.presentToday}
          icon={CheckCircle2}
          tone="green"
          href="/management/attendance"
          hint={`${overview.onLeaveToday} on approved leave`}
        />
        <StatCard
          label="Awaiting approval"
          value={overview.pendingApprovals}
          icon={Plane}
          tone={overview.pendingApprovals > 0 ? "amber" : "neutral"}
          href="/management/attendance"
          hint="Leave requests in the queue"
        />
        <StatCard
          label="Overdue tasks"
          value={overview.overdueTasks}
          icon={AlertTriangle}
          tone={overview.overdueTasks > 0 ? "red" : "neutral"}
          href="/management/delivery"
          hint={`${overview.openTasks} open in total`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Attendance today" icon={CalendarClock}>
          {rosterTotal === 0 ? (
            <EmptyBlock
              title="Nothing recorded yet"
              description="No one has checked in for today."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <SegmentBar
                segments={[
                  { value: attendanceToday.present, tone: "green" },
                  { value: attendanceToday.late, tone: "amber" },
                  { value: attendanceToday.onLeave, tone: "blue" },
                  { value: attendanceToday.absent, tone: "red" },
                ]}
              />
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  { label: "Present", value: attendanceToday.present },
                  { label: "Late", value: attendanceToday.late },
                  { label: "On leave", value: attendanceToday.onLeave },
                  { label: "Absent", value: attendanceToday.absent },
                ].map((cell) => (
                  <div key={cell.label}>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-adm-text-3">
                      {cell.label}
                    </dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums text-adm-text">
                      {cell.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </Panel>

        <Panel title="Delivery mix" icon={FolderKanban}>
          {delivery.length === 0 ? (
            <EmptyBlock title="No projects" description="Nothing is on the books yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {delivery.map((stage) => (
                <li key={stage.key} className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate text-adm-text-2">{stage.label}</span>
                  <span className="font-bold tabular-nums text-adm-text">{stage.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Approval queue" icon={Plane} padded={false}>
          {pendingLeave.length === 0 ? (
            <div className="p-5">
              <EmptyBlock title="Queue is clear" description="No leave is awaiting a decision." />
            </div>
          ) : (
            <DataTable head={["Employee", "Type", "From", "To"]}>
              {pendingLeave.map((request) => (
                <tr key={request.id} className="transition hover:bg-adm-surface-2">
                  <Td strong>{request.employee}</Td>
                  <Td className="capitalize">{request.leaveType ?? "—"}</Td>
                  <Td>{formatDate(request.startDate)}</Td>
                  <Td>{formatDate(request.endDate)}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <Panel title="Active projects" icon={FolderKanban} padded={false}>
          {projects.length === 0 ? (
            <div className="p-5">
              <EmptyBlock title="No projects" description="Nothing to report on yet." />
            </div>
          ) : (
            <DataTable head={["Project", "Status", "Progress"]}>
              {projects.map((project) => (
                <tr key={project.id} className="transition hover:bg-adm-surface-2">
                  <Td strong>{project.name}</Td>
                  <Td>
                    <StatusPill status={project.status} />
                  </Td>
                  <Td className="tabular-nums">{project.progress}%</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      </div>

      <Panel title="Next up" icon={AlertTriangle} padded={false}>
        {tasks.length === 0 ? (
          <div className="p-5">
            <EmptyBlock title="Nothing open" description="Every task is closed out." />
          </div>
        ) : (
          <DataTable head={["Task", "Status"]}>
            {tasks.map((task) => (
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
  );
}