"use client";

import { useState } from "react";
import {
  Check,
  CheckSquare,
  Clock,
  ClipboardList,
  Pencil,
  Plus,
  Square,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import PlaybookDrawer from "@/components/admin/tasks/PlaybookDrawer";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useManagementProjects } from "@/hooks/useDashboard";
import {
  useBulkDeleteTasks,
  useBulkUpdateTasks,
  useCreateTask,
  useDeleteAllTasks,
  useDeleteTask,
  useMyTasks,
  useTasks,
  useUpdateTask,
} from "@/hooks/useTasks";
import { useI18n } from "@/lib/i18n";
import type { CreateTaskPayload, ProjectTask } from "@/services";

const columns = [
  { id: "todo", title: "To Do", color: "var(--adm-surface-2)" },
  { id: "in_progress", title: "In Progress", color: "var(--adm-blue-light)" },
  { id: "review", title: "Review", color: "var(--adm-amber-light)" },
  { id: "done", title: "Done", color: "var(--adm-green-light)" },
];

const PRIORITIES = ["high", "medium", "low"] as const;

function priorityStyle(priority?: string | null) {
  if (priority === "high") return { background: "var(--adm-red-light)", color: "var(--adm-red)" };
  if (priority === "medium")
    return { background: "var(--adm-amber-light)", color: "var(--adm-amber)" };
  return { background: "var(--adm-green-light)", color: "var(--adm-green)" };
}

