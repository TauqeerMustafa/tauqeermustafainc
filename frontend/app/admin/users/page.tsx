"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Clock3, ListChecks, Loader2, Mail, MailPlus, MailWarning, MoreHorizontal, PauseCircle, Search, ShieldCheck, Trash2, UserRound, X } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminField,
  AdminFormActions,
  AdminLoadingState,
  AdminPageHeader,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { useAdminMetrics, useAdminRoles, useAdminTeams, useAdminUsers, useCreateAdminUser, useDeleteAdminUser, useProvisionAllMailboxes, useProvisionMailbox, useUpdateAdminUser } from "@/hooks/useAdmin";
import { generatePassword } from "@/lib/credentials";
import { readOnboardPrefill, suggestCompanyEmail } from "@/lib/onboarding-link";
import type { AdminUser, UserStatus } from "@/types";
import type { CreateAdminUserPayload } from "@/services/admin.service";

const statusOptions: Array<{ value: UserStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending approval" },
  { value: "approved", label: "Approved" },
  { value: "suspended", label: "Suspended" },
  { value: "rejected", label: "Rejected" },
];

const emptyForm: CreateAdminUserPayload = {
  name: "",
  email: "",
  password: "",
  phone: "",
  roleSlug: "exec",
  teamId: "",
  status: "approved",
  sendWelcomeEmail: true,
  welcomeEmailTo: "",
};

