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
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "@/hooks/useAnnouncements";
import type { Announcement } from "@/types";
import type { AnnouncementPayload } from "@/services/announcement.service";

const emptyForm: AnnouncementPayload = {
  title: "",
  body: "",
  isPublished: true,
};

export default function AdminAnnouncementsPage() {
  const { data, isLoading, isError } = useAnnouncements({ pageSize: 100 });
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementPayload>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Announcement | null>(null);

  const announcements = data?.data.items ?? [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(announcement: Announcement) {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      body: announcement.body,
      isPublished: announcement.isPublished,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateAnnouncement.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createAnnouncement.mutateAsync(form);
    }
    setDrawerOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteAnnouncement.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const isSaving = createAnnouncement.isPending || updateAnnouncement.isPending;

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        description="Internal notes and updates for the team."
        actionLabel="New Announcement"
        onAction={openCreate}
      />

      {isLoading ? <AdminLoadingState label="Loading announcements..." /> : null}
      {isError ? (
        <AdminErrorState message="Could not load announcements. Confirm the backend is running and reachable." />
      ) : null}

      {!isLoading && !isError && announcements.length === 0 ? (
        <AdminEmptyState title="No announcements yet" description="Post an update for the team to get started." />
      ) : null}

      {!isLoading && !isError && announcements.length > 0 ? (
        <div className="grid gap-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{announcement.title}</p>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold ${announcement.isPublished ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"}`}
                    >
                      {announcement.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{announcement.body}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(announcement)}
                    aria-label={`Edit ${announcement.title}`}
                    className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-300 transition hover:border-yellow-400"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(announcement)}
                    aria-label={`Delete ${announcement.title}`}
                    className="flex h-8 w-8 items-center justify-center border border-white/10 text-slate-300 transition hover:border-red-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <AdminDrawer
        open={drawerOpen}
        title={editing ? "Edit Announcement" : "New Announcement"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Title" htmlFor="a-title">
            <input
              id="a-title"
              required
              className={adminInputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminField>
          <AdminField label="Body" htmlFor="a-body">
            <textarea
              id="a-body"
              required
              rows={6}
              className={adminInputClass}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </AdminField>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="h-4 w-4 accent-yellow-400"
            />
            Published
          </label>

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={isSaving} />
        </form>
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this announcement?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : undefined}
        isPending={deleteAnnouncement.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
