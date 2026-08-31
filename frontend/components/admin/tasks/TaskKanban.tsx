"use client";

import { Clock, MoreHorizontal, Plus } from "lucide-react";

import { useMyTasks, useTasks } from "@/hooks/useTasks";
import type { ProjectTask } from "@/services";

const columns = [
  { id: "todo", title: "To Do", color: "var(--adm-surface-2)" },
  { id: "in_progress", title: "In Progress", color: "var(--adm-blue-light)" },
  { id: "review", title: "Review", color: "var(--adm-amber-light)" },
  { id: "done", title: "Done", color: "var(--adm-green-light)" },
];

function priorityStyle(priority?: string | null) {
  if (priority === "high") return { background: "var(--adm-red-light)", color: "var(--adm-red)" };
  if (priority === "medium") return { background: "var(--adm-amber-light)", color: "var(--adm-amber)" };
  return { background: "var(--adm-green-light)", color: "var(--adm-green)" };
}

function formatDue(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TaskKanban({ isAdmin = false }) {
  // `/tasks` is manager-gated, so the admin board reads the full list while an
  // employee's board reads `/tasks/me`. Only one query is ever enabled — the
  // other stays idle so a member never trips the 403 on the manager-only list.
  const adminQuery = useTasks({ pageSize: 100 }, isAdmin);
  const myQuery = useMyTasks(!isAdmin);
  const query = isAdmin ? adminQuery : myQuery;
  const tasks: ProjectTask[] = isAdmin ? adminQuery.data?.items ?? [] : myQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6 h-full min-h-[70vh]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Task Board</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>{isAdmin ? "Manage team tasks across the organization." : "Track and update your assigned tasks."}</p>
        </div>
        {isAdmin && (
          <button className="btn-press flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90" style={{ background: "var(--adm-blue)" }}>
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {query.isError && (
        <div className="border p-4 text-sm" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}>
          {query.error instanceof Error ? query.error.message : "Could not load tasks. Confirm the backend is running and reachable."}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {columns.map((col) => {
          const colTasks = tasks.filter((task) => task.status === col.id);
          return (
            <div key={col.id} className="p-5 flex flex-col gap-4 border" style={{ background: col.color, borderColor: "var(--adm-border)" }}>
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold uppercase tracking-wide" style={{ color: "var(--adm-text)" }}>{col.title}</h3>
                <span className="text-xs font-bold px-2.5 py-1 border" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}>
                  {query.isLoading ? "…" : colTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {query.isLoading ? (
                  <div className="text-center text-sm py-4" style={{ color: "var(--adm-text-3)" }}>Loading…</div>
                ) : colTasks.length === 0 ? (
                  <div className="text-center text-xs py-4" style={{ color: "var(--adm-text-3)" }}>Nothing here.</div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="p-4 border transition hover:border-adm-border-2" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5" style={priorityStyle(task.priority)}>
                          {task.priority}
                        </span>
                        <button style={{ color: "var(--adm-text-3)" }} aria-label="Task actions"><MoreHorizontal size={16} /></button>
                      </div>
                      <h4 className="font-bold text-sm mb-3 leading-snug" style={{ color: "var(--adm-text)" }}>{task.title}</h4>

                      <div className="flex items-center justify-between text-xs font-medium pt-3 border-t" style={{ color: "var(--adm-text-3)", borderColor: "var(--adm-border)" }}>
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-adm-blue-light text-adm-blue flex items-center justify-center font-bold text-[8px]">
                            {task.assignedToName?.charAt(0) ?? "U"}
                          </div>
                          <span className="truncate max-w-[80px]">{task.assignedToName ?? "Unassigned"}</span>
                        </div>
                        {formatDue(task.dueDate) && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} /> {formatDue(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
