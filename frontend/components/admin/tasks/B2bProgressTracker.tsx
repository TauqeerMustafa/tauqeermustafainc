"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  HelpCircle,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import {
  EmptyBlock,
  LoadingBlock,
  Panel,
  StatCard,
} from "@/components/portal/PortalUI";
import PlaybookDrawer from "@/components/admin/tasks/PlaybookDrawer";
import { useAllAdminUsers } from "@/hooks/useAdmin";
import { useAllTasks } from "@/hooks/useTasks";
import type { AdminUser } from "@/types";
import type { ProjectTask } from "@/services/task.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Returns true if a task is assigned to the given userId. */
function isTaskAssignedTo(task: ProjectTask, userId: string): boolean {
  if (task.assignedToId === userId) return true;
  if (task.assignedToIds && task.assignedToIds.includes(userId)) return true;
  if (task.assignees && task.assignees.some((a) => a.id === userId)) return true;
  return false;
}

/** Returns true if a task has no assignees whatsoever. */
function isTaskUnassigned(task: ProjectTask): boolean {
  const hasPrimary = Boolean(task.assignedToId);
  const hasMulti = Boolean(task.assignedToIds && task.assignedToIds.length > 0);
  const hasAssignees = Boolean(task.assignees && task.assignees.length > 0);
  return !hasPrimary && !hasMulti && !hasAssignees;
}

// ---------------------------------------------------------------------------
// Per-member stats model
// ---------------------------------------------------------------------------

interface MemberTaskStats {
  user: AdminUser;
  total: number;
  done: number;
  inProgress: number;
  review: number;
  todo: number;
  pct: number;
  isAssigned: boolean;
}

type TabType = "all" | "assigned" | "unassigned" | "unassigned_tasks";

