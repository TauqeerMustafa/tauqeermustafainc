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
import {
  useCreatePortfolioProject,
  useDeletePortfolioProject,
  usePortfolio,
  useUpdatePortfolioProject,
} from "@/hooks/usePortfolio";
import type { Portfolio } from "@/types";
import type { PortfolioPayload } from "@/services/portfolio.service";

const emptyForm: PortfolioPayload = {
  slug: "",
  title: "",
  summary: "",
  category: "",
  impact: "",
  technologies: [],
  gallery: [],
};

function toList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminPortfolioPage() {
  const { data, isLoading, isError } = usePortfolio({ pageSize: 100 });
  const createProject = useCreatePortfolioProject();
  const updateProject = useUpdatePortfolioProject();
  const deleteProject = useDeletePortfolioProject();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [form, setForm] = useState<PortfolioPayload>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Portfolio | null>(null);

  const projects = data?.data.items ?? [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(project: Portfolio) {
    setEditing(project);
    setForm({
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      category: project.category,
      impact: project.impact ?? "",
      technologies: project.technologies,
      gallery: project.gallery ?? [],
    });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateProject.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createProject.mutateAsync(form);
    }
    setDrawerOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteProject.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const isSaving = createProject.isPending || updateProject.isPending;

  return (
    <div>
      <AdminPageHeader
        title="Portfolio"
        description="Manage case studies shown on the portfolio page."
        actionLabel="New Project"
        onAction={openCreate}
      />

      {isLoading ? <AdminLoadingState label="Loading projects..." /> : null}
      {isError ? (
        <AdminErrorState message="Could not load portfolio projects. Confirm the backend is running and reachable." />
      ) : null}

      {!isLoading && !isError && projects.length === 0 ? (
        <AdminEmptyState title="No projects yet" description="Add your first case study to get started." />
      ) : null}

      {!isLoading && !isError && projects.length > 0 ? (
        <div className="overflow-x-auto border border-adm-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-adm-border bg-adm-surface-2 text-xs uppercase tracking-wide text-adm-text-3">
              <tr>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Stack</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-adm-border">
              {projects.map((project) => (
                <tr key={project.id} className="text-adm-text-2">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-adm-text">{project.title}</p>
                    <p className="text-xs text-adm-text-3">/{project.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-adm-text-2">{project.category}</td>
                  <td className="px-4 py-3 text-adm-text-2">{project.technologies.slice(0, 3).join(", ")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(project)}
                        aria-label={`Edit ${project.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-adm-border text-adm-text-2 transition hover:border-adm-blue"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(project)}
                        aria-label={`Delete ${project.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-adm-border text-adm-text-2 transition hover:border-adm-red hover:text-adm-red"
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
        title={editing ? "Edit Project" : "New Project"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Title" htmlFor="p-title">
            <input
              id="p-title"
              required
              className={adminInputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminField>
          <AdminField label="Slug" htmlFor="p-slug">
            <input
              id="p-slug"
              required
              pattern="[a-z0-9-]+"
              className={adminInputClass}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </AdminField>
          <AdminField label="Category" htmlFor="p-category">
            <input
              id="p-category"
              required
              className={adminInputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </AdminField>
          <AdminField label="Summary" htmlFor="p-summary">
            <textarea
              id="p-summary"
              required
              rows={3}
              className={adminInputClass}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </AdminField>
          <AdminField label="Impact statement" htmlFor="p-impact">
            <input
              id="p-impact"
              className={adminInputClass}
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: e.target.value })}
            />
          </AdminField>
          <AdminField label="Technologies (comma-separated)" htmlFor="p-tech">
            <input
              id="p-tech"
              className={adminInputClass}
              value={form.technologies.join(", ")}
              onChange={(e) => setForm({ ...form, technologies: toList(e.target.value) })}
            />
          </AdminField>
          <AdminField label="Gallery labels (comma-separated)" htmlFor="p-gallery">
            <input
              id="p-gallery"
              className={adminInputClass}
              value={(form.gallery ?? []).join(", ")}
              onChange={(e) => setForm({ ...form, gallery: toList(e.target.value) })}
            />
          </AdminField>

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={isSaving} />
        </form>
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this project?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : undefined}
        isPending={deleteProject.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
