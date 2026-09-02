"use client";

/**
 * Company announcements — read-only for employees, full CRUD for admins.
 *
 * The admin controls used to be decoration: "New Broadcast", Edit and Delete
 * carried styling and an aria-label but no `onClick`, so nothing could be
 * created, edited or removed from the UI even though the backend has had
 * POST/PUT/DELETE /announcements all along and `hooks/useAnnouncements` already
 * exported the three matching mutations. This wires them up.
 *
 * Writes are admin-gated server-side (`CurrentAdmin`), which is why the editor
 * only renders when `isAdmin` is true.
 */

import { useState } from "react";
import { AlertTriangle, Edit, Megaphone, Plus, Trash2 } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "@/hooks/useAnnouncements";
import type { Announcement } from "@/types";

type Draft = { title: string; body: string; isPublished: boolean };

const EMPTY: Draft = { title: "", body: "", isPublished: true };

export default function AnnouncementsPage({ isAdmin = false }) {
  // Employees only see what has been published; admins also see drafts so they
  // can manage them. The list endpoint is public, so both roles can read it.
  const { data, isLoading, isError, error } = useAnnouncements(
    isAdmin ? { pageSize: 50 } : { pageSize: 50, publishedOnly: true },
  );
  const announcements: Announcement[] = data?.data.items ?? [];

  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const remove = useDeleteAnnouncement();

  // `editing` doubles as "is the drawer open": null = closed, "new" = create.
  const [editing, setEditing] = useState<Announcement | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Announcement | null>(null);

  function openCreate() {
    setEditing("new");
    setDraft(EMPTY);
    setFormError(null);
  }

  function openEdit(item: Announcement) {
    setEditing(item);
    setDraft({ title: item.title, body: item.body, isPublished: item.isPublished });
    setFormError(null);
  }

  function close() {
    setEditing(null);
    setFormError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) {
      setFormError("Both a title and a message are required.");
      return;
    }
    setFormError(null);
    try {
      if (editing === "new") {
        await create.mutateAsync({ title, body, isPublished: draft.isPublished });
      } else if (editing) {
        await update.mutateAsync({
          id: editing.id,
          payload: { title, body, isPublished: draft.isPublished },
        });
      }
      close();
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Could not save this announcement.",
      );
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Could not delete this announcement.",
      );
      setPendingDelete(null);
    }
  }

  const saving = create.isPending || update.isPending;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full h-full min-h-[70vh]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>Company Announcements</h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin ? "Manage and broadcast news to all employees." : "Stay up to date with the latest company news."}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="btn-press flex items-center gap-2 bg-adm-blue px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Plus size={16} /> New Broadcast
          </button>
        )}
      </div>

      {formError && !editing && (
        <p className="border px-4 py-3 text-sm" role="alert" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}>
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-6 mt-4">
        {isLoading ? (
          <div className="p-12 text-center animate-pulse" style={{ color: "var(--adm-text-3)" }}>Loading announcements…</div>
        ) : isError ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-adm-surface border" style={{ borderColor: "var(--adm-red)" }}>
            <AlertTriangle size={40} className="mb-4" style={{ color: "var(--adm-red)" }} />
            <p className="font-bold text-adm-text">Could not load announcements</p>
            <p className="text-sm text-adm-text-3">{error instanceof Error ? error.message : "Confirm the backend is running and reachable."}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-adm-surface border border-adm-border">
            <Megaphone size={48} className="mb-4" style={{ color: "var(--adm-text-3)" }} />
            <p className="font-bold text-adm-text">No Announcements</p>
            <p className="text-sm text-adm-text-3">
              {isAdmin ? "Publish the first broadcast with New Broadcast." : "There is no news to share right now."}
            </p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="border border-adm-border bg-adm-surface p-8 flex flex-col hover:border-adm-blue transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-adm-blue-light text-adm-blue flex items-center justify-center">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase text-adm-text">{item.title}</h2>
                    <p className="text-xs text-adm-text-3 font-semibold mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {!item.isPublished && <span className="bg-adm-amber-light text-adm-amber text-[10px] uppercase font-bold tracking-wider px-2 py-1">Draft</span>}
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="h-8 w-8 rounded-full hover:bg-adm-surface-2 flex items-center justify-center text-adm-text-3 hover:text-adm-blue transition"
                      aria-label="Edit announcement"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      className="h-8 w-8 rounded-full hover:bg-adm-red-light flex items-center justify-center text-adm-text-3 hover:text-adm-red transition"
                      aria-label="Delete announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-adm-text-2 whitespace-pre-wrap leading-relaxed mt-2">{item.body}</p>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <>
          <AdminDrawer
            open={editing !== null}
            title={editing === "new" ? "New broadcast" : "Edit broadcast"}
            onClose={close}
          >
            <form onSubmit={submit} className="grid gap-5">
              <AdminField label="Title" htmlFor="announcement-title">
                <input
                  id="announcement-title"
                  value={draft.title}
                  maxLength={220}
                  onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
                  placeholder="What is the news?"
                  className={adminInputClass}
                  style={adminInputStyle}
                />
              </AdminField>

              <AdminField label="Message" htmlFor="announcement-body">
                <textarea
                  id="announcement-body"
                  rows={10}
                  value={draft.body}
                  onChange={(event) => setDraft((d) => ({ ...d, body: event.target.value }))}
                  placeholder="Write the announcement everyone will read…"
                  className={`${adminInputClass} resize-y`}
                  style={adminInputStyle}
                />
              </AdminField>

              <label className="flex items-center gap-3 text-sm" style={{ color: "var(--adm-text-2)" }}>
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(event) => setDraft((d) => ({ ...d, isPublished: event.target.checked }))}
                  className="h-4 w-4"
                />
                {/* Unpublished rows stay hidden from the employee portal, which
                    filters with publishedOnly. */}
                <span>Publish to all employees now (uncheck to keep it a draft)</span>
              </label>

              {formError && editing && (
                <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
                  {formError}
                </p>
              )}

              <AdminFormActions
                onCancel={close}
                isPending={saving}
                submitLabel={editing === "new" ? "Broadcast" : "Save changes"}
              />
            </form>
          </AdminDrawer>

          <AdminConfirmDialog
            open={pendingDelete !== null}
            title="Delete this announcement?"
            description={
              pendingDelete
                ? `"${pendingDelete.title}" will be removed for everyone. This cannot be undone.`
                : undefined
            }
            isPending={remove.isPending}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
          />
        </>
      )}
    </div>
  );
}
