"use client";

/**
 * Hire every applicant in one pass.
 *
 * Onboarding one intern at a time means retyping the same four decisions per
 * person: role, team, a company address, a password. This takes the job
 * applications already sitting in Admin → Messages, proposes an account for
 * each, and lets the admin edit or drop any row before a single account exists.
 *
 * Two deliberate choices:
 *  - Accounts are created **sequentially**. Each one sends a welcome email, and
 *    a failure halfway through then leaves a partial set the admin can see and
 *    retry rather than an opaque all-or-nothing batch.
 *  - Nothing is created until "Create N accounts" is pressed. The suggested
 *    addresses are guesses from a first name; they are shown, numbered when they
 *    collide, and editable first.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, UserPlus } from "lucide-react";

import { AdminDrawer, AdminField, adminInputClass, adminInputStyle } from "@/components/admin/AdminUI";
import { useAdminRoles, useAdminTeams, useAdminUsers, useCreateAdminUser } from "@/hooks/useAdmin";
import { generatePassword } from "@/lib/credentials";
import { uniqueCompanyEmail } from "@/lib/onboarding-link";
import type { AdminUser } from "@/types";

/** One job application, reduced to what an account needs. */
export interface BulkApplicant {
  id: string;
  name: string;
  email: string;
}

type RowState = "ready" | "creating" | "done" | "failed";

interface Row {
  key: string;
  name: string;
  /** Where the credentials go — the address they applied from. */
  personalEmail: string;
  /** The account address, which is also the mailbox open.email provisions. */
  companyEmail: string;
  password: string;
  state: RowState;
  include: boolean;
  note?: string;
}

/**
 * Collapse repeat applications and propose an account per person.
 *
 * `takenEmails` and `takenNames` come from the existing user list: an address
 * already in use gets numbered, and a name already on the books starts excluded
 * so re-running this after a partial hire does not try to create duplicates.
 */
function seedRows(
  applicants: BulkApplicant[],
  takenEmails: string[],
  takenNames: string[],
): Row[] {
  const seen = new Set<string>();
  const claimed = [...takenEmails];
  const names = new Set(takenNames.map((value) => value.trim().toLowerCase()));

  const rows: Row[] = [];
  for (const applicant of applicants) {
    // The same person applying twice is one hire, not two accounts.
    const identity = (applicant.email || applicant.name).trim().toLowerCase();
    if (!identity || seen.has(identity)) continue;
    seen.add(identity);

    const companyEmail = uniqueCompanyEmail(applicant.name, claimed);
    if (companyEmail) claimed.push(companyEmail);

    const already = names.has(applicant.name.trim().toLowerCase());
    rows.push({
      key: applicant.id,
      name: applicant.name.trim(),
      personalEmail: applicant.email.trim(),
      companyEmail,
      password: generatePassword(),
      state: "ready",
      include: !already && Boolean(companyEmail),
      note: already
        ? "Someone with this name already has an account."
        : companyEmail
          ? undefined
          : "Give this account an address.",
    });
  }
  return rows;
}

export default function BulkOnboardDrawer({
  open,
  applicants,
  onClose,
}: {
  open: boolean;
  applicants: BulkApplicant[];
  onClose: () => void;
}) {
  // Existing accounts decide the address numbering and who has already been
  // hired, so the form is not built until they are known. Waiting here rather
  // than re-seeding once the query lands means an address the admin edited can
  // never be overwritten underneath them.
  const usersQuery = useAdminUsers({ pageSize: 200 }, open);
  const [running, setRunning] = useState(false);

  return (
    <AdminDrawer
      open={open}
      title="Hire all applicants"
      onClose={running ? () => undefined : onClose}
    >
      {usersQuery.isLoading ? (
        <p className="flex items-center gap-2 text-sm" style={{ color: "var(--adm-text-3)" }}>
          <Loader2 size={14} className="animate-spin" />
          Checking who already has an account…
        </p>
      ) : (
        <BulkOnboardForm
          applicants={applicants}
          users={usersQuery.data?.data.items ?? []}
          running={running}
          setRunning={setRunning}
          onClose={onClose}
        />
      )}
    </AdminDrawer>
  );
}

