"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader, AdminEmptyState, AdminLoadingState, AdminErrorState, AdminDrawer, AdminField, AdminFormActions, adminInputClass } from "@/components/admin/AdminUI";
import { taskService } from "@/services/task.service";
import { adminService } from "@/services/admin.service";
import { Plus, CheckSquare, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminTasksPage() {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assigned_to_id: "",
    due_date: "",
  });

  const { data: tasksRes, isLoading, isError } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: () => taskService.list(),
  });
  
  const { data: usersRes } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.users({ pageSize: 100 }),
  });

  const tasks = tasksRes?.data?.items || [];
  const users = usersRes?.data?.items || [];

  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Task created");
      setDrawerOpen(false);
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; payload: any }) => taskService.update(args.id, args.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Task updated");
      setDrawerOpen(false);
    },
    onError: () => toast.error("Failed to update task"),
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("Task deleted");
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", status: "todo", priority: "medium", assigned_to_id: "", due_date: "" });
    setDrawerOpen(true);
  };

  const openEdit = (task: any) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assigned_to_id: task.assigned_to_id || "",
      due_date: task.due_date ? task.due_date.substring(0,10) : "",
    });
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this task?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.assigned_to_id) delete (payload as any).assigned_to_id;
    if (!payload.due_date) delete (payload as any).due_date;

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getStatusColor = (s: string) => {
    if (s === "done") return "bg-green-100 text-green-800";
    if (s === "in_progress") return "bg-blue-100 text-blue-800";
    if (s === "review") return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };
  
  const getPriorityColor = (p: string) => {
    if (p === "high") return "text-red-600 font-semibold";
    if (p === "medium") return "text-orange-600";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tasks & Projects"
        description="Assign work to employees and track project milestones."
        actionLabel="New Task"
        onAction={openCreate}
      />

      {isLoading ? <AdminLoadingState label="Loading tasks..." /> : null}
      {isError ? <AdminErrorState message="Could not load tasks." /> : null}

      {!isLoading && !isError && tasks.length === 0 ? (
        <AdminEmptyState title="No tasks found" description="Create a new task to get started." />
      ) : null}

      {!isLoading && !isError && tasks.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface)] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[var(--adm-text-2)]">Task</th>
                <th className="px-4 py-3 font-semibold text-[var(--adm-text-2)]">Assignee</th>
                <th className="px-4 py-3 font-semibold text-[var(--adm-text-2)]">Status</th>
                <th className="px-4 py-3 font-semibold text-[var(--adm-text-2)]">Priority</th>
                <th className="px-4 py-3 font-semibold text-right text-[var(--adm-text-2)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adm-border)]">
              {tasks.map((task) => {
                const assignee = users.find(u => u.id === task.assigned_to_id);
                return (
                  <tr key={task.id} className="transition hover:bg-[var(--adm-surface-2)]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--adm-text)]">{task.title}</p>
                      {task.due_date && <p className="text-xs text-[var(--adm-text-3)]">Due: {task.due_date}</p>}
                    </td>
                    <td className="px-4 py-3 text-[var(--adm-text-2)]">
                      {assignee ? assignee.name : <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(task)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--adm-border)] text-[var(--adm-text-2)] transition hover:text-[var(--adm-text)]"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--adm-border)] text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <AdminDrawer
        open={drawerOpen}
        title={editing ? "Edit Task" : "New Task"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Task Title" htmlFor="t-title">
            <input
              id="t-title"
              required
              className={adminInputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminField>
          
          <AdminField label="Description" htmlFor="t-desc">
            <textarea
              id="t-desc"
              rows={4}
              className={adminInputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>

          <AdminField label="Assignee (Employee)" htmlFor="t-assignee">
            <select
              id="t-assignee"
              className={adminInputClass}
              value={form.assigned_to_id}
              onChange={(e) => setForm({ ...form, assigned_to_id: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </AdminField>

          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Status" htmlFor="t-status">
              <select
                id="t-status"
                className={adminInputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </AdminField>
            
            <AdminField label="Priority" htmlFor="t-priority">
              <select
                id="t-priority"
                className={adminInputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </AdminField>
          </div>
          
          <AdminField label="Due Date" htmlFor="t-due">
            <input
              id="t-due"
              type="date"
              className={adminInputClass}
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </AdminField>

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={createMutation.isPending || updateMutation.isPending} />
        </form>
      </AdminDrawer>
    </div>
  );
}
