"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock3, MoreHorizontal, PauseCircle, Search, ShieldCheck, UserRound, X } from "lucide-react";

import {
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
import { useAdminMetrics, useAdminRoles, useAdminTeams, useAdminUsers, useCreateAdminUser, useUpdateAdminUser } from "@/hooks/useAdmin";
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
  const [menuId, setMenuId] = useState<string | null>(null);

  const queryParams = useMemo(() => ({ pageSize: 50, search: search.trim() || undefined, status }), [search, status]);
  const usersQuery = useAdminUsers(queryParams);
  const rolesQuery = useAdminRoles();
  const teamsQuery = useAdminTeams();
  const metricsQuery = useAdminMetrics();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();

  const users = usersQuery.data?.data.items ?? [];
  const roles = rolesQuery.data?.data ?? [];
  const teams = teamsQuery.data?.data ?? [];

  function openCreate() {
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    await createUser.mutateAsync({ ...form, teamId: form.teamId || undefined, phone: form.phone || undefined });
    setDrawerOpen(false);
  }

  async function changeStatus(user: AdminUser, nextStatus: UserStatus) {
    setMenuId(null);
    await updateUser.mutateAsync({ id: user.id, payload: { status: nextStatus } });
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
                {['User', 'Role', 'Team', 'Status', 'Joined', ''].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--adm-text-3)" }}>{heading}</th>)}
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

      <AdminDrawer open={drawerOpen} title="Add a user" onClose={() => setDrawerOpen(false)}>
        <form onSubmit={handleCreate} className="grid gap-5">
          <AdminField label="Full name" htmlFor="user-name"><input id="user-name" required className={adminInputClass} style={adminInputStyle} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></AdminField>
          <AdminField label="Email address" htmlFor="user-email"><input id="user-email" required type="email" className={adminInputClass} style={adminInputStyle} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></AdminField>
          <AdminField label="Temporary password" htmlFor="user-password"><input id="user-password" required minLength={8} type="password" className={adminInputClass} style={adminInputStyle} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><p className="text-xs" style={{ color: "var(--adm-text-3)" }}>At least 8 characters. Share this securely with the new user.</p></AdminField>
          <AdminField label="Phone (optional)" htmlFor="user-phone"><input id="user-phone" className={adminInputClass} style={adminInputStyle} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></AdminField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label="Role" htmlFor="user-role"><select id="user-role" className={adminInputClass} style={adminInputStyle} value={form.roleSlug} onChange={(event) => setForm({ ...form, roleSlug: event.target.value })}>{roles.map((role) => <option key={role.id} value={role.slug}>{role.name}</option>)}</select></AdminField>
            <AdminField label="Team" htmlFor="user-team"><select id="user-team" className={adminInputClass} style={adminInputStyle} value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value })}><option value="">No team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></AdminField>
          </div>
          <AdminField label="Initial access" htmlFor="user-status"><select id="user-status" className={adminInputClass} style={adminInputStyle} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })}><option value="approved">Approved — can sign in now</option><option value="pending">Pending — requires approval</option></select></AdminField>
          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={createUser.isPending} submitLabel="Create user" />
        </form>
      </AdminDrawer>
    </div>
  );
}
