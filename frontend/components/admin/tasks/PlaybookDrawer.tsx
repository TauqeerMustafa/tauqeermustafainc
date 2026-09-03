"use client";

/**
 * Hand a playbook to a whole intake in one pass.
 *
 * A playbook is the same eight cards every time, so assigning it one person at a
 * time means repeating eight identical decisions per hire — and the week-one set
 * only works if everybody starts it on the same day. This picks any number of
 * people and posts the set for all of them from one shared start date.
 *
 * Two deliberate choices, both matching the bulk-hire drawer:
 *  - Tasks are posted **sequentially**, one request each, so a failure halfway
 *    leaves a partial set the admin can see per person and retry, rather than an
 *    opaque batch.
 *  - Progress is reported per person, not as one bar. "Ayesha 8/8, Bilal 5/8"
 *    tells the admin who to chase; "62%" does not.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ClipboardList, Loader2 } from "lucide-react";

import {
  AdminDrawer,
  AdminField,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { PLAYBOOKS, playbookDueDate } from "@/constants/playbooks";
import { useAdminUsers } from "@/hooks/useAdmin";
import { useCreateTasks } from "@/hooks/useTasks";
import { useI18n } from "@/lib/i18n";
import { ROLE, normalizeRole } from "@/lib/rbac";
import type { CreateTaskPayload } from "@/services";

/** How far one person's set got. */
interface Progress {
  done: number;
  failed: number;
  error?: string;
}

export default function PlaybookDrawer({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();

  // Mounted only while open, so this fetches once per opening and the run
  // below always starts from a clean slate.
  const usersQuery = useAdminUsers({ pageSize: 200 });
  const assign = useCreateTasks();

  const [playbookId, setPlaybookId] = useState(PLAYBOOKS[0]?.id ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [ran, setRan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playbook = PLAYBOOKS.find((entry) => entry.id === playbookId) ?? PLAYBOOKS[0];
  const busy = assign.isPending;
  const perPerson = playbook?.tasks.length ?? 0;
  const total = perPerson * picked.length;

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

  const allPicked = people.length > 0 && picked.length === people.length;

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }

  async function run(event: React.FormEvent) {
    event.preventDefault();
    if (!playbook) return;
    if (picked.length === 0) {
      setError(t("Choose at least one person."));
      return;
    }

    // Person-major, so `owners[i]` names whose card `payloads[i]` is and progress
    // can be attributed without doing arithmetic on the index.
    const owners: string[] = [];
    const payloads: CreateTaskPayload[] = [];
    for (const userId of picked) {
      for (const template of playbook.tasks) {
        owners.push(userId);
        payloads.push({
          title: template.title,
          description: template.description,
          status: "todo",
          priority: template.priority,
          dueDate: playbookDueDate(start, template.dueInDays),
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
  // One line per distinct cause: eight cards failing for the same reason is one
  // problem, not eight.
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
    <AdminDrawer
      open
      title={t("Assign playbook")}
      onClose={busy ? () => undefined : onClose}
    >
      {!playbook ? (
        <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
          {t("No playbooks are defined yet.")}
        </p>
      ) : (
        <form onSubmit={run} className="grid gap-5">
          <AdminField label={t("Playbook")} htmlFor="playbook-id">
            <select
              id="playbook-id"
              value={playbookId}
              onChange={(event) => setPlaybookId(event.target.value)}
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
            <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
              {t(playbook.summary)}
            </p>
          </AdminField>

          <AdminField label={t("Start date")} htmlFor="playbook-start">
            <input
              id="playbook-start"
              type="date"
              required
              value={start}
              onChange={(event) => setStart(event.target.value)}
              disabled={busy}
              className={adminInputClass}
              style={adminInputStyle}
            />
            <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
              {t("Due dates are spread across the week from this date, for everyone picked.")}
            </p>
          </AdminField>

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
                        <span
                          className="block truncate text-xs"
                          style={{ color: "var(--adm-text-3)" }}
                        >
                          {person.roleName || person.email}
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

            {!usersQuery.isLoading && people.length === 0 && (
              <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
                {t("No staff accounts to assign to yet.")}
              </p>
            )}
          </div>

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
                  {playbookDueDate(start, template.dueInDays)}
                </span>
              </li>
            ))}
          </ol>

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
              disabled={busy || picked.length === 0}
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