function BulkOnboardForm({
  applicants,
  users,
  running,
  setRunning,
  onClose,
}: {
  applicants: BulkApplicant[];
  users: AdminUser[];
  running: boolean;
  setRunning: (value: boolean) => void;
  onClose: () => void;
}) {
  const rolesQuery = useAdminRoles();
  const teamsQuery = useAdminTeams();
  const createUser = useCreateAdminUser();

  // Seeded once, on mount — which is the moment the drawer opens with the user
  // list already in hand. Closing unmounts this, so the next batch starts clean.
  const [rows, setRows] = useState<Row[]>(() =>
    seedRows(
      applicants,
      users.map((user) => user.email),
      users.map((user) => user.name),
    ),
  );
  const [roleSlug, setRoleSlug] = useState("member");
  const [teamId, setTeamId] = useState("");
  const [ran, setRan] = useState(false);

  const roles = rolesQuery.data?.data ?? [];
  const teams = teamsQuery.data?.data ?? [];

  function patch(key: string, changes: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...changes } : row)));
  }

  const selected = rows.filter((row) => row.include && row.state !== "done");
  const created = rows.filter((row) => row.state === "done").length;
  const failed = rows.filter((row) => row.state === "failed").length;
  const invalid = selected.filter((row) => !row.name || !row.companyEmail.includes("@"));
  const duplicated = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of selected) {
      const key = row.companyEmail.trim().toLowerCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1).map(([email]) => email);
  }, [selected]);

  const blocked = invalid.length > 0 || duplicated.length > 0;

  async function run() {
    setRunning(true);
    setRan(true);
    // Sequential: one welcome email per account, and a stop halfway leaves a
    // visible partial set instead of an unknown one.
    for (const row of rows) {
      if (!row.include || row.state === "done") continue;
      patch(row.key, { state: "creating", note: undefined });
      try {
        const res = await createUser.mutateAsync({
          name: row.name,
          email: row.companyEmail.trim(),
          password: row.password,
          roleSlug,
          teamId: teamId || undefined,
          status: "approved",
          sendWelcomeEmail: true,
          // Their own address: the company mailbox these credentials unlock
          // cannot be read until after the first sign-in.
          welcomeEmailTo: row.personalEmail || undefined,
        });
        patch(row.key, { state: "done", note: res.message });
      } catch (err) {
        patch(row.key, {
          state: "failed",
          note: err instanceof Error ? err.message : "Could not create this account.",
        });
      }
    }
    setRunning(false);
  }

  return (
    <>
      <p className="text-sm" style={{ color: "var(--adm-text-2)" }}>
        {rows.length} applicant{rows.length === 1 ? "" : "s"} from Messages. Each gets an approved
        account, a generated password, and a welcome email with those credentials sent to the address
        they applied from. Company addresses are suggestions — edit any of them before you start.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AdminField label="Role for everyone" htmlFor="bulk-role">
          <select
            id="bulk-role"
            value={roleSlug}
            onChange={(event) => setRoleSlug(event.target.value)}
            disabled={running}
            className={adminInputClass}
            style={adminInputStyle}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.slug}>
                {role.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Team (optional)" htmlFor="bulk-team">
          <select
            id="bulk-team"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            disabled={running}
            className={adminInputClass}
            style={adminInputStyle}
          >
            <option value="">No team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </AdminField>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((row) => (
          <div
            key={row.key}
            className="border p-3"
            style={{
              borderColor: row.state === "failed" ? "var(--adm-red)" : "var(--adm-border)",
              background: row.include ? "var(--adm-surface-2)" : "transparent",
              opacity: row.include || row.state === "done" ? 1 : 0.6,
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label={`Hire ${row.name}`}
                checked={row.include}
                disabled={running || row.state === "done"}
                onChange={(event) => patch(row.key, { include: event.target.checked })}
                className="mt-0.5 h-4 w-4 accent-adm-blue"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold" style={{ color: "var(--adm-text)" }}>
                    {row.name || "Unnamed applicant"}
                  </p>
                  {row.state === "creating" && (
                    <Loader2 size={14} className="shrink-0 animate-spin" style={{ color: "var(--adm-blue)" }} />
                  )}
                  {row.state === "done" && (
                    <Check size={14} className="shrink-0" style={{ color: "var(--adm-green)" }} />
                  )}
                  {row.state === "failed" && (
                    <AlertTriangle size={14} className="shrink-0" style={{ color: "var(--adm-red)" }} />
                  )}
                </div>
                <p className="truncate text-xs" style={{ color: "var(--adm-text-3)" }}>
                  Credentials to {row.personalEmail || "— no address on the application"}
                </p>
                <input
                  type="email"
                  value={row.companyEmail}
                  disabled={running || row.state === "done"}
                  onChange={(event) => patch(row.key, { companyEmail: event.target.value })}
                  placeholder="name@tauqeermustafa.tech"
                  aria-label={`Company address for ${row.name}`}
                  className="mt-2 w-full border px-2 py-1.5 text-xs outline-none transition focus:border-adm-blue"
                  style={adminInputStyle}
                />
                {row.note && (
                  <p
                    className="mt-1.5 text-[11px] leading-4"
                    style={{
                      color: row.state === "failed" ? "var(--adm-red)" : "var(--adm-text-3)",
                    }}
                  >
                    {row.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            No job applications to hire from yet.
          </p>
        )}
      </div>

      {blocked && (
        <p className="mt-4 text-xs font-semibold" style={{ color: "var(--adm-red)" }}>
          {duplicated.length > 0
            ? `Two accounts cannot share ${duplicated.join(", ")}. Give each a different address.`
            : "Every selected applicant needs a name and a company address."}
        </p>
      )}

      {ran && !running && (
        <div
          className="mt-4 border p-3 text-xs"
          style={{
            borderColor: failed ? "var(--adm-red)" : "var(--adm-green)",
            background: failed ? "var(--adm-red-light)" : "var(--adm-green-light)",
            color: "var(--adm-text)",
          }}
        >
          <p className="font-semibold">
            {created} account{created === 1 ? "" : "s"} created
            {failed ? `, ${failed} failed` : ""}.
          </p>
          {created > 0 && (
            <a
              href="/admin/tasks"
              className="mt-1.5 inline-block font-bold uppercase tracking-widest"
              style={{ color: "var(--adm-blue)" }}
            >
              Assign their trial playbook
            </a>
          )}
        </div>
      )}

      <div
        className="mt-8 flex items-center justify-end gap-3 border-t pt-6"
        style={{ borderColor: "var(--adm-border)" }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={running}
          className="border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-adm-surface-2 disabled:opacity-50"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
        >
          {ran && !running ? "Done" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={() => void run()}
          disabled={running || blocked || selected.length === 0}
          className="btn-press flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--adm-blue)" }}
        >
          {running ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          {running
            ? "Creating…"
            : failed > 0
              ? `Retry ${selected.length}`
              : `Create ${selected.length} account${selected.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </>
  );
}
