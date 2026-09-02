"use client";

import { useState } from "react";
import { Clock, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { useAdminUsers } from "@/hooks/useAdmin";
import { PLAYBOOKS, playbookDueDate } from "@/constants/playbooks";
import { useManagementProjects } from "@/hooks/useDashboard";
import { useCreateTask, useDeleteTask, useMyTasks, useTasks, useUpdateTask } from "@/hooks/useTasks";
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
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  projectId: "",
  assignedToId: "",
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

  // Playbook state: an onboarding set assigned to one person in one action.
  const [isPlaybookOpen, setPlaybookOpen] = useState(false);
  const [playbookId, setPlaybookId] = useState(PLAYBOOKS[0]?.id ?? "");
  const [playbookAssignee, setPlaybookAssignee] = useState("");
  const [playbookStart, setPlaybookStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [playbookError, setPlaybookError] = useState<string | null>(null);
  const [playbookBusy, setPlaybookBusy] = useState(false);

  // Both pickers hit gated routes and only matter while a drawer is open, so
  // they stay unfetched until an admin opens one.
  const pickersEnabled = isAdmin && (isFormOpen || isPlaybookOpen);
  const projectsQuery = useManagementProjects({ enabled: pickersEnabled });
  const usersQuery = useAdminUsers({ pageSize: 100 }, pickersEnabled);
  // `assigned_to_id` is a FK to users, not to the employee roster.
  const users = usersQuery.data?.data.items ?? [];

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  function openCreate(status = "todo") {
    setEditing(null);
    setForm({ ...EMPTY_FORM, status });
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(task: ProjectTask) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: dateInputValue(task.dueDate),
      projectId: task.projectId ?? "",
      assignedToId: task.assignedToId ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
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

    // An unpicked select posts "", which is not a UUID — send null instead so
    // the API reads it as “unassigned” rather than rejecting the whole task.
    const payload: CreateTaskPayload = {
      title,
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      projectId: form.projectId || null,
      assignedToId: form.assignedToId || null,
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

  const playbook = PLAYBOOKS.find((entry) => entry.id === playbookId) ?? PLAYBOOKS[0];

  /**
   * Assigns a whole playbook. Posted one at a time rather than in parallel so a
   * failure halfway through leaves a partial set the admin can see and finish,
   * instead of an unpredictable subset.
   */
  async function assignPlaybook(event: React.FormEvent) {
    event.preventDefault();
    if (!playbook) return;
    if (!playbookAssignee) {
      setPlaybookError(t("Choose who these tasks are for."));
      return;
    }

    setPlaybookError(null);
    setPlaybookBusy(true);
    try {
      for (const template of playbook.tasks) {
        await createTask.mutateAsync({
          title: template.title,
          description: template.description,
          status: "todo",
          priority: template.priority,
          dueDate: playbookDueDate(playbookStart, template.dueInDays),
          projectId: null,
          assignedToId: playbookAssignee,
        });
      }
      setPlaybookOpen(false);
      setPlaybookAssignee("");
    } catch (error) {
      setPlaybookError(
        error instanceof Error ? error.message : t("Could not assign this playbook."),
      );
    } finally {
      setPlaybookBusy(false);
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
            <button
              type="button"
              onClick={() => {
                setPlaybookError(null);
                setPlaybookOpen(true);
              }}
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

                    return (
                      <article
                        key={task.id}
                        className="group border p-4"
                        style={{
                          borderColor: "var(--adm-border)",
                          background: "var(--adm-surface-2)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-sm font-bold leading-tight"
                            style={{ color: "var(--adm-text)" }}
                          >
                            {task.title}
                          </h3>
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

                        {(task.projectName || task.assignedToName) && (
                          <div
                            className="mt-3 flex items-center justify-between gap-2 border-t pt-2 text-[11px]"
                            style={{
                              borderColor: "var(--adm-border)",
                              color: "var(--adm-text-2)",
                            }}
                          >
                            <span className="truncate">{task.projectName ?? ""}</span>
                            {task.assignedToName && (
                              <span className="shrink-0 font-semibold">{task.assignedToName}</span>
                            )}
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

            <AdminField label={t("Assign to")} htmlFor="task-assignee">
              <select
                id="task-assignee"
                value={form.assignedToId}
                onChange={field("assignedToId")}
                className={adminInputClass}
                style={adminInputStyle}
              >
                <option value="">{t("Unassigned")}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </AdminField>

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

      {isAdmin && playbook && (
        <AdminDrawer
          open={isPlaybookOpen}
          title={t("Assign playbook")}
          onClose={() => setPlaybookOpen(false)}
        >
          <form onSubmit={assignPlaybook} className="grid gap-5">
            <AdminField label={t("Playbook")} htmlFor="playbook-id">
              <select
                id="playbook-id"
                value={playbookId}
                onChange={(event) => setPlaybookId(event.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {PLAYBOOKS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {t(entry.name)}
                  </option>
                ))}
              </select>
              <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
                {t(playbook.summary)}
              </p>
            </AdminField>

            <AdminField label={t("Assign to")} htmlFor="playbook-assignee">
              <select
                id="playbook-assignee"
                required
                value={playbookAssignee}
                onChange={(event) => setPlaybookAssignee(event.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              >
                <option value="">{t("Choose a person…")}</option>
                {users.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name || option.email}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label={t("Start date")} htmlFor="playbook-start">
              <input
                id="playbook-start"
                type="date"
                required
                value={playbookStart}
                onChange={(event) => setPlaybookStart(event.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              />
              <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
                {t("Due dates are spread across the week from this date.")}
              </p>
            </AdminField>

            <ol className="grid gap-2">
              {playbook.tasks.map((template, index) => (
                <li
                  key={template.title}
                  className="flex items-start justify-between gap-3 border p-3 text-sm"
                  style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
                >
                  <span style={{ color: "var(--adm-text)" }}>
                    <span className="me-2 font-bold" style={{ color: "var(--adm-text-3)" }}>
                      {index + 1}.
                    </span>
                    {t(template.title)}
                  </span>
                  <span
                    className="shrink-0 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--adm-text-3)" }}
                  >
                    {playbookDueDate(playbookStart, template.dueInDays)}
                  </span>
                </li>
              ))}
            </ol>

            {playbookError && (
              <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
                {playbookError}
              </p>
            )}

            <AdminFormActions
              onCancel={() => setPlaybookOpen(false)}
              isPending={playbookBusy}
              submitLabel={t("Assign {count} tasks", { count: playbook.tasks.length })}
            />
          </form>
        </AdminDrawer>
      )}

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
    </div>
  );
}