function formatDue(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** `<input type="date">` needs a bare `YYYY-MM-DD`, which is what the API sends. */
function dateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

type FormState = {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: string;
  assignedToId: string;
  assignedToIds: string[];
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  projectId: "",
  assignedToId: "",
  assignedToIds: [],
};

export default function TaskKanban({ isAdmin = false }) {
  const { t } = useI18n();

  // The `/tasks` list is manager-gated, so a member's board reads `/tasks/me`.
  // Only the matching query is enabled, or a member trips the 403.
  const adminQuery = useTasks({ pageSize: 100 }, isAdmin);
  const myQuery = useMyTasks(!isAdmin);
  const query = isAdmin ? adminQuery : myQuery;
  const tasks: ProjectTask[] = isAdmin ? adminQuery.data?.items ?? [] : myQuery.data ?? [];

  const [isFormOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectTask | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProjectTask | null>(null);

  // Playbook assignment lives in its own drawer — it fans one set out across
  // several people and owns the progress that goes with that.
  const [isPlaybookOpen, setPlaybookOpen] = useState(false);

  // Both pickers hit gated routes and only matter while a drawer is open, so
  // they stay unfetched until an admin opens one.
  const pickersEnabled = isAdmin && isFormOpen;
  const projectsQuery = useManagementProjects({ enabled: pickersEnabled });
  const usersQuery = useAdminUsers({ pageSize: 100 }, pickersEnabled);
  // `assigned_to_id` is a FK to users, not to the employee roster.
  const users = usersQuery.data?.data.items ?? [];

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const deleteAllTasks = useDeleteAllTasks();
  const [isClearAllOpen, setClearAllOpen] = useState(false);

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  const bulkDeleteTasks = useBulkDeleteTasks();
  const bulkUpdateTasks = useBulkUpdateTasks();

  function openCreate(status = "todo") {
    setEditing(null);
    setForm({ ...EMPTY_FORM, status });
    setAssigneeSearch("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(task: ProjectTask) {
    setEditing(task);
    const initialAssignees =
      task.assignedToIds && task.assignedToIds.length > 0
        ? task.assignedToIds
        : task.assignees && task.assignees.length > 0
        ? task.assignees.map((a) => a.id)
        : task.assignedToId
        ? [task.assignedToId]
        : [];

    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: dateInputValue(task.dueDate),
      projectId: task.projectId ?? "",
      assignedToId: task.assignedToId ?? initialAssignees[0] ?? "",
      assignedToIds: initialAssignees,
    });
    setAssigneeSearch("");
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setAssigneeSearch("");
    setFormError(null);
  }

  function toggleAssignee(userId: string) {
    setForm((prev) => {
      const exists = prev.assignedToIds.includes(userId);
      const updated = exists
        ? prev.assignedToIds.filter((id) => id !== userId)
        : [...prev.assignedToIds, userId];
      return {
        ...prev,
        assignedToIds: updated,
        assignedToId: updated[0] || "",
      };
    });
  }

  function toggleSelectTask(id: string) {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSelectAllTasks() {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t.id));
    }
  }

  async function handleBulkStatusChange(newStatus: string) {
    if (selectedTaskIds.length === 0) return;
    await bulkUpdateTasks.mutateAsync({ ids: selectedTaskIds, status: newStatus });
    setSelectedTaskIds([]);
  }

  async function handleBulkDelete() {
    if (selectedTaskIds.length === 0) return;
    await bulkDeleteTasks.mutateAsync({ ids: selectedTaskIds });
    setSelectedTaskIds([]);
    setBulkDeleteOpen(false);
  }

  function field<K extends keyof FormState>(key: K) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setFormError(t("A title is required."));
      return;
    }

    const assignedIds =
      form.assignedToIds.length > 0
        ? form.assignedToIds
        : form.assignedToId
        ? [form.assignedToId]
        : [];

    const payload: CreateTaskPayload = {
      title,
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      projectId: form.projectId || null,
      assignedToId: assignedIds[0] || null,
      assignedToIds: assignedIds,
    };

    setFormError(null);
    try {
      if (editing) await updateTask.mutateAsync({ id: editing.id, payload });
      else await createTask.mutateAsync(payload);
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("Could not save this task."));
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTask.mutateAsync(pendingDelete.id);
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            {t("Task Board")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin
              ? t("Assign, track and close delivery work across every project.")
              : t("Everything assigned to you, by stage.")}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <button
                type="button"
                onClick={() => setClearAllOpen(true)}
                className="btn-press flex items-center justify-center gap-2 border px-4 py-2.5 text-sm font-bold transition hover:opacity-90"
                style={{
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-red)",
                  background: "var(--adm-surface)",
                }}
              >
                <Trash2 size={16} />
                {t("Delete all tasks")}
              </button>
            )}
            {tasks.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAllTasks}
                className="btn-press flex items-center justify-center gap-2 border px-3 py-2 text-xs font-bold transition hover:opacity-90"
                style={{
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-text-2)",
                  background: "var(--adm-surface)",
                }}
              >
                {selectedTaskIds.length === tasks.length ? (
                  <>
                    <CheckSquare size={14} /> {t("Deselect all")}
                  </>
                ) : (
                  <>
                    <Square size={14} /> {t("Select all")}
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPlaybookOpen(true)}
              className="btn-press flex items-center justify-center gap-2 border px-5 py-2.5 text-sm font-bold transition hover:opacity-90"
              style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
            >
              <ClipboardList size={16} />
              {t("Assign playbook")}
            </button>
            <button
              type="button"
              onClick={() => openCreate()}
              className="btn-press flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: "var(--adm-blue)" }}
            >
              <Plus size={16} />
              {t("New Task")}
            </button>
          </div>
        )}
      </div>

      {isAdmin && selectedTaskIds.length > 0 && (
        <div
          className="sticky top-20 z-40 flex flex-wrap items-center justify-between gap-3 border p-3.5 shadow-lg backdrop-blur-md"
          style={{
            borderColor: "var(--adm-blue)",
            background: "var(--adm-surface)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-6 w-6 items-center justify-center text-xs font-mono font-bold text-white"
              style={{ background: "var(--adm-blue)" }}
            >
              {selectedTaskIds.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
              {selectedTaskIds.length} {selectedTaskIds.length === 1 ? t("task") : t("tasks")} {t("selected")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--adm-text-3)" }}>
              <span>{t("Move to:")}</span>
              {columns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleBulkStatusChange(col.id)}
                  disabled={bulkUpdateTasks.isPending}
                  className="btn-press border px-2.5 py-1 text-xs font-medium transition hover:border-adm-blue"
                  style={{
                    borderColor: "var(--adm-border)",
                    color: "var(--adm-text-2)",
                    background: "var(--adm-surface-2)",
                  }}
                >
                  {t(col.title)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkDeleteTasks.isPending}
              className="btn-press flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
              style={{
                borderColor: "var(--adm-red)",
                background: "var(--adm-red)",
              }}
            >
              <Trash2 size={13} />
              {t("Delete selected")}
            </button>

            <button
              type="button"
              onClick={() => setSelectedTaskIds([])}
              className="btn-press px-2.5 py-1.5 text-xs font-semibold hover:opacity-80"
              style={{ color: "var(--adm-text-3)" }}
            >
              {t("Clear")}
            </button>
          </div>
        </div>
      )}

      {query.isLoading ? (
        <div className="py-12 text-center text-sm" style={{ color: "var(--adm-text-3)" }}>
          {t("Loading tasks…")}
        </div>
      ) : query.isError ? (
        <div className="py-12 text-center text-sm" style={{ color: "var(--adm-red)" }}>
          {query.error instanceof Error ? query.error.message : t("Could not load tasks")}
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.id);

            return (
              <section
                key={column.id}
                className="flex flex-col border"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
              >
                <header
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: "var(--adm-border)", background: column.color }}
                >
                  <h2
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--adm-text)" }}
                  >
                    {t(column.title)}
                  </h2>
                  <span className="text-xs font-bold" style={{ color: "var(--adm-text-3)" }}>
                    {columnTasks.length}
                  </span>
                </header>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  {columnTasks.length === 0 && (
                    <p className="py-6 text-center text-xs" style={{ color: "var(--adm-text-3)" }}>
                      {t("Nothing here")}
                    </p>
                  )}

                  {columnTasks.map((task) => {
                    const due = formatDue(task.dueDate);
                    const isSelected = selectedTaskIds.includes(task.id);

                    return (
                      <article
                        key={task.id}
                        className={`group border p-4 transition ${
                          isSelected ? "ring-1 ring-adm-blue" : ""
                        }`}
                        style={{
                          borderColor: isSelected ? "var(--adm-blue)" : "var(--adm-border)",
                          background: "var(--adm-surface-2)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            {isAdmin && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectTask(task.id)}
                                className="mt-0.5 h-3.5 w-3.5 rounded-none border-adm-border text-adm-blue cursor-pointer"
                              />
                            )}
                            <h3
                              className="text-sm font-bold leading-tight"
                              style={{ color: "var(--adm-text)" }}
                            >
                              {task.title}
                            </h3>
                          </div>
                          {/* Task writes are admin-only, so the employee board
                              stays read-only. */}
                          {isAdmin && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(task)}
                                aria-label={`${t("Edit")} ${task.title}`}
                                title={t("Edit")}
                                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-adm-surface lg:opacity-0 lg:group-hover:opacity-100"
                                style={{ color: "var(--adm-text-3)" }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(task)}
                                aria-label={`${t("Delete")} ${task.title}`}
                                title={t("Delete")}
                                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-adm-red-light hover:text-adm-red lg:opacity-0 lg:group-hover:opacity-100"
                                style={{ color: "var(--adm-text-3)" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {task.description && (
                          <p
                            className="mt-2 line-clamp-3 text-xs"
                            style={{ color: "var(--adm-text-3)" }}
                          >
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={priorityStyle(task.priority)}
                          >
                            {t(task.priority || "low")}
                          </span>
                          {due && (
                            <span
                              className="flex items-center gap-1 text-[11px]"
                              style={{ color: "var(--adm-text-3)" }}
                            >
                              <Clock size={12} />
                              {due}
                            </span>
                          )}
                        </div>

                        {(task.projectName || (task.assignees && task.assignees.length > 0) || task.assignedToName) && (
                          <div
                            className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-[11px]"
                            style={{
                              borderColor: "var(--adm-border)",
                              color: "var(--adm-text-2)",
                            }}
                          >
                            <span className="truncate">{task.projectName ?? ""}</span>
                            {task.assignees && task.assignees.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-1">
                                {task.assignees.map((assignee) => (
                                  <span
                                    key={assignee.id}
                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                    style={{
                                      background: "var(--adm-surface)",
                                      border: "1px solid var(--adm-border)",
                                      color: "var(--adm-text-2)",
                                    }}
                                    title={assignee.email}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--adm-blue)" }} />
                                    {assignee.name}
                                  </span>
                                ))}
                              </div>
                            ) : task.assignedToName ? (
                              <span className="shrink-0 font-semibold">{task.assignedToName}</span>
                            ) : null}
                          </div>
                        )}
                      </article>
                    );
                  })}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => openCreate(column.id)}
                      className="mt-auto flex items-center justify-center gap-2 border border-dashed py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-adm-surface-2"
                      style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-3)" }}
                    >
                      <Plus size={14} />
                      {t("Add")}
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <AdminDrawer
          open={isFormOpen}
          title={editing ? t("Edit Task") : t("New Task")}
          onClose={closeForm}
        >
          <form onSubmit={handleSubmit} className="grid gap-5">
            <AdminField label={t("Title")} htmlFor="task-title">
              <input
                id="task-title"
                type="text"
                required
                value={form.title}
                onChange={field("title")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>

            <AdminField label={t("Description")} htmlFor="task-description">
              <textarea
                id="task-description"
                rows={3}
                value={form.description}
                onChange={field("description")}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>

            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label={t("Status")} htmlFor="task-status">
                <select
                  id="task-status"
                  value={form.status}
                  onChange={field("status")}
                  className={adminInputClass}
                  style={adminInputStyle}
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {t(column.title)}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label={t("Priority")} htmlFor="task-priority">
                <select
                  id="task-priority"
                  value={form.priority}
                  onChange={field("priority")}
                  className={adminInputClass}
                  style={adminInputStyle}
                >
                  {PRIORITIES.map((value) => (
                    <option key={value} value={value}>
                      {t(value)}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label={t("Due date")} htmlFor="task-due">
                <input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={field("dueDate")}
                  className={adminInputClass}
                  style={adminInputStyle}
                />
              </AdminField>

              <AdminField label={t("Project")} htmlFor="task-project">
                <select
                  id="task-project"
                  value={form.projectId}
                  onChange={field("projectId")}
                  className={adminInputClass}
                  style={adminInputStyle}
                >
                  <option value="">{t("No project")}</option>
                  {(projectsQuery.data ?? []).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--adm-text-2)" }}
              >
                {t("Assignees")} ({form.assignedToIds.length} {t("selected")})
              </label>

              {/* Selected chips */}
              {form.assignedToIds.length > 0 && (
                <div
                  className="mb-2 flex flex-wrap gap-1.5 border p-2"
                  style={{
                    borderColor: "var(--adm-border)",
                    background: "var(--adm-surface-2)",
                  }}
                >
                  {form.assignedToIds.map((uid) => {
                    const u = users.find((x) => x.id === uid);
                    return (
                      <span
                        key={uid}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          background: "var(--adm-surface)",
                          border: "1px solid var(--adm-border)",
                          color: "var(--adm-text)",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "var(--adm-blue)" }}
                        />
                        <span>{u ? u.name : uid}</span>
                        <button
                          type="button"
                          onClick={() => toggleAssignee(uid)}
                          className="ml-1 hover:opacity-75"
                          style={{ color: "var(--adm-text-3)" }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Filter and user checklist */}
              <input
                type="text"
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                placeholder={t("Filter staff to assign...")}
                className={`${adminInputClass} mb-1.5 text-xs py-1.5`}
                style={adminInputStyle}
              />
              <div
                className="max-h-44 space-y-0.5 overflow-y-auto border p-1"
                style={{
                  borderColor: "var(--adm-border)",
                  background: "var(--adm-surface)",
                }}
              >
                {users
                  .filter((u) => {
                    if (!assigneeSearch.trim()) return true;
                    const q = assigneeSearch.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q)
                    );
                  })
                  .map((user) => {
                    const isChecked = form.assignedToIds.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        onClick={() => toggleAssignee(user.id)}
                        className="flex cursor-pointer items-center justify-between p-2 text-xs transition hover:bg-adm-surface-2"
                        style={{
                          background: isChecked
                            ? "var(--adm-blue-light)"
                            : "transparent",
                          color: "var(--adm-text)",
                        }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="flex h-4 w-4 items-center justify-center border"
                            style={{
                              borderColor: isChecked
                                ? "var(--adm-blue)"
                                : "var(--adm-border)",
                              background: isChecked
                                ? "var(--adm-blue)"
                                : "transparent",
                              color: "white",
                            }}
                          >
                            {isChecked && <Check size={12} />}
                          </div>
                          <span className="truncate font-medium">
                            {user.name}
                          </span>
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "var(--adm-text-3)" }}
                          >
                            {user.email}
                          </span>
                        </div>
                        {user.teamName && (
                          <span
                            className="px-1.5 py-0.5 font-mono text-[10px]"
                            style={{
                              background: "var(--adm-surface-2)",
                              color: "var(--adm-text-3)",
                            }}
                          >
                            {user.teamName}
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>

            {formError && (
              <p className="text-sm" style={{ color: "var(--adm-red)" }}>
                {formError}
              </p>
            )}

            <AdminFormActions
              onCancel={closeForm}
              isPending={createTask.isPending || updateTask.isPending}
              submitLabel={editing ? t("Save") : t("Create task")}
            />
          </form>
        </AdminDrawer>
      )}

      {isAdmin && isPlaybookOpen && <PlaybookDrawer onClose={() => setPlaybookOpen(false)} />}

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title={t("Delete task")}
        description={
          pendingDelete
            ? t("“{title}” will be removed for everyone. This cannot be undone.", {
                title: pendingDelete.title,
              })
            : undefined
        }
        confirmLabel={t("Delete")}
        isPending={deleteTask.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {isAdmin && (
        <AdminConfirmDialog
          open={isBulkDeleteOpen}
          title={t("Delete selected tasks")}
          description={t(
            "Are you sure you want to permanently delete {count} selected tasks? This cannot be undone.",
            { count: selectedTaskIds.length },
          )}
          confirmLabel={t("Delete selected")}
          isPending={bulkDeleteTasks.isPending}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}

      {isAdmin && (
        <AdminConfirmDialog
          open={isClearAllOpen}
          title={t("Delete all tasks")}
          description={t(
            "Are you sure you want to delete all tasks? This will permanently remove all tasks assigned to users and projects. Only tasks will be deleted.",
          )}
          confirmLabel={t("Delete all tasks")}
          isPending={deleteAllTasks.isPending}
          onConfirm={async () => {
            const ids = tasks.map((t) => t.id);
            await deleteAllTasks.mutateAsync(ids);
            setClearAllOpen(false);
          }}
          onCancel={() => setClearAllOpen(false)}
        />
      )}
    </div>
  );
}
