"use client";

/**
 * The staff Projects page, shared by `/admin/projects` and `/employees/projects`.
 *
 * The two callers read different endpoints on purpose: `/dashboard/projects` is
 * manager-gated (admin + exec + team_lead) and returns the whole delivery book,
 * so a member hitting it would 403. `/dashboard/projects/me` returns only the
 * projects the caller has tasks on, with task counts scoped to their own work.
 */

import { FolderOpen, Users, Clock, AlertTriangle } from "lucide-react";

import { useManagementProjects, useMyProjects } from "@/hooks/useDashboard";
import type { ManagementProjectRow } from "@/types/hr";

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  live: { bg: "var(--adm-green-light)", fg: "var(--adm-green)" },
  review: { bg: "var(--adm-amber-light)", fg: "var(--adm-amber)" },
  discovery: { bg: "var(--adm-surface-2)", fg: "var(--adm-text-2)" },
};

function statusTone(status: string) {
  return STATUS_TONE[status] ?? { bg: "var(--adm-blue-light)", fg: "var(--adm-blue)" };
}

function formatUpdated(value: string | null) {
  if (!value) return "No updates yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No updates yet";
  return `Updated ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}`;
}

export default function ProjectsGrid({ isAdmin = false }: { isAdmin?: boolean }) {
  // Both hooks are declared unconditionally (hook rules) but only the one for
  // this audience is enabled, so a member never fires the manager-gated call.
  const managerQuery = useManagementProjects({ enabled: isAdmin });
  const myQuery = useMyProjects({ enabled: !isAdmin });
  const query = isAdmin ? managerQuery : myQuery;

  const projects: ManagementProjectRow[] = query.data ?? [];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            Projects Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin
              ? "Every active company project with its live delivery load."
              : "The projects you are assigned to, with your open work on each."}
          </p>
        </div>
      </div>

      {query.isError ? (
        <div
          className="border p-5 text-sm"
          role="alert"
          style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}
        >
          {query.error instanceof Error ? query.error.message : "Could not load projects."}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {query.isLoading ? (
          <div className="col-span-full py-12 text-center" style={{ color: "var(--adm-text-3)" }}>
            Loading projects...
          </div>
        ) : projects.length === 0 && !query.isError ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
            <FolderOpen size={48} className="mb-4" style={{ color: "var(--adm-text-3)" }} />
            <p className="font-bold" style={{ color: "var(--adm-text)" }}>No active projects</p>
            <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
              {isAdmin
                ? "Projects appear here once a client workspace has one."
                : "You have not been assigned to any project yet."}
            </p>
          </div>
        ) : (
          projects.map((project) => {
            const tone = statusTone(project.status);
            const progress = Math.min(100, Math.max(0, project.progress));
            return (
              <div
                key={project.id}
                className="border p-6 flex flex-col"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: tone.bg, color: tone.fg }}
                  >
                    {project.status.replace(/_/g, " ")}
                  </div>
                  {project.overdueTasks > 0 ? (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--adm-red)" }}
                      title={`${project.overdueTasks} task(s) past due`}
                    >
                      <AlertTriangle size={13} /> {project.overdueTasks} overdue
                    </span>
                  ) : null}
                </div>

                <h3 className="text-xl font-bold mb-1 line-clamp-2" style={{ color: "var(--adm-text)" }}>
                  {project.name}
                </h3>
                {project.clientName ? (
                  <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--adm-text-3)" }}>
                    {project.clientName}
                  </p>
                ) : null}
                {project.summary ? (
                  <p className="text-sm mb-5 line-clamp-2" style={{ color: "var(--adm-text-3)" }}>
                    {project.summary}
                  </p>
                ) : null}

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2" style={{ color: "var(--adm-text-3)" }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden mb-5" style={{ background: "var(--adm-surface-2)" }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: progress === 100 ? "var(--adm-green)" : "var(--adm-blue)" }}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--adm-border)" }}>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--adm-text-2)" }}>
                      <Users size={16} /> {project.openTasks} {isAdmin ? "open" : "of mine open"}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--adm-text-2)" }}>
                      <Clock size={16} /> {project.nextMilestone || formatUpdated(project.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