const statusStyles: Record<UserStatus, { label: string; background: string; color: string }> = {
  pending: { label: "Pending", background: "var(--adm-amber-light)", color: "var(--adm-amber)" },
  approved: { label: "Approved", background: "var(--adm-green-light)", color: "var(--adm-green)" },
  suspended: { label: "Suspended", background: "var(--adm-red-light)", color: "var(--adm-red)" },
  rejected: { label: "Rejected", background: "var(--adm-surface-2)", color: "var(--adm-text-3)" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CreateAdminUserPayload>(emptyForm);
  // True while the drawer holds an applicant pulled off Messages, so the copy
  // and the post-create nudge can speak to onboarding rather than a bare add.
  const [fromApplication, setFromApplication] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{ name: string; address?: string | null; hasMailbox?: boolean; note?: string; offerPlaybook?: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [provisionNotice, setProvisionNotice] = useState<string | null>(null);
  const [provisioningId, setProvisioningId] = useState<string | null>(null);

  const queryParams = useMemo(() => ({ pageSize: 50, search: search.trim() || undefined, status }), [search, status]);
  const usersQuery = useAdminUsers(queryParams);
  const rolesQuery = useAdminRoles();
  const teamsQuery = useAdminTeams();
  const metricsQuery = useAdminMetrics();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const provisionMailbox = useProvisionMailbox();
  const provisionAll = useProvisionAllMailboxes();

  const users = usersQuery.data?.data.items ?? [];
  const roles = rolesQuery.data?.data ?? [];
  const teams = teamsQuery.data?.data ?? [];
  const missingMailbox = users.filter((user) => !user.hasMailbox);

  function openCreate() {
    setForm(emptyForm);
    setFromApplication(false);
    setDrawerOpen(true);
  }

  // Arriving from "Onboard as intern" on a job application: open the create
  // drawer prefilled with what the applicant already sent. The company address
  // is only a suggestion (the admin owns the final mailbox name), the personal
  // address is where the credentials go, and the role defaults to Employee —
  // interns hold the member role. Runs once; the query is then stripped so a
  // refresh does not reopen a stale form.
  const onboardHandled = useRef(false);
  useEffect(() => {
    if (onboardHandled.current) return;
    onboardHandled.current = true;
    const prefill = readOnboardPrefill(window.location.search);
    if (!prefill) return;
    setForm({
      ...emptyForm,
      name: prefill.name,
      email: suggestCompanyEmail(prefill.name),
      password: generatePassword(),
      roleSlug: "member",
      status: "approved",
      sendWelcomeEmail: true,
      welcomeEmailTo: prefill.personalEmail,
    });
    setFromApplication(true);
    setDrawerOpen(true);
    window.history.replaceState(null, "", "/admin/users");
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const created = await createUser.mutateAsync({
      ...form,
      teamId: form.teamId || undefined,
      phone: form.phone || undefined,
      // Empty string is not a valid EmailStr — drop the field and let the API
      // fall back to the account address.
      welcomeEmailTo: form.welcomeEmailTo?.trim() || undefined,
    });
    setLastCreated({
      name: created.data.name,
      address: created.data.openemailAddress,
      hasMailbox: created.data.hasMailbox,
      // The API says whether the credentials actually left the building.
      note: form.sendWelcomeEmail ? created.message : undefined,
      // A fresh Employee hire needs their week-one board; point straight to it.
      offerPlaybook: fromApplication || form.roleSlug === "member",
    });
    setFromApplication(false);
    setDrawerOpen(false);
  }

  async function changeStatus(user: AdminUser, nextStatus: UserStatus) {
    setMenuId(null);
    await updateUser.mutateAsync({ id: user.id, payload: { status: nextStatus } });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not delete this user.");
      setDeleteTarget(null);
    }
  }

  async function handleProvisionOne(user: AdminUser) {
    setMenuId(null);
    setActionError(null);
    setProvisionNotice(null);
    setProvisioningId(user.id);
    try {
      const res = await provisionMailbox.mutateAsync(user.id);
      setProvisionNotice(`Mailbox ${res.data.openemailAddress ?? ""} is ready for ${res.data.name}.`.trim());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not provision a mailbox for this user.");
    } finally {
      setProvisioningId(null);
    }
  }

  async function handleProvisionAll() {
    setActionError(null);
    setProvisionNotice(null);
    try {
      const res = await provisionAll.mutateAsync();
      const { provisioned, failed } = res.data;
      setProvisionNotice(
        failed
          ? `Provisioned ${provisioned} mailbox(es); ${failed} could not be created. Confirm OPENEMAIL_API_KEY is set on the backend and that each address's domain is managed in open.email.`
          : `Provisioned ${provisioned} mailbox(es). Everyone now has an inbox.`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not provision mailboxes.");
    }
  }

  const metrics = metricsQuery.data?.data;
  const isLoading = usersQuery.isLoading || rolesQuery.isLoading || teamsQuery.isLoading;
  const isError = usersQuery.isError || rolesQuery.isError || teamsQuery.isError;

  return (
    <div onClick={() => menuId && setMenuId(null)}>
      <AdminPageHeader
        title="Users"
        description="Manage account access, approvals, roles, and team assignments."
        actionLabel="Add user"
        onAction={openCreate}
      />

      {lastCreated ? (
        <div className="mb-6 flex items-start justify-between gap-3 border p-4" style={{ borderColor: "var(--adm-green)", background: "var(--adm-green-light)" }}>
          <div className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5 shrink-0" style={{ color: "var(--adm-green)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--adm-text)" }}>{lastCreated.name} was created</p>
              <p className="text-xs" style={{ color: "var(--adm-text-2)" }}>
                {lastCreated.hasMailbox
                  ? <>Mailbox <span className="font-semibold">{lastCreated.address}</span> is assigned to this user.</>
                  : "Account created, but a mailbox couldn't be provisioned yet. Use “Provision all missing” once OPENEMAIL_API_KEY is set on the backend."}
              </p>
              {lastCreated.note ? (
                <p className="mt-1 text-xs font-medium" style={{ color: "var(--adm-text)" }}>{lastCreated.note}</p>
              ) : null}
              {lastCreated.offerPlaybook ? (
                <a href="/admin/tasks" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--adm-blue)" }}>
                  <ListChecks size={13} />
                  Assign their week-one playbook
                </a>
              ) : null}
            </div>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setLastCreated(null)} className="shrink-0" style={{ color: "var(--adm-text-3)" }}><X size={16} /></button>
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-6 flex items-start justify-between gap-3 border p-4" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--adm-red)" }}>{actionError}</p>
          <button type="button" aria-label="Dismiss" onClick={() => setActionError(null)} className="shrink-0" style={{ color: "var(--adm-text-3)" }}><X size={16} /></button>
        </div>
      ) : null}

      {provisionNotice ? (
        <div className="mb-6 flex items-start justify-between gap-3 border p-4" style={{ borderColor: "var(--adm-green)", background: "var(--adm-green-light)" }}>
          <div className="flex items-start gap-3">
            <MailPlus size={18} className="mt-0.5 shrink-0" style={{ color: "var(--adm-green)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--adm-text)" }}>{provisionNotice}</p>
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => setProvisionNotice(null)} className="shrink-0" style={{ color: "var(--adm-text-3)" }}><X size={16} /></button>
        </div>
      ) : null}

      {missingMailbox.length > 0 ? (
        <div className="mb-6 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--adm-amber)", background: "var(--adm-amber-light)" }}>
          <div className="flex items-start gap-3">
            <MailWarning size={18} className="mt-0.5 shrink-0" style={{ color: "var(--adm-amber)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--adm-text)" }}>{missingMailbox.length} user{missingMailbox.length === 1 ? "" : "s"} {missingMailbox.length === 1 ? "has" : "have"} no mailbox</p>
              <p className="text-xs" style={{ color: "var(--adm-text-2)" }}>These accounts can&apos;t send or receive email until a mailbox is created for them. This provisions one for every user missing one.</p>
            </div>
          </div>
          <button type="button" onClick={handleProvisionAll} disabled={provisionAll.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style={{ background: "var(--adm-amber)" }}>
            {provisionAll.isPending ? <Loader2 size={15} className="animate-spin" /> : <MailPlus size={15} />}
            {provisionAll.isPending ? "Provisioning…" : "Provision all missing"}
          </button>
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: metrics?.total ?? 0, icon: UserRound, tone: "var(--adm-blue)" },
          { label: "Pending review", value: metrics?.pending ?? 0, icon: Clock3, tone: "var(--adm-amber)" },
          { label: "Approved", value: metrics?.approved ?? 0, icon: ShieldCheck, tone: "var(--adm-green)" },
          { label: "Suspended", value: metrics?.suspended ?? 0, icon: PauseCircle, tone: "var(--adm-red)" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="border p-4" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--adm-text-3)" }}>{item.label}</span>
                <Icon size={17} style={{ color: item.tone }} />
              </div>
              <p className="mt-3 text-2xl font-bold" style={{ color: "var(--adm-text)" }}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 border p-3 sm:flex-row" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}>
        <label className="relative flex-1">
          <span className="sr-only">Search users</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--adm-text-3)" }} />
          <input className={`${adminInputClass} pl-9`} style={adminInputStyle} placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="relative sm:w-52">
          <span className="sr-only">Filter by status</span>
          <select className={`${adminInputClass} appearance-none pr-9`} style={adminInputStyle} value={status} onChange={(event) => setStatus(event.target.value as UserStatus | "all")}>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--adm-text-3)" }} />
        </label>
      </div>

      {isLoading ? <AdminLoadingState label="Loading users..." /> : null}
      {isError ? <AdminErrorState message="Could not load user management data. Confirm the backend is running and reachable." /> : null}
      {!isLoading && !isError && users.length === 0 ? <AdminEmptyState title="No users found" description="Try changing the search or status filter, or add a new user." /> : null}

      {!isLoading && !isError && users.length > 0 ? (
        <div className="overflow-x-auto border" style={{ borderColor: "var(--adm-border)" }}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}>
              <tr>
                {['User', 'Role', 'Team', 'Mailbox', 'Status', 'Joined', ''].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-text-3)" }}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const style = statusStyles[user.status];
                return (
                  <tr key={user.id} className="border-b last:border-b-0" style={{ borderColor: "var(--adm-border)" }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--adm-blue-light)", color: "var(--adm-blue)" }}>{initials(user.name)}</span>
                        <div><p className="font-semibold" style={{ color: "var(--adm-text)" }}>{user.name}</p><p className="text-xs" style={{ color: "var(--adm-text-3)" }}>{user.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="font-medium" style={{ color: "var(--adm-text-2)" }}>{user.roleName ?? user.roleSlug ?? "Unassigned"}</span></td>
                    <td className="px-4 py-4" style={{ color: "var(--adm-text-2)" }}>{user.teamName ?? "—"}</td>
                    <td className="px-4 py-4 text-xs">
                      {user.hasMailbox ? (
                        <span className="inline-flex items-center gap-1.5" style={{ color: "var(--adm-text-2)" }}><Mail size={13} style={{ color: "var(--adm-text-3)" }} />{user.openemailAddress}</span>
                      ) : (
                        <button type="button" onClick={(event) => { event.stopPropagation(); handleProvisionOne(user); }} disabled={provisioningId === user.id} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold transition hover:opacity-90 disabled:opacity-60" style={{ borderColor: "var(--adm-amber)", color: "var(--adm-amber)" }}>
                          {provisioningId === user.id ? <Loader2 size={12} className="animate-spin" /> : <MailWarning size={12} />}
                          {provisioningId === user.id ? "Creating…" : "No mailbox — create"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold" style={{ background: style.background, color: style.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: style.color }} />{style.label}</span></td>
                    <td className="px-4 py-4 text-xs" style={{ color: "var(--adm-text-3)" }}>{formatDate(user.createdAt)}</td>
                    <td className="relative px-4 py-4 text-right">
                      <button type="button" aria-label={`Actions for ${user.name}`} onClick={(event) => { event.stopPropagation(); setMenuId(menuId === user.id ? null : user.id); }} className="inline-flex h-9 w-9 items-center justify-center border transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}><MoreHorizontal size={17} /></button>
                      {menuId === user.id ? (
                        <div className="absolute right-4 top-14 z-20 w-44 border p-1 text-left" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }} onClick={(event) => event.stopPropagation()}>
                          {user.status === "pending" ? <button type="button" onClick={() => changeStatus(user, "approved")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-adm-surface-2" style={{ color: "var(--adm-green)" }}><Check size={14} />Approve</button> : null}
                          {user.status === "approved" ? <button type="button" onClick={() => changeStatus(user, "suspended")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-adm-surface-2" style={{ color: "var(--adm-red)" }}><PauseCircle size={14} />Suspend access</button> : null}
                          {user.status === "suspended" ? <button type="button" onClick={() => changeStatus(user, "approved")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-adm-surface-2" style={{ color: "var(--adm-green)" }}><Check size={14} />Restore access</button> : null}
                          {user.status === "pending" ? <button type="button" onClick={() => changeStatus(user, "rejected")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-adm-surface-2" style={{ color: "var(--adm-text-2)" }}><X size={14} />Reject request</button> : null}
                          <button type="button" onClick={() => { setMenuId(null); setActionError(null); setDeleteTarget(user); }} className="mt-1 flex w-full items-center gap-2 border-t px-3 py-2 text-sm hover:bg-adm-red-light" style={{ borderColor: "var(--adm-border)", color: "var(--adm-red)" }}><Trash2 size={14} />Delete user</button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <AdminDrawer open={drawerOpen} title={fromApplication ? "Onboard new hire" : "Add a user"} onClose={() => setDrawerOpen(false)}>
        <form onSubmit={handleCreate} className="grid gap-5">
          <AdminField label="Full name" htmlFor="user-name"><input id="user-name" required className={adminInputClass} style={adminInputStyle} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></AdminField>
          <AdminField label="Email address" htmlFor="user-email"><input id="user-email" required type="email" className={adminInputClass} style={adminInputStyle} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--adm-text-3)" }}><Mail size={12} />An open.email mailbox at this address is created automatically and assigned to the user.</p></AdminField>
          <AdminField label="Temporary password" htmlFor="user-password">
            <div className="flex items-center gap-2">
              {/* Shown as text on purpose: the admin has to be able to read it
                  back, and it is a throwaway the user is told to change. */}
              <input id="user-password" required minLength={8} type="text" autoComplete="off" spellCheck={false} className={`${adminInputClass} font-mono`} style={adminInputStyle} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <button type="button" onClick={() => setForm({ ...form, password: generatePassword() })} className="btn-press shrink-0 border px-3 py-2 text-xs font-bold uppercase tracking-wider" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}>Generate</button>
            </div>
            <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>At least 8 characters. Emailed below, or share it securely yourself.</p>
          </AdminField>
          <AdminField label="Welcome email" htmlFor="user-welcome">
            <label className="flex items-start gap-2.5 text-sm" style={{ color: "var(--adm-text-2)" }}>
              <input id="user-welcome" type="checkbox" className="mt-0.5" checked={Boolean(form.sendWelcomeEmail)} onChange={(event) => setForm({ ...form, sendWelcomeEmail: event.target.checked })} />
              <span>Email a congratulations message with these credentials and the portal link.</span>
            </label>
            {form.sendWelcomeEmail ? (
              <>
                <input type="email" placeholder="Deliver to (personal address)" aria-label="Deliver the welcome email to" className={adminInputClass} style={adminInputStyle} value={form.welcomeEmailTo ?? ""} onChange={(event) => setForm({ ...form, welcomeEmailTo: event.target.value })} />
                <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>Use a personal address — the new company mailbox can only be opened after the first sign-in. Left blank, it goes to the account address above. Sent from your own mailbox, so they can just reply.</p>
              </>
            ) : null}
          </AdminField>
          <AdminField label="Phone (optional)" htmlFor="user-phone"><input id="user-phone" className={adminInputClass} style={adminInputStyle} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></AdminField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label="Role" htmlFor="user-role"><select id="user-role" className={adminInputClass} style={adminInputStyle} value={form.roleSlug} onChange={(event) => setForm({ ...form, roleSlug: event.target.value })}>{roles.map((role) => <option key={role.id} value={role.slug}>{role.name}</option>)}</select></AdminField>
            <AdminField label="Team" htmlFor="user-team"><select id="user-team" className={adminInputClass} style={adminInputStyle} value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}><option value="">No team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></AdminField>
          </div>
          <AdminField label="Initial access" htmlFor="user-status"><select id="user-status" className={adminInputClass} style={adminInputStyle} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })}><option value="approved">Approved — can sign in now</option><option value="pending">Pending — requires approval</option></select></AdminField>
          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={createUser.isPending} submitLabel="Create user" />
        </form>
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        description={
          deleteTarget
            ? `Permanently delete ${deleteTarget.name} (${deleteTarget.email})? This removes the account and detaches their leads, tasks, and other records. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete user"
        isPending={deleteUser.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
