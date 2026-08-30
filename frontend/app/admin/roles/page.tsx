"use client";

import { useMemo, useState } from "react";
import { Edit2, KeyRound, Plus, Shield, Trash2, Users } from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  Field,
  Label,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalDialog,
  PortalPageHeader,
  StatCard,
  inputClass,
} from "@/components/portal/PortalUI";
import {
  useAdminPermissions,
  useAdminRoles,
  useAssignRolePermissions,
  useCreateRole,
  useDeleteRole,
  useUpdateRole,
} from "@/hooks/useAdmin";
import type { AdminPermission, AdminRole } from "@/types";

type Draft = { name: string; slug: string; hierarchyLevel: number; description: string };

const EMPTY_DRAFT: Draft = { name: "", slug: "", hierarchyLevel: 10, description: "" };

/** `leads.read.team` → `leads`, so the picker can be grouped by subsystem. */
function permissionGroup(slug: string) {
  return slug.split(".")[0] ?? "other";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function RolesManagementPage() {
  const roles = useAdminRoles();
  const permissions = useAdminPermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const assign = useAssignRolePermissions();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<AdminRole | null>(null);

  const roleList = roles.data?.data ?? [];
  const permissionList = permissions.data?.data ?? [];

  const selected = roleList.find((role) => role.id === selectedId) ?? null;

  const grouped = useMemo(() => {
    const buckets = new Map<string, AdminPermission[]>();
    for (const permission of permissionList) {
      const key = permissionGroup(permission.slug);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(permission);
      else buckets.set(key, [permission]);
    }
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissionList]);

  function openCreate() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setEditorOpen(true);
  }

  function openEdit(role: AdminRole) {
    setEditing(role);
    setDraft({
      name: role.name,
      slug: role.slug,
      hierarchyLevel: role.hierarchyLevel,
      description: role.description ?? "",
    });
    setEditorOpen(true);
  }

  function selectRole(role: AdminRole) {
    setSelectedId(role.id);
    setChecked((role.permissions ?? []).map((permission) => permission.id));
  }

  function submitRole(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name: draft.name.trim(),
      hierarchyLevel: draft.hierarchyLevel,
      description: draft.description.trim() || null,
    };
    if (editing) {
      // The slug is the RBAC join key, so PATCH deliberately omits it.
      updateRole.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setEditorOpen(false) },
      );
      return;
    }
    createRole.mutate(
      { ...payload, slug: slugify(draft.slug || draft.name) },
      {
        onSuccess: (response) => {
          setEditorOpen(false);
          selectRole(response.data);
        },
      },
    );
  }

  const editorBusy = editing ? updateRole.isPending : createRole.isPending;
  const editorError = editing ? updateRole.error : createRole.error;

  const dirty =
    selected !== null &&
    (() => {
      const current = new Set((selected.permissions ?? []).map((p) => p.id));
      return current.size !== checked.length || checked.some((id) => !current.has(id));
    })();

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Roles & Permissions"
        description="Access levels are defined here; every portal and API route gates on the permission slugs below."
      >
        <PortalButton onClick={openCreate} icon={Plus}>
          Create role
        </PortalButton>
      </PortalPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Roles" value={roleList.length} icon={Shield} tone="blue" />
        <StatCard
          label="System roles"
          value={roleList.filter((role) => role.isSystem).length}
          icon={Users}
          tone="neutral"
          hint="Protected from deletion."
        />
        <StatCard
          label="Permissions"
          value={permissionList.length}
          icon={KeyRound}
          tone="green"
          hint="Granular capabilities available to assign."
        />
      </div>

      {roles.isLoading ? (
        <LoadingBlock label="Loading roles…" />
      ) : roles.isError ? (
        <ErrorBlock
          message={roles.error instanceof Error ? roles.error.message : "Could not load roles."}
          onRetry={() => roles.refetch()}
        />
      ) : roleList.length === 0 ? (
        <EmptyBlock title="No roles" description="Create the first role to start delegating access.">
          <PortalButton onClick={openCreate} variant="ghost" icon={Plus}>
            Create role
          </PortalButton>
        </EmptyBlock>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-1">
            {roleList.map((role) => {
              const isSelected = role.id === selectedId;
              return (
                <div
                  key={role.id}
                  className={`border bg-adm-surface p-5 transition ${
                    isSelected ? "border-adm-blue" : "border-adm-border hover:border-adm-border-2"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectRole(role)}
                    aria-pressed={isSelected}
                    className="block w-full text-left"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <Shield size={16} className="shrink-0 text-adm-blue" />
                        <span className="truncate text-sm font-bold uppercase tracking-[0.06em] text-adm-text">
                          {role.name}
                        </span>
                      </span>
                      {role.isSystem && <Label>System</Label>}
                    </span>
                    <span className="mt-2 block text-sm text-adm-text-3">
                      {role.description || "No description provided."}
                    </span>
                    <span className="mt-4 flex items-center justify-between text-xs font-semibold text-adm-text-2">
                      <span className="font-mono lowercase text-adm-text-3">{role.slug}</span>
                      <span className="tabular-nums">
                        Level {role.hierarchyLevel} · {role.permissions?.length ?? 0} perms
                      </span>
                    </span>
                  </button>

                  <div className="mt-4 flex items-center gap-1 border-t border-adm-border pt-3">
                    <button
                      type="button"
                      onClick={() => openEdit(role)}
                      aria-label={`Edit ${role.name}`}
                      className="p-2 text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
                    >
                      <Edit2 size={14} />
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(role)}
                        aria-label={`Delete ${role.name}`}
                        className="p-2 text-adm-red transition hover:bg-adm-red-light"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {!selected ? (
              <Panel title="Permission matrix" icon={KeyRound}>
                <EmptyBlock
                  title="Select a role"
                  description="Pick a role on the left to review and change the permissions it grants."
                />
              </Panel>
            ) : (
              <Panel
                title={`${selected.name} · permissions`}
                icon={KeyRound}
                action={
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text-3 tabular-nums">
                    {checked.length} selected
                  </span>
                }
              >
                {selected.isSystem ? (
                  <p className="border border-adm-border bg-adm-surface-2 p-4 text-sm text-adm-text-2">
                    {selected.name} is a system role. Its permissions are fixed in the backend so an
                    operator cannot lock themselves out of the admin portal.
                  </p>
                ) : permissions.isLoading ? (
                  <LoadingBlock label="Loading permissions…" />
                ) : permissions.isError ? (
                  <ErrorBlock
                    message={
                      permissions.error instanceof Error
                        ? permissions.error.message
                        : "Could not load the permission catalogue."
                    }
                    onRetry={() => permissions.refetch()}
                  />
                ) : (
                  <div className="flex flex-col gap-6">
                    {grouped.map(([group, items]) => (
                      <div key={group} className="flex flex-col gap-3">
                        <Label>{group}</Label>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {items.map((permission) => {
                            const on = checked.includes(permission.id);
                            return (
                              <label
                                key={permission.id}
                                className={`flex cursor-pointer items-start gap-3 border p-3 transition ${
                                  on
                                    ? "border-adm-blue bg-adm-blue-light"
                                    : "border-adm-border hover:bg-adm-surface-2"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() =>
                                    setChecked((previous) =>
                                      previous.includes(permission.id)
                                        ? previous.filter((id) => id !== permission.id)
                                        : [...previous, permission.id],
                                    )
                                  }
                                  className="mt-0.5 h-4 w-4 shrink-0 accent-adm-blue"
                                />
                                <span className="min-w-0">
                                  <span className="block truncate font-mono text-xs font-bold text-adm-text">
                                    {permission.slug}
                                  </span>
                                  <span className="block text-xs text-adm-text-3">
                                    {permission.description || "No description"}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {assign.isError && (
                      <p className="text-xs text-adm-red">
                        {(assign.error as Error).message || "Could not save the permission set."}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-3 border-t border-adm-border pt-5">
                      <PortalButton
                        variant="ghost"
                        disabled={!dirty || assign.isPending}
                        onClick={() => selectRole(selected)}
                      >
                        Reset
                      </PortalButton>
                      <PortalButton
                        disabled={!dirty || assign.isPending}
                        onClick={() =>
                          assign.mutate({ id: selected.id, permissionIds: checked })
                        }
                      >
                        {assign.isPending ? "Saving…" : "Save permissions"}
                      </PortalButton>
                    </div>
                  </div>
                )}
              </Panel>
            )}
          </div>
        </div>
      )}

      <PortalDialog
        open={editorOpen}
        title={editing ? `Edit ${editing.name}` : "Create role"}
        onClose={() => setEditorOpen(false)}
      >
        <form onSubmit={submitRole} className="flex flex-col gap-5">
          <Field label="Role name" htmlFor="role-name">
            <input
              id="role-name"
              required
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className={inputClass}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="role-slug"
            hint={
              editing
                ? "The slug is the RBAC join key and cannot change once users reference it."
                : "Lowercase identifier used by the API. Derived from the name if left blank."
            }
          >
            <input
              id="role-slug"
              disabled={Boolean(editing)}
              value={draft.slug}
              onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })}
              placeholder={slugify(draft.name) || "custom_role"}
              className={`${inputClass} font-mono disabled:opacity-60`}
            />
          </Field>

          <Field label="Description" htmlFor="role-description">
            <input
              id="role-description"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              className={inputClass}
            />
          </Field>

          <Field
            label="Hierarchy level"
            htmlFor="role-level"
            hint="Higher wins when deciding who may act on whom. 100 is reserved for the administrator role."
          >
            <input
              id="role-level"
              type="number"
              min={0}
              max={99}
              value={draft.hierarchyLevel}
              onChange={(event) =>
                setDraft({ ...draft, hierarchyLevel: Number(event.target.value) || 0 })
              }
              className={inputClass}
            />
          </Field>

          {editorError && (
            <p className="text-xs text-adm-red">
              {(editorError as Error).message || "Could not save the role."}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-adm-border pt-5">
            <PortalButton variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton type="submit" disabled={editorBusy}>
              {editorBusy ? "Saving…" : editing ? "Save changes" : "Create role"}
            </PortalButton>
          </div>
        </form>
      </PortalDialog>

      <PortalDialog
        open={confirmDelete !== null}
        title="Delete role"
        onClose={() => setConfirmDelete(null)}
      >
        {confirmDelete && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-adm-text-2">
              Delete <span className="font-semibold text-adm-text">{confirmDelete.name}</span>? The
              API refuses if any user still holds it, so reassign those accounts first.
            </p>
            {deleteRole.isError && (
              <p className="text-xs text-adm-red">
                {(deleteRole.error as Error).message || "Could not delete the role."}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t border-adm-border pt-5">
              <PortalButton variant="ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant="danger"
                disabled={deleteRole.isPending}
                onClick={() =>
                  deleteRole.mutate(confirmDelete.id, {
                    onSuccess: () => {
                      if (selectedId === confirmDelete.id) setSelectedId(null);
                      setConfirmDelete(null);
                    },
                  })
                }
              >
                {deleteRole.isPending ? "Deleting…" : "Delete role"}
              </PortalButton>
            </div>
          </div>
        )}
      </PortalDialog>
    </div>
  );
}
