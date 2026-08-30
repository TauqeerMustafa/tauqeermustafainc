"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

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
} from "@/components/admin/AdminUI";
import { useCreateService, useDeleteService, useServices, useUpdateService } from "@/hooks/useServices";
import type { Service } from "@/types";
import type { ServicePayload } from "@/services/service.service";

const emptyForm: ServicePayload = {
  slug: "",
  title: "",
  shortDescription: "",
  description: "",
  icon: "",
  outcomes: [],
};

function toList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminServicesPage() {
  const { data, isLoading, isError } = useServices({ pageSize: 100 });
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServicePayload>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const services = data?.data.items ?? [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      slug: service.slug,
      title: service.title,
      shortDescription: service.shortDescription,
      description: service.description,
      icon: service.icon ?? "",
      outcomes: service.outcomes,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateService.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createService.mutateAsync(form);
    }
    setDrawerOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteService.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const isSaving = createService.isPending || updateService.isPending;

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Manage the service lines shown across the site."
        actionLabel="New Service"
        onAction={openCreate}
      />

      {isLoading ? <AdminLoadingState label="Loading services..." /> : null}
      {isError ? (
        <AdminErrorState message="Could not load services. Confirm the backend is running and reachable." />
      ) : null}

      {!isLoading && !isError && services.length === 0 ? (
        <AdminEmptyState title="No services yet" description="Add your first service line to get started." />
      ) : null}

      {!isLoading && !isError && services.length > 0 ? (
        <div className="overflow-x-auto border border-[var(--adm-border)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)] text-xs uppercase tracking-wide text-[var(--adm-text-3)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Outcomes</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adm-border)]">
              {services.map((service) => (
                <tr key={service.id} className="text-[var(--adm-text-2)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--adm-text)]">{service.title}</p>
                    <p className="text-xs text-[var(--adm-text-3)]">/{service.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--adm-text-2)]">{service.outcomes.length} listed</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        aria-label={`Edit ${service.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-[var(--adm-border)] text-[var(--adm-text-2)] transition hover:border-[var(--adm-blue)]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(service)}
                        aria-label={`Delete ${service.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-[var(--adm-border)] text-[var(--adm-text-2)] transition hover:border-[var(--adm-red)] hover:text-[var(--adm-red)]"
                      >
                        <Trash2 size={14} />
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
        title={editing ? "Edit Service" : "New Service"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Title" htmlFor="s-title">
            <input
              id="s-title"
              required
              className={adminInputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminField>
          <AdminField label="Slug" htmlFor="s-slug">
            <input
              id="s-slug"
              required
              pattern="[a-z0-9-]+"
              className={adminInputClass}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </AdminField>
          <AdminField label="Icon (lucide-react name)" htmlFor="s-icon">
            <input
              id="s-icon"
              placeholder="Code2"
              className={adminInputClass}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </AdminField>
          <AdminField label="Short description" htmlFor="s-short">
            <textarea
              id="s-short"
              required
              rows={2}
              className={adminInputClass}
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            />
          </AdminField>
          <AdminField label="Full description" htmlFor="s-desc">
            <textarea
              id="s-desc"
              required
              rows={4}
              className={adminInputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminField>
          <AdminField label="Outcomes (one per line)" htmlFor="s-outcomes">
            <textarea
              id="s-outcomes"
              rows={5}
              className={adminInputClass}
              value={form.outcomes.join("\n")}
              onChange={(e) => setForm({ ...form, outcomes: toList(e.target.value) })}
            />
          </AdminField>

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={isSaving} />
        </form>
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this service?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : undefined}
        isPending={deleteService.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
