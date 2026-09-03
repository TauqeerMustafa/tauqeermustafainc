"use client";

/**
 * Hand a playbook to a whole intake in one pass.
 *
 * A playbook is the same set of cards every time, so assigning it one person at a
 * time means repeating a dozen identical decisions per hire — and a trial set only
 * works if everybody starts it on the same day. This picks any number of people
 * and posts the set for all of them from one shared start date.
 *
 * The set is a starting point, not a fixed menu: every card's title, detail,
 * priority and due date is editable here, cards can be dropped, and one-off cards
 * can be added. A playbook that cannot be adjusted gets abandoned the first time
 * an intake needs twelve of its thirteen cards.
 *
 * Two deliberate choices, both matching the bulk-hire drawer:
 *  - Tasks are posted **sequentially**, one request each, so a failure halfway
 *    leaves a partial set the admin can see per person and retry, rather than an
 *    opaque batch.
 *  - Progress is reported per person, not as one bar. "Ayesha 13/13, Bilal 5/13"
 *    tells the admin who to chase; "62%" does not.
 */

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  AdminDrawer,
  AdminField,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { PLAYBOOKS, playbookDueDate, type Playbook } from "@/constants/playbooks";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useCreateTasks } from "@/hooks/useTasks";
import { useI18n } from "@/lib/i18n";
import { ROLE, normalizeRole } from "@/lib/rbac";
import type { CreateTaskPayload } from "@/services";

const PRIORITIES = ["high", "medium", "low"] as const;

/** Compact twin of `adminInputClass`: eight editable rows at the form-field size
 *  would be a page and a half of scrolling before the assign button. */
const rowInputClass =
  "w-full border rounded-none px-3 py-2 text-sm outline-none transition focus:border-adm-blue focus:ring-2 focus:ring-adm-blue/25";

/** `/admin/users` caps `page_size` at 100. Asking for more 422s and the picker
 *  comes back empty, which reads as "nobody works here". */
const PEOPLE_PAGE_SIZE = 100;

/** How far one person's set got. */
interface Progress {
  done: number;
  failed: number;
  error?: string;
}

