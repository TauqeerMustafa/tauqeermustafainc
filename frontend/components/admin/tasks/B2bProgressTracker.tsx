"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Users,
} from "lucide-react";

import {
  EmptyBlock,
  LoadingBlock,
  Panel,
  StatCard,
} from "@/components/portal/PortalUI";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useTasks } from "@/hooks/useTasks";
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

/** Defensively extract the user array from whatever shape the API returns. */
function extractUsers(data: unknown): AdminUser[] {
  if (!data) return [];
  const asAny = data as Record<string, unknown>;
  // Raw array
  if (Array.isArray(asAny)) return asAny as AdminUser[];
  // ApiResponse<PaginatedResponse<AdminUser>> → data.data.items
  if (asAny.data) {
    const inner = asAny.data as Record<string, unknown>;
    if (Array.isArray(inner)) return inner as AdminUser[];
    if (inner.items && Array.isArray(inner.items)) return inner.items as AdminUser[];
  }
  // PaginatedResponse<AdminUser> → data.items
  if (asAny.items && Array.isArray(asAny.items)) return asAny.items as AdminUser[];
  return [];
}

/** Returns true if a task is assigned to the given userId. */
function isAssignedTo(task: ProjectTask, userId: string): boolean {
  if (task.assignedToId === userId) return true;
  if (task.assignedToIds?.includes(userId)) return true;
  if (task.assignees?.some((a) => a.id === userId)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Per-member row data
// ---------------------------------------------------------------------------

interface MemberStats {
  user: AdminUser;
  total: number;
  done: number;
  pct: number;
}

type BadgeVariant = "allDone" | "inProgress" | "notStarted" | "missing";

function getBadge(stats: MemberStats): BadgeVariant {
  if (stats.total === 0) return "missing";
  if (stats.done === stats.total) return "allDone";
  if (stats.done > 0) return "inProgress";
  return "notStarted";
}

const BADGE_CONFIG: Record<
  BadgeVariant,
  { label: string; className: string }
> = {
  allDone: {
    label: "All Done",
    className: "bg-adm-green-light text-adm-green",
  },
  inProgress: {
    label: "In Progress",
    className: "bg-adm-blue-light text-adm-blue",
  },
  notStarted: {
    label: "Not Started",
    className: "bg-adm-amber-light text-adm-amber",
  },
  missing: {
    label: "Missing",
    className: "bg-adm-red-light text-adm-red",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function B2bProgressTracker() {
  const usersQuery = useAdminUsers({ pageSize: 500 });
  const tasksQuery = useTasks({ pageSize: 500 });

  const isLoading = usersQuery.isLoading || tasksQuery.isLoading;

  // Filter for approved members
  const members = useMemo<AdminUser[]>(() => {
    const all = extractUsers(usersQuery.data);
    return all.filter(
      (u) => u.roleSlug === "member" && u.status === "approved",
    );
  }, [usersQuery.data]);

  // All tasks — useTasks selects response.data (PaginatedResponse)
  const tasks = useMemo<ProjectTask[]>(() => {
    return tasksQuery.data?.items ?? [];
  }, [tasksQuery.data]);

  // Compute per-member stats
  const memberStats = useMemo<MemberStats[]>(() => {
    const stats: MemberStats[] = members.map((user) => {
      const assigned = tasks.filter((t) => isAssignedTo(t, user.id));
      const done = assigned.filter((t) => t.status === "done").length;
      const total = assigned.length;
      const pct = total > 0 ? (done / total) * 100 : 0;
      return { user, total, done, pct };
    });

    // Sort: missing (0 tasks) first, then by pct ascending (problem cases at top)
    return stats.sort((a, b) => {
      if (a.total === 0 && b.total !== 0) return -1;
      if (b.total === 0 && a.total !== 0) return 1;
      return a.pct - b.pct;
    });
  }, [members, tasks]);

  // Summary stats
  const totalMembers = memberStats.length;
  const fullyAssigned = memberStats.filter((s) => s.total >= 10).length;
  const missingTasks = memberStats.filter((s) => s.total === 0).length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total B2B Members"
          value={totalMembers}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Fully Assigned (≥10)"
          value={fullyAssigned}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Missing Tasks"
          value={missingTasks}
          icon={AlertCircle}
          tone="red"
        />
      </div>

      {/* ── Per-member progress table ───────────────────────────────────── */}
      <Panel title="B2B Member Task Progress" icon={BarChart3} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading member progress…" />
          </div>
        ) : memberStats.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title="No B2B members"
              description="There are no approved member-role users yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-adm-border bg-adm-surface-2">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-adm-text-3">
                    Member
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-adm-text-3">
                    Progress
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-adm-text-3">
                    Tasks
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-adm-text-3">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-adm-text-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adm-border">
                {memberStats.map(({ user, total, done, pct }) => {
                  const badge = getBadge({ user, total, done, pct });
                  const { label, className: badgeClass } = BADGE_CONFIG[badge];

                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-adm-surface-2"
                    >
                      {/* Avatar + name + email */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-adm-blue-light text-xs font-bold text-adm-blue">
                            {initials(user.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-adm-text">
                              {user.name ?? "Unnamed"}
                            </span>
                            <span className="block truncate text-xs text-adm-text-3">
                              {user.email ?? "—"}
                            </span>
                          </span>
                        </span>
                      </td>

                      {/* Progress bar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-40 overflow-hidden rounded-full border border-adm-border bg-adm-surface-2">
                            <div
                              className="h-full rounded-full bg-adm-blue transition-all"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-adm-text-3">
                            {total > 0 ? `${Math.round(pct)}%` : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Count pill */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-adm-border bg-adm-surface-2 px-2.5 py-0.5 text-xs font-semibold text-adm-text">
                          {done} / {total}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                        >
                          {label}
                        </span>
                      </td>

                      {/* Quick-link */}
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/tasks?assignedToId=${user.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-adm-blue transition hover:underline"
                        >
                          View Tasks
                          <ArrowRight size={12} />
                        </Link>
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
