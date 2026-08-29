"use client";

import { useState } from "react";
import { Pencil, Trash2, Mail, Users } from "lucide-react";

import {
  AdminPageHeader,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
} from "@/components/admin/AdminUI";
import {
  useAdminUsers,
  useAdminRoles,
  useAdminTeams,
  useCreateAdminUser,
  useUpdateAdminUser,
} from "@/hooks/useAdmin";
import type { AdminUser } from "@/types";

export default function AdminEmployeesPage() {
  const { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers } = useAdminUsers();
  const { data: rolesData, isLoading: isLoadingRoles } = useAdminRoles();
  const { data: teamsData, isLoading: isLoadingTeams } = useAdminTeams();

  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    roleSlug: "exec",
    teamId: "",
    status: "approved" as any,
    createMsMailbox: false,
  });

  const users = usersData?.data?.items ?? [];
  const roles = rolesData?.data ?? [];
  const teams = teamsData?.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      roleSlug: roles.find((r) => r.slug === "exec")?.slug || "exec",
      teamId: "",
      status: "approved",
      createMsMailbox: false,
    });
    setDrawerOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // Leave blank unless changing
      phone: user.phone || "",
      roleSlug: user.roleSlug || "exec",
      teamId: user.teamId || "",
      status: user.status as any,
      createMsMailbox: false,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password || undefined, // only send if not empty
      phone: form.phone || undefined,
      roleSlug: form.roleSlug,
      teamId: form.teamId || undefined,
      status: form.status,
      createMsMailbox: form.createMsMailbox,
    };

    if (editing) {
      await updateUser.mutateAsync({ id: editing.id, payload: payload as any });
    } else {
      await createUser.mutateAsync(payload as any);
    }
    setDrawerOpen(false);
  }

  const isSaving = createUser.isPending || updateUser.isPending;
  const isDataLoading = isLoadingUsers || isLoadingRoles || isLoadingTeams;

  return (
    <div>
      <AdminPageHeader
        title="Employees & Permissions"
        description="Manage internal team members, access roles, and provision Microsoft 365 mailboxes."
        actionLabel="New Employee"
        onAction={openCreate}
      />

      {isDataLoading ? <AdminLoadingState label="Loading directory..." /> : null}
      {isErrorUsers ? (
        <AdminErrorState message="Could not load employees. Confirm the backend is running and reachable." />
      ) : null}

      {!isDataLoading && !isErrorUsers && users.length === 0 ? (
        <AdminEmptyState title="No employees yet" description="Add your first team member." />
      ) : null}

      {!isDataLoading && !isErrorUsers && users.length > 0 ? (
        <div className="overflow-x-auto border border-line-2 bg-surface">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-line-2 bg-canvas text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Team</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id} className="text-ink transition hover:bg-canvas">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-ink-muted">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-action/10 px-2 py-1 text-xs font-semibold text-action">
                      {user.roleName || "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{user.teamName || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold ${user.status === "approved" ? "bg-action/10 text-action" : "bg-line-2 text-ink-muted"}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        aria-label={`Edit ${user.name}`}
                        className="flex h-8 w-8 items-center justify-center border border-line-2 text-ink-muted transition hover:border-ink hover:text-ink"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AdminDrawer
        open={drawerOpen}
        title={editing ? "Edit Employee" : "New Employee"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Full Name" htmlFor="e-name">
            <input
              id="e-name"
              required
              className={adminInputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </AdminField>
          
          <AdminField label="Email Address" htmlFor="e-email">
            <input
              id="e-email"
              type="email"
              required
              className={adminInputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </AdminField>

          <AdminField label={editing ? "Password (leave blank to keep current)" : "Password"} htmlFor="e-password">
            <input
              id="e-password"
              type="password"
              required={!editing}
              minLength={8}
              className={adminInputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </AdminField>

          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Role & Permissions" htmlFor="e-role">
              <select
                id="e-role"
                className={adminInputClass}
                value={form.roleSlug}
                onChange={(e) => setForm({ ...form, roleSlug: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.slug} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </AdminField>
            
            <AdminField label="Team (Optional)" htmlFor="e-team">
              <select
                id="e-team"
                className={adminInputClass}
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              >
                <option value="">None</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </AdminField>
          </div>

          <AdminField label="Account Status" htmlFor="e-status">
            <select
              id="e-status"
              className={adminInputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="approved">Active / Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </AdminField>

          {!editing && (
            <div className="mt-2 rounded border border-[#0078d4]/30 bg-[#0078d4]/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-[#0078d4] focus:ring-[#0078d4]"
                  checked={form.createMsMailbox}
                  onChange={(e) => setForm({ ...form, createMsMailbox: e.target.checked })}
                />
                <div className="text-sm">
                  <p className="font-semibold text-ink">Provision Microsoft 365 Mailbox</p>
                  <p className="text-ink-muted">
                    Automatically create an Entra ID user and provision a mailbox using your organization's domain.
                  </p>
                </div>
              </label>
            </div>
          )}

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={isSaving} />
        </form>
      </AdminDrawer>
    </div>
  );
}



