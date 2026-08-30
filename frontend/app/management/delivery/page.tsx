"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, FolderKanban, ListChecks, Search } from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useManagementDashboard, useManagementProjects } from "@/hooks/useDashboard";
import { useTasks } from "@/hooks/useTasks";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Slim progress bar. Width is inline because the percentage is data. */
function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-adm-surface-2">
        <div className="h-full bg-adm-blue" style={{ width: `${clamped}%` }} />
      </div>
      <span className="tabular-nums text-xs text-adm-text-2">{clamped}%</span>
    </div>
  );
}

export default function ManagementDeliveryPage() {
  const summary = useManagementDashboard();
  const projects = useManagementProjects();
  const overdue = useTasks({ overdue: true, pageSize: 50 });
  const [query, setQuery] = useState("");

  const overview = summary.data?.overview;
  const rows = projects.data ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((project) =>
      [project.name, project.clientName, project.status]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle)),
    );
  }, [rows, query]);

  const overdueTasks = overdue.data?.items ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Delivery"
        description="Every project on the books, its progress, and the work running late."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Active projects"
          value={overview?.activeProjects ?? "—"}
          icon={FolderKanban}
          hint={`${rows.length} total on the books`}
        />
        <StatCard
          label="Open tasks"
          value={overview?.openTasks ?? "—"}
          icon={ListChecks}
          tone="neutral"
        />
        <StatCard
          label="Overdue tasks"
          value={overview?.overdueTasks ?? "—"}
          icon={AlertTriangle}
          tone={overview && overview.overdueTasks > 0 ? "red" : "neutral"}
        />
      </div>

      <Panel
        title={`Projects (${filtered.length})`}
        icon={FolderKanban}
        padded={false}
        action={
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-adm-text-3"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
              className={`${inputClass} w-52 pl-9`}
            />
          </div>
        }
      >
        {projects.isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading projects…" />
          </div>
        ) : projects.isError ? (
          <div className="p-5">
            <ErrorBlock
              message={
                projects.error instanceof Error
                  ? projects.error.message
                  : "Could not load projects."
              }
              onRetry={() => projects.refetch()}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title={query ? "No matches" : "No projects"}
              description={query ? "Try a different search term." : "Nothing is on the books yet."}
            />
          </div>
        ) : (
          <DataTable
            head={["Project", "Client", "Status", "Progress", "Open", "Overdue", "Next milestone"]}
          >
            {filtered.map((project) => (
              <tr key={project.id} className="transition hover:bg-adm-surface-2">
                <Td strong>
                  <span className="block truncate">{project.name}</span>
                  {project.summary ? (
                    <span className="block truncate text-xs font-normal text-adm-text-3">
                      {project.summary}
                    </span>
                  ) : null}
                </Td>
                <Td>{project.clientName ?? "—"}</Td>
                <Td>
                  <StatusPill status={project.status} />
                </Td>
                <Td>
                  <Progress value={project.progress} />
                </Td>
                <Td className="tabular-nums">{project.openTasks}</Td>
                <Td className="tabular-nums">
                  {project.overdueTasks > 0 ? (
                    <span className="font-bold text-adm-red">{project.overdueTasks}</span>
                  ) : (
                    project.overdueTasks
                  )}
                </Td>
                <Td className="max-w-xs truncate">{project.nextMilestone || "—"}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <Panel title={`Overdue work (${overdueTasks.length})`} icon={AlertTriangle} padded={false}>
        {overdue.isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading overdue tasks…" />
          </div>
        ) : overdue.isError ? (
          <div className="p-5">
            <ErrorBlock
              message={
                overdue.error instanceof Error
                  ? overdue.error.message
                  : "Could not load overdue tasks."
              }
              onRetry={() => overdue.refetch()}
            />
          </div>
        ) : overdueTasks.length === 0 ? (
          <div className="p-5">
            <EmptyBlock title="Nothing overdue" description="Every open task is on schedule." />
          </div>
        ) : (
          <DataTable head={["Task", "Project", "Assignee", "Due", "Status"]}>
            {overdueTasks.map((task) => (
              <tr key={task.id} className="transition hover:bg-adm-surface-2">
                <Td strong>{task.title}</Td>
                <Td>{task.projectName ?? "—"}</Td>
                <Td>{task.assignedToName ?? "Unassigned"}</Td>
                <Td className="text-adm-red">{formatDate(task.dueDate)}</Td>
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