export default function B2bProgressTracker() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isPlaybookOpen, setPlaybookOpen] = useState(false);

  // Unlimited multi-page fetches that bypass backend 100 caps
  const usersQuery = useAllAdminUsers();
  const tasksQuery = useAllTasks();

  const isLoading = usersQuery.isLoading || tasksQuery.isLoading;
  const isError = usersQuery.isError || tasksQuery.isError;

  // Filter for approved B2B employees (role = member)
  const b2bMembers = useMemo<AdminUser[]>(() => {
    const all = usersQuery.data?.items ?? [];
    return all.filter(
      (u) => (u.roleSlug === "member" || (u as any).role_slug === "member") && u.status === "approved",
    );
  }, [usersQuery.data]);

  // All tasks in the company
  const allTasks = useMemo<ProjectTask[]>(() => {
    return tasksQuery.data?.items ?? [];
  }, [tasksQuery.data]);

  // Compute stats per member
  const memberStats = useMemo<MemberTaskStats[]>(() => {
    return b2bMembers.map((user) => {
      const assigned = allTasks.filter((t) => isTaskAssignedTo(t, user.id));
      const done = assigned.filter((t) => t.status === "done").length;
      const inProgress = assigned.filter((t) => t.status === "in_progress").length;
      const review = assigned.filter((t) => t.status === "review").length;
      const todo = assigned.filter((t) => t.status === "todo" || !t.status).length;
      const total = assigned.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        user,
        total,
        done,
        inProgress,
        review,
        todo,
        pct,
        isAssigned: total > 0,
      };
    });
  }, [b2bMembers, allTasks]);

  // Split assigned vs unassigned
  const assignedMembers = useMemo(
    () => memberStats.filter((m) => m.isAssigned),
    [memberStats],
  );
  const unassignedMembers = useMemo(
    () => memberStats.filter((m) => !m.isAssigned),
    [memberStats],
  );

  // Unassigned project tasks (no person attached)
  const unassignedTasks = useMemo(
    () => allTasks.filter(isTaskUnassigned),
    [allTasks],
  );

  // Collective progress metrics across all B2B employees
  const totalB2bTasks = useMemo(
    () => memberStats.reduce((acc, m) => acc + m.total, 0),
    [memberStats],
  );
  const collectiveDone = useMemo(
    () => memberStats.reduce((acc, m) => acc + m.done, 0),
    [memberStats],
  );
  const collectiveInProgress = useMemo(
    () => memberStats.reduce((acc, m) => acc + m.inProgress, 0),
    [memberStats],
  );
  const collectiveReview = useMemo(
    () => memberStats.reduce((acc, m) => acc + m.review, 0),
    [memberStats],
  );
  const collectiveTodo = useMemo(
    () => memberStats.reduce((acc, m) => acc + m.todo, 0),
    [memberStats],
  );
  const collectivePct = totalB2bTasks > 0 ? Math.round((collectiveDone / totalB2bTasks) * 100) : 0;

  // Filtered members list based on current tab
  const displayedMembers = useMemo(() => {
    if (activeTab === "assigned") return assignedMembers;
    if (activeTab === "unassigned") return unassignedMembers;
    return memberStats;
  }, [activeTab, memberStats, assignedMembers, unassignedMembers]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Playbook Drawer (Self-contained) ─────────────────────────── */}
      {isPlaybookOpen && (
        <PlaybookDrawer onClose={() => setPlaybookOpen(false)} />
      )}

      {/* ── Header Title & Actions ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold uppercase tracking-tight text-adm-text">
              B2B Workforce & Collective Progress
            </h2>
            <span className="rounded-full border border-adm-blue/30 bg-adm-blue-light px-2.5 py-0.5 text-xs font-bold text-adm-blue tabular-nums">
              {b2bMembers.length} Employees · {totalB2bTasks} Total Tasks
            </span>
          </div>
          <p className="mt-0.5 text-xs text-adm-text-3">
            Live exact accounting of assigned tasks, unassigned employees, and collective team completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              usersQuery.refetch();
              tasksQuery.refetch();
            }}
            disabled={isLoading}
            className="btn-press flex items-center gap-1.5 border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-semibold text-adm-text-2 transition hover:bg-adm-surface-2"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setPlaybookOpen(true)}
            className="btn-press flex items-center gap-1.5 border border-transparent bg-adm-blue px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            <ClipboardList size={14} />
            <span>Assign Playbook</span>
          </button>
        </div>
      </div>

      {/* ── Unassigned B2B Alert Banner ─────────────────────────────── */}
      {unassignedMembers.length > 0 && (
        <div className="flex flex-col gap-3 border border-adm-red/40 bg-adm-red-light p-4 text-adm-red sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-adm-red" />
            <div>
              <p className="text-sm font-bold">
                {unassignedMembers.length} B2B Employee{unassignedMembers.length > 1 ? "s" : ""} Have No Tasks Assigned!
              </p>
              <p className="text-xs text-adm-red/80">
                Unassigned:{" "}
                <span className="font-semibold">
                  {unassignedMembers.map((m) => m.user.name || m.user.email).join(", ")}
                </span>
                . They cannot work or report until tasks are assigned.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPlaybookOpen(true)}
            className="btn-press shrink-0 border border-adm-red bg-adm-red px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            Assign Week 1 Tasks Now
          </button>
        </div>
      )}

      {/* ── Summary Stat Cards (Exact Totals) ────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total B2B Employees"
          value={b2bMembers.length}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Assigned Employees"
          value={assignedMembers.length}
          icon={UserCheck}
          tone="green"
        />
        <StatCard
          label="Unassigned B2B"
          value={unassignedMembers.length}
          icon={UserX}
          tone={unassignedMembers.length > 0 ? "red" : "green"}
        />
        <StatCard
          label="Total Assigned Tasks"
          value={totalB2bTasks}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="Completed Tasks"
          value={collectiveDone}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Unassigned Tasks"
          value={unassignedTasks.length}
          icon={AlertTriangle}
          tone={unassignedTasks.length > 0 ? "amber" : "blue"}
        />
      </div>

      {/* ── Collective Progress Section ─────────────────────────────── */}
      <div className="border border-adm-border bg-adm-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-adm-blue" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-adm-text">
                Collective B2B Team Progress
              </h3>
            </div>
            <p className="mt-1 text-xs text-adm-text-3">
              Total work completed across all {b2bMembers.length} B2B employees combined
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-adm-text tabular-nums">
              {collectivePct}%
            </span>
            <div className="text-xs text-adm-text-3">
              <span className="font-bold text-adm-text">{collectiveDone}</span> of{" "}
              <span className="font-bold text-adm-text">{totalB2bTasks}</span> tasks done
            </div>
          </div>
        </div>

        {/* Collective Progress Bar */}
        <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full border border-adm-border bg-adm-surface-2">
          <div
            className="h-full rounded-full bg-adm-blue transition-all duration-500"
            style={{ width: `${Math.min(collectivePct, 100)}%` }}
          />
        </div>

        {/* Breakdown Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 font-medium text-adm-text">
            <span className="h-2 w-2 rounded-full bg-adm-text-3 shrink-0" />
            To Do: <strong className="tabular-nums">{collectiveTodo}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-adm-blue/30 bg-adm-blue-light px-3 py-1 font-medium text-adm-blue">
            <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
            In Progress: <strong className="tabular-nums">{collectiveInProgress}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-adm-amber/30 bg-adm-amber-light px-3 py-1 font-medium text-adm-amber">
            <span className="h-2 w-2 rounded-full bg-adm-amber shrink-0" />
            Review: <strong className="tabular-nums">{collectiveReview}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-adm-green/30 bg-adm-green-light px-3 py-1 font-medium text-adm-green">
            <span className="h-2 w-2 rounded-full bg-adm-green shrink-0" />
            Done: <strong className="tabular-nums">{collectiveDone}</strong>
          </span>
        </div>
      </div>

      {/* ── Tabbed View: Assigned / Unassigned Members / Unassigned Tasks ── */}
      <Panel
        title="B2B Workforce Breakdown"
        icon={Users}
        padded={false}
        action={
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "border-b-2 border-adm-blue text-adm-blue font-bold"
                  : "text-adm-text-3 hover:text-adm-text"
              }`}
            >
              All B2B ({b2bMembers.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("assigned")}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "assigned"
                  ? "border-b-2 border-adm-blue text-adm-blue font-bold"
                  : "text-adm-text-3 hover:text-adm-text"
              }`}
            >
              Assigned ({assignedMembers.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("unassigned")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "unassigned"
                  ? "border-b-2 border-adm-red text-adm-red font-bold"
                  : "text-adm-text-3 hover:text-adm-red"
              }`}
            >
              <span>Unassigned B2B ({unassignedMembers.length})</span>
              {unassignedMembers.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-adm-red shrink-0 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("unassigned_tasks")}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "unassigned_tasks"
                  ? "border-b-2 border-adm-amber text-adm-amber font-bold"
                  : "text-adm-text-3 hover:text-adm-amber"
              }`}
            >
              Unassigned Tasks ({unassignedTasks.length})
            </button>
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8">
            <LoadingBlock label="Calculating exact B2B task metrics…" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-adm-red">
            Could not fetch complete task data. Please click Refresh above.
          </div>
        ) : activeTab === "unassigned_tasks" ? (
          /* ── Unassigned Tasks Tab ── */
          unassignedTasks.length === 0 ? (
            <div className="p-8">
              <EmptyBlock
                title="No unassigned tasks"
                description="Every task in the system is currently assigned to an employee."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-adm-border bg-adm-surface-2 text-xs font-semibold uppercase text-adm-text-3">
                    <th className="px-4 py-2.5 text-left">Task Title</th>
                    <th className="px-4 py-2.5 text-left">Priority</th>
                    <th className="px-4 py-2.5 text-left">Status</th>
                    <th className="px-4 py-2.5 text-left">Due Date</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adm-border">
                  {unassignedTasks.map((t) => (
                    <tr key={t.id} className="transition hover:bg-adm-surface-2">
                      <td className="px-4 py-3 font-medium text-adm-text">
                        {t.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase rounded ${
                            t.priority === "high"
                              ? "bg-adm-red-light text-adm-red"
                              : t.priority === "medium"
                              ? "bg-adm-amber-light text-adm-amber"
                              : "bg-adm-surface-2 text-adm-text-3"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-adm-text-2 uppercase">
                        {t.status}
                      </td>
                      <td className="px-4 py-3 text-xs text-adm-text-3">
                        {t.dueDate || "No due date"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/tasks?edit=${t.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-adm-blue hover:underline"
                        >
                          Assign Now
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : displayedMembers.length === 0 ? (
          /* ── Empty State for Member Tabs ── */
          <div className="p-8">
            <EmptyBlock
              title={
                activeTab === "unassigned"
                  ? "All B2B Employees Are Assigned!"
                  : "No employees match this filter"
              }
              description={
                activeTab === "unassigned"
                  ? "Every single approved B2B member currently has tasks assigned on their board."
                  : "Check other tabs or create new employee accounts."
              }
            />
          </div>
        ) : (
          /* ── Members Table (Assigned & Unassigned) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-adm-border bg-adm-surface-2 text-xs font-semibold uppercase text-adm-text-3">
                  <th className="px-4 py-2.5 text-left">B2B Employee</th>
                  <th className="px-4 py-2.5 text-left">Progress</th>
                  <th className="px-4 py-2.5 text-left">Task Counts</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adm-border">
                {displayedMembers.map((item) => {
                  const { user, total, done, inProgress, todo, pct, isAssigned } = item;

                  return (
                    <tr
                      key={user.id}
                      className={`transition hover:bg-adm-surface-2 ${
                        !isAssigned ? "bg-adm-red-light/20" : ""
                      }`}
                    >
                      {/* Avatar, Name, Email, Staff ID */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center text-xs font-bold ${
                              isAssigned
                                ? "bg-adm-blue-light text-adm-blue"
                                : "bg-adm-red-light text-adm-red"
                            }`}
                          >
                            {initials(user.name)}
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate font-bold text-adm-text">
                              {user.name ?? "Unnamed"}
                            </span>
                            <span className="block truncate text-xs text-adm-text-3">
                              {user.email}
                              {user.openemailAddress && user.openemailAddress !== user.email
                                ? ` · ${user.openemailAddress}`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Progress Bar & % */}
                      <td className="px-4 py-3">
                        {isAssigned ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 w-32 overflow-hidden rounded-full border border-adm-border bg-adm-surface-2">
                              <div
                                className="h-full rounded-full bg-adm-blue transition-all duration-300"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-adm-text tabular-nums">
                              {pct}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-adm-red">
                            No tasks assigned
                          </span>
                        )}
                      </td>

                      {/* Exact Task Counts Breakdown */}
                      <td className="px-4 py-3">
                        {isAssigned ? (
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="font-bold text-adm-text">
                              {done} / {total} Completed
                            </span>
                            <span className="text-[11px] text-adm-text-3">
                              {todo} to do · {inProgress} active
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-adm-red/30 bg-adm-red-light px-2.5 py-0.5 text-[11px] font-bold text-adm-red">
                            0 Tasks
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        {!isAssigned ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-adm-red bg-adm-red-light px-2.5 py-0.5 text-xs font-bold text-adm-red">
                            <AlertCircle size={12} />
                            Unassigned
                          </span>
                        ) : done === total ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-adm-green bg-adm-green-light px-2.5 py-0.5 text-xs font-bold text-adm-green">
                            <CheckCircle2 size={12} />
                            All Done
                          </span>
                        ) : inProgress > 0 || done > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-adm-blue bg-adm-blue-light px-2.5 py-0.5 text-xs font-bold text-adm-blue">
                            <Clock size={12} />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-adm-amber bg-adm-amber-light px-2.5 py-0.5 text-xs font-bold text-adm-amber">
                            Not Started
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-4 py-3 text-right">
                        {!isAssigned ? (
                          <button
                            type="button"
                            onClick={() => setPlaybookOpen(true)}
                            className="btn-press inline-flex items-center gap-1 border border-adm-blue bg-adm-blue-light px-3 py-1 text-xs font-bold text-adm-blue transition hover:bg-adm-blue hover:text-white"
                          >
                            <Plus size={12} />
                            <span>Assign Tasks</span>
                          </button>
                        ) : (
                          <Link
                            href={`/admin/tasks?assignedToId=${user.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-adm-blue transition hover:underline"
                          >
                            <span>View Board</span>
                            <ArrowRight size={12} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

