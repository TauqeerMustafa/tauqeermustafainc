"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Calendar, Clock } from "lucide-react";

export default function TaskKanban({ isAdmin = false }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(isAdmin ? "/api/tasks" : "/api/tasks?my_tasks=true")
      .then(res => res.json())
      .then(data => setTasks(data.data?.items || []))
      .catch(() => {
        // Mock data
        setTasks([
          { id: "1", title: "Update CRM records", status: "todo", priority: "high", due_date: "2024-11-15", assigned_to_name: "Alice Smith" },
          { id: "2", title: "Review marketing copy", status: "in_progress", priority: "medium", due_date: "2024-11-10", assigned_to_name: "Bob Johnson" },
          { id: "3", title: "Weekly report", status: "done", priority: "low", due_date: "2024-11-05", assigned_to_name: "You" },
        ]);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const columns = [
    { id: "todo", title: "To Do", color: "var(--adm-surface-2)" },
    { id: "in_progress", title: "In Progress", color: "var(--adm-blue-light)" },
    { id: "done", title: "Done", color: "var(--adm-green-light)" }
  ];

  const getPriorityStyle = (p: string) => {
    if (p === 'high') return { background: "var(--adm-red-light)", color: "var(--adm-red)" };
    if (p === 'medium') return { background: "var(--adm-amber-light)", color: "var(--adm-amber)" };
    return { background: "var(--adm-green-light)", color: "var(--adm-green)" };
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {columns.map(col => (
          <div key={col.id} className="p-5 flex flex-col gap-4 border" style={{ background: col.color, borderColor: "var(--adm-border)" }}>
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold uppercase tracking-wide" style={{ color: "var(--adm-text)" }}>{col.title}</h3>
              <span className="text-xs font-bold px-2.5 py-1 border" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="text-center text-sm py-4" style={{ color: "var(--adm-text-3)" }}>Loading...</div>
              ) : tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="p-4 border cursor-grab transition hover:border-adm-border-2" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5" style={getPriorityStyle(task.priority)}>
                      {task.priority}
                    </span>
                    <button style={{ color: "var(--adm-text-3)" }}><MoreHorizontal size={16} /></button>
                  </div>
                  <h4 className="font-bold text-sm mb-3 leading-snug" style={{ color: "var(--adm-text)" }}>{task.title}</h4>

                  <div className="flex items-center justify-between text-xs font-medium pt-3 border-t" style={{ color: "var(--adm-text-3)", borderColor: "var(--adm-border)" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-adm-blue-light text-adm-blue flex items-center justify-center font-bold text-[8px]">
                        {task.assigned_to_name?.charAt(0) || "U"}
                      </div>
                      <span className="truncate max-w-[80px]">{task.assigned_to_name || "Unassigned"}</span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} /> {task.due_date}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