/** One card in the set as edited, which is what actually gets posted. */
interface TaskRow {
  key: string;
  title: string;
  description: string;
  priority: string;
  /** The offset this row was seeded with, so a new start date can re-derive it. */
  dueInDays: number;
  dueDate: string;
  /** A hand-typed due date survives a start-date change; a derived one moves. */
  dueEdited: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

function seedRows(playbook: Playbook | undefined, start: string): TaskRow[] {
  return (playbook?.tasks ?? []).map((template, index) => ({
    key: `${playbook?.id ?? "none"}-${index}`,
    title: template.title,
    description: template.description,
    priority: template.priority,
    dueInDays: template.dueInDays,
    dueDate: playbookDueDate(start, template.dueInDays),
    dueEdited: false,
  }));
}

export default function PlaybookDrawer({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();

  // Mounted only while open, so this fetches once per opening and the run
  // below always starts from a clean slate.
  const usersQuery = useAdminUsers({ pageSize: PEOPLE_PAGE_SIZE });
  const assign = useCreateTasks();

  const [playbookId, setPlaybookId] = useState(PLAYBOOKS[0]?.id ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [start, setStart] = useState(today);
  const [rows, setRows] = useState<TaskRow[]>(() => seedRows(PLAYBOOKS[0], today()));
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [ran, setRan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only has to be unique within this opening — it keys React rows, nothing more.
  const customCount = useRef(0);

  const playbook = PLAYBOOKS.find((entry) => entry.id === playbookId) ?? PLAYBOOKS[0];
  const busy = assign.isPending;
  const perPerson = rows.length;
  const total = perPerson * picked.length;
  const edited = playbook ? JSON.stringify(rows) !== JSON.stringify(seedRows(playbook, start)) : false;

  // Tasks are staff work. `assigned_to_id` accepts any user, but a client has no
  // task board to open them in — the same line the backend draws in
  // `onboarding.is_staff_user`, which also counts a roleless account as staff.
  const people = useMemo(
    () =>
      (usersQuery.data?.data.items ?? []).filter(
        (user) => normalizeRole(user.roleSlug) !== ROLE.CLIENT,
      ),
    [usersQuery.data],
  );

  // A failed fetch and an empty company look identical in the list, so say which.
  const peopleError = usersQuery.isError
    ? usersQuery.error instanceof Error
      ? usersQuery.error.message
      : t("Could not load people.")
    : null;

  const allPicked = people.length > 0 && picked.length === people.length;

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }

  function changePlaybook(id: string) {
    setPlaybookId(id);
    // A different playbook is a different set — nothing to carry over.
    setRows(seedRows(PLAYBOOKS.find((entry) => entry.id === id), start));
  }

  function changeStart(value: string) {
    setStart(value);
    // Moving the start moves the week with it, but a date typed by hand stays put.
    setRows((prev) =>
      prev.map((row) =>
        row.dueEdited ? row : { ...row, dueDate: playbookDueDate(value, row.dueInDays) },
      ),
    );
  }

  function editRow(key: string, patch: Partial<TaskRow>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    customCount.current += 1;
    setRows((prev) => [
      ...prev,
      {
        key: `custom-${customCount.current}`,
        title: "",
        description: "",
        priority: "medium",
        dueInDays: 0,
        dueDate: playbookDueDate(start, 0),
        dueEdited: false,
      },
    ]);
  }

  async function run(event: React.FormEvent) {
    event.preventDefault();
    if (picked.length === 0) {
      setError(t("Choose at least one person."));
      return;
    }
    if (rows.length === 0) {
      setError(t("Add at least one task."));
      return;
    }
    if (rows.some((row) => !row.title.trim())) {
      setError(t("Every task needs a title."));
      return;
    }

    // Person-major, so `owners[i]` names whose card `payloads[i]` is and progress
    // can be attributed without doing arithmetic on the index.
    const owners: string[] = [];
    const payloads: CreateTaskPayload[] = [];
    for (const userId of picked) {
      for (const row of rows) {
        owners.push(userId);
        payloads.push({
          title: row.title.trim(),
          description: row.description.trim() || null,
          status: "todo",
          priority: row.priority,
          dueDate: row.dueDate || null,
          projectId: null,
          assignedToId: userId,
        });
      }
    }

    setError(null);
    setRan(true);
    setProgress(Object.fromEntries(picked.map((id) => [id, { done: 0, failed: 0 }])));

    try {
      await assign.mutateAsync({
        payloads,
        onResult: (index, failure) => {
          const owner = owners[index];
          setProgress((prev) => {
            const entry = prev[owner] ?? { done: 0, failed: 0 };
            return {
              ...prev,
              [owner]: failure
                ? { ...entry, failed: entry.failed + 1, error: failure.message }
                : { ...entry, done: entry.done + 1 },
            };
          });
        },
      });
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : t("Could not assign this playbook."),
      );
    }
  }

  const entries = Object.values(progress);
  const created = entries.reduce((sum, entry) => sum + entry.done, 0);
  const failed = entries.reduce((sum, entry) => sum + entry.failed, 0);
  // One line per distinct cause: a whole set failing for the same reason is one
  // problem, not thirteen.
  const causes = [...new Set(entries.map((entry) => entry.error).filter(Boolean))] as string[];

  function submitLabel() {
    if (busy) return t("Assigning…");
    if (picked.length === 0) return t("Assign playbook");
    if (picked.length === 1) return t("Assign {tasks} tasks", { tasks: total });
    return t("Assign {tasks} tasks to {people} people", {
      tasks: total,
      people: picked.length,
    });
  }

  return (
    <AdminDrawer open width="wide" title={t("Assign playbook")} onClose={busy ? () => undefined : onClose}>
      {!playbook ? (
        <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
          {t("No playbooks are defined yet.")}
        </p>
      ) : (
        <form onSubmit={run} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label={t("Playbook")} htmlFor="playbook-id">
              <select
                id="playbook-id"
                value={playbookId}
                onChange={(event) => changePlaybook(event.target.value)}
                disabled={busy}
                className={adminInputClass}
                style={adminInputStyle}
              >
                {PLAYBOOKS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {t(entry.name)}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label={t("Start date")} htmlFor="playbook-start">
              <input
                id="playbook-start"
                type="date"
                required
                value={start}
                onChange={(event) => changeStart(event.target.value)}
                disabled={busy}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>
          </div>

          <p className="-mt-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
            {t(playbook.summary)}{" "}
            {t("Due dates follow the start date, for everyone picked.")}
          </p>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--adm-text-2)" }}
              >
                {t("Assign to")}
                {picked.length > 0 && ` · ${picked.length}`}
              </span>
              <button
                type="button"
                onClick={() => setPicked(allPicked ? [] : people.map((person) => person.id))}
                disabled={busy || people.length === 0}
                className="text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                style={{ color: "var(--adm-blue)" }}
              >
                {allPicked ? t("Clear all") : t("Select all {count}", { count: people.length })}
              </button>
            </div>

            {usersQuery.isLoading && (
              <p
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--adm-text-3)" }}
              >
                <Loader2 size={14} className="animate-spin" />
                {t("Loading people…")}
              </p>
            )}

            {peopleError && (
              <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
                {peopleError}
              </p>
            )}

            {people.length > 0 && (
              <div
                className="grid max-h-64 gap-1 overflow-y-auto border p-2"
                style={{ borderColor: "var(--adm-border)" }}
              >
                {people.map((person) => {
                  const state = progress[person.id];
                  const settled = state ? state.done + state.failed >= perPerson : false;

                  return (
                    <label
                      key={person.id}
                      className="flex items-center gap-3 p-2 text-sm transition hover:bg-adm-surface-2"
                      style={{
                        background: picked.includes(person.id)
                          ? "var(--adm-surface-2)"
                          : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={picked.includes(person.id)}
                        disabled={busy}
                        onChange={() => toggle(person.id)}
                        className="h-4 w-4 shrink-0 accent-adm-blue"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate font-semibold"
                          style={{ color: "var(--adm-text)" }}
                        >
                          {person.name || person.email}
                        </span>
                        {/* The address is how the admin knows which account this
                            is, so it shows whether or not there is a name. */}
                        <span
                          className="block truncate text-xs"
                          style={{ color: "var(--adm-text-3)" }}
                        >
                          {person.email}
                          {person.roleName ? ` · ${person.roleName}` : ""}
                        </span>
                      </span>
                      {state && (
                        <span
                          className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold"
                          style={{
                            color: state.failed
                              ? "var(--adm-red)"
                              : settled
                                ? "var(--adm-green)"
                                : "var(--adm-blue)",
                          }}
                        >
                          {!settled ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : state.failed ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <Check size={12} />
                          )}
                          {state.done}/{perPerson}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {!usersQuery.isLoading && !peopleError && people.length === 0 && (
              <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
                {t("No staff accounts to assign to yet.")}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--adm-text-2)" }}
              >
                {t("Tasks")}
                {perPerson > 0 && ` · ${perPerson}`}
                {picked.length > 1 && ` × ${picked.length}`}
              </span>
              <div className="flex items-center gap-3">
                {edited && (
                  <button
                    type="button"
                    onClick={() => setRows(seedRows(playbook, start))}
                    disabled={busy}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                    style={{ color: "var(--adm-text-3)" }}
                  >
                    <RotateCcw size={11} />
                    {t("Reset")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={addRow}
                  disabled={busy}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                  style={{ color: "var(--adm-blue)" }}
                >
                  <Plus size={11} />
                  {t("Add task")}
                </button>
              </div>
            </div>

            <ol className="grid gap-2">
              {rows.map((row, index) => (
                <li
                  key={row.key}
                  className="grid gap-2 border p-3"
                  style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 shrink-0 text-xs font-bold"
                      style={{ color: "var(--adm-text-3)" }}
                    >
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={row.title}
                      onChange={(event) => editRow(row.key, { title: event.target.value })}
                      disabled={busy}
                      required
                      aria-label={t("Task title")}
                      placeholder={t("Task title")}
                      className={rowInputClass}
                      style={adminInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((entry) => entry.key !== row.key))}
                      disabled={busy}
                      aria-label={`${t("Remove")} ${row.title || t("Task title")}`}
                      title={t("Remove")}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-adm-red-light hover:text-adm-red disabled:opacity-50"
                      style={{ color: "var(--adm-text-3)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 ps-7">
                    <div className="w-32">
                      <select
                        value={row.priority}
                        onChange={(event) => editRow(row.key, { priority: event.target.value })}
                        disabled={busy}
                        aria-label={t("Priority")}
                        className={rowInputClass}
                        style={adminInputStyle}
                      >
                        {PRIORITIES.map((value) => (
                          <option key={value} value={value}>
                            {t(value)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-44">
                      <input
                        type="date"
                        value={row.dueDate}
                        onChange={(event) =>
                          editRow(row.key, { dueDate: event.target.value, dueEdited: true })
                        }
                        disabled={busy}
                        aria-label={t("Due date")}
                        className={rowInputClass}
                        style={adminInputStyle}
                      />
                    </div>
                  </div>

                  {/* Collapsed by default: the detail is long, and eight of them
                      open at once would bury the list. */}
                  <details className="ps-7">
                    <summary
                      className="cursor-pointer list-none text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--adm-text-3)" }}
                    >
                      {t("Details")}
                    </summary>
                    <textarea
                      rows={4}
                      value={row.description}
                      onChange={(event) => editRow(row.key, { description: event.target.value })}
                      disabled={busy}
                      aria-label={t("Description")}
                      className={`${rowInputClass} mt-2`}
                      style={adminInputStyle}
                    />
                  </details>
                </li>
              ))}
            </ol>

            {rows.length === 0 && (
              <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
                {t("No tasks left in this set — add one, or reset the playbook.")}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
              {error}
            </p>
          )}

          {ran && !busy && (
            <div
              className="border p-3 text-xs"
              style={{
                borderColor: failed ? "var(--adm-red)" : "var(--adm-green)",
                background: failed ? "var(--adm-red-light)" : "var(--adm-green-light)",
                color: "var(--adm-text)",
              }}
            >
              <p className="font-semibold">
                {t("{created} tasks assigned across {people} people", {
                  created,
                  people: picked.length,
                })}
                {failed ? ` — ${t("{count} failed", { count: failed })}` : ""}
              </p>
              {causes.map((cause) => (
                <p key={cause} className="mt-1" style={{ color: "var(--adm-red)" }}>
                  {cause}
                </p>
              ))}
            </div>
          )}

          <div
            className="mt-3 flex items-center justify-end gap-3 border-t pt-6"
            style={{ borderColor: "var(--adm-border)" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-adm-surface-2 disabled:opacity-50"
              style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
            >
              {ran && !busy ? t("Done") : t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={busy || picked.length === 0 || rows.length === 0}
              className="btn-press flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--adm-blue)" }}
            >
              {busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ClipboardList size={13} />
              )}
              {submitLabel()}
            </button>
          </div>
        </form>
      )}
    </AdminDrawer>
  );
}
