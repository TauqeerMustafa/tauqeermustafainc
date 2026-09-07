"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  LogOut,
} from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  Label,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  StatCard,
  StatusPill,
} from "@/components/portal/PortalUI";
import { useCheckIn, useCheckOut } from "@/hooks/useAttendance";
import { useEmployeeDashboard } from "@/hooks/useDashboard";
import { useCurrentUser } from "@/hooks/useAuth";

function formatTime(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function EmployeeDashboardPage() {
  const { data: me } = useCurrentUser();
  const { data, isLoading, isError, error, refetch } = useEmployeeDashboard();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const firstName = me?.data?.name?.split(" ")[0] ?? "there";

  if (isLoading) return <LoadingBlock label="Loading your day…" />;
  if (isError || !data) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "Could not load your dashboard."}
        onRetry={() => refetch()}
      />
    );
  }

  const { attendance, tasks, leave, projects, announcements, documents, notifications } = data;
  const openTasks = tasks.filter((t) => t.status !== "done");
  const checkedIn = Boolean(attendance.checkInTime);
  const checkedOut = Boolean(attendance.checkOutTime);
  const mutating = checkIn.isPending || checkOut.isPending;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title={`${greeting()}, ${firstName}`}
        description="Your attendance, assigned work, and everything the company published for you."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Attendance" icon={Clock} tone={checkedIn ? "green" : "amber"}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xl font-bold uppercase text-adm-text">
                {checkedIn && <CheckCircle2 size={18} className="text-adm-green" />}
                <StatusPill status={attendance.status} />
              </p>
              <p className="mt-2 text-xs text-adm-text-3">
                {checkedIn ? `In at ${formatTime(attendance.checkInTime)}` : "Not checked in yet"}
                {checkedOut ? ` · Out at ${formatTime(attendance.checkOutTime)}` : ""}
              </p>
            </div>
            <Link
              href="/employees/attendance"
              className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline"
            >
              Log
            </Link>
          </div>

          <div className="mt-5">
            {!checkedIn ? (
              <PortalButton icon={Clock} disabled={mutating} onClick={() => checkIn.mutate(undefined)}>
                {checkIn.isPending ? "Checking in…" : "Check in"}
              </PortalButton>
            ) : !checkedOut ? (
              <PortalButton
                variant="ghost"
                icon={LogOut}
                disabled={mutating}
                onClick={() => checkOut.mutate(undefined)}
              >
                {checkOut.isPending ? "Checking out…" : "Check out"}
              </PortalButton>
            ) : (
              <p className="text-xs text-adm-text-3">Day closed. See you tomorrow.</p>
            )}
            {(checkIn.isError || checkOut.isError) && (
              <p className="mt-3 text-xs text-adm-red">
                {((checkIn.error ?? checkOut.error) as Error | undefined)?.message ??
                  "Could not record that. Try again."}
              </p>
            )}
          </div>
        </Panel>

        <StatCard
          label="Open tasks"
          value={openTasks.length}
          icon={CheckSquare}
          href="/employees/tasks"
          hint="Require your attention"
        />
        <StatCard
          label="Pending leave"
          value={leave.pendingCount}
          icon={CalendarDays}
          href="/employees/leave"
          tone="amber"
          hint="Awaiting approval"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Panel
            title="Today's work"
            icon={CheckSquare}
            padded={false}
            action={
              <Link href="/employees/tasks" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Board
              </Link>
            }
          >
            {tasks.length === 0 ? (
              <div className="p-5">
                <EmptyBlock title="Nothing assigned" description="No tasks on your plate today." />
              </div>
            ) : (
              <ul className="divide-y divide-adm-border">
                {tasks.slice(0, 6).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <span
                      className={`min-w-0 truncate text-sm font-semibold ${
                        task.status === "done" ? "text-adm-text-3 line-through" : "text-adm-text"
                      }`}
                    >
                      {task.title}
                    </span>
                    <StatusPill status={task.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Active projects"
            icon={FolderKanban}
            padded={false}
            action={
              <Link href="/employees/projects" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Hub
              </Link>
            }
          >
            {projects.length === 0 ? (
              <div className="p-5">
                <EmptyBlock title="No projects" description="You are not on a project team yet." />
              </div>
            ) : (
              <ul className="divide-y divide-adm-border">
                {projects.map((project) => (
                  <li key={project.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <span className="truncate text-sm font-semibold text-adm-text">{project.name}</span>
                    <StatusPill status={project.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel
            title="Announcements"
            icon={Bell}
            tone="red"
            padded={false}
            action={
              <Link href="/employees/announcements" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Read all
              </Link>
            }
          >
            {announcements.length === 0 ? (
              <p className="p-5 text-sm text-adm-text-3">No recent announcements.</p>
            ) : (
              <ul className="divide-y divide-adm-border">
                {announcements.map((item) => (
                  <li key={item.id} className="px-5 py-4">
                    <p className="text-sm font-semibold text-adm-text">{item.title}</p>
                    <p className="mt-0.5 text-xs text-adm-text-3">{formatDate(item.publishedAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Documents"
            icon={FileText}
            padded={false}
            action={
              <Link href="/employees/documents" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Vault
              </Link>
            }
          >
            {documents.length === 0 ? (
              <p className="p-5 text-sm text-adm-text-3">Vault is empty.</p>
            ) : (
              <ul className="divide-y divide-adm-border">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-adm-surface-2 text-adm-blue">
                      <FileText size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-adm-text">{doc.title}</span>
                      <Label>{doc.type}</Label>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {notifications.length > 0 && (
            <Panel title="Notifications" icon={Bell} padded={false}>
              <ul className="divide-y divide-adm-border">
                {notifications.slice(0, 5).map((note) => (
                  <li key={note.id} className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-adm-text">{note.title}</p>
                    {note.body && <p className="mt-0.5 text-xs text-adm-text-2">{note.body}</p>}
                    <p className="mt-0.5 text-xs text-adm-text-3">{formatDate(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
