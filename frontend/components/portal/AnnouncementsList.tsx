"use client";

/**
 * Company announcements — read-only for employees, full CRUD for admins.
 * Supports image cover attachments, live previews, lightbox view, and bulk deletion.
 */

import { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckSquare,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  Maximize2,
  Megaphone,
  Plus,
  Square,
  Trash2,
  X,
} from "lucide-react";

import {
  AdminConfirmDialog,
  AdminDrawer,
  AdminField,
  AdminFormActions,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import PeopleBanner from "@/components/portal/PeopleBanner";
import {
  useAnnouncements,
  useBulkDeleteAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "@/hooks/useAnnouncements";
import type { Announcement } from "@/types";

type Draft = {
  title: string;
  body: string;
  imageUrl: string;
  isPublished: boolean;
};

const EMPTY: Draft = {
  title: "",
  body: "",
  imageUrl: "",
  isPublished: true,
};

const PRESET_IMAGES = [
  { label: "Company Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Team Milestone", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Tech & Innovation", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Celebration", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80" },
];

export default function AnnouncementsPage({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data, isLoading, isError, error } = useAnnouncements(
    isAdmin ? { pageSize: 50 } : { pageSize: 50, publishedOnly: true },
  );
  const announcements: Announcement[] = data?.data.items ?? [];

  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const remove = useDeleteAnnouncement();
  const bulkDelete = useBulkDeleteAnnouncements();

  const [editing, setEditing] = useState<Announcement | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Announcement | null>(null);

  // Multi-selection & Lightbox
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  function openCreate() {
    setEditing("new");
    setDraft(EMPTY);
    setFormError(null);
  }

  function openEdit(item: Announcement) {
    setEditing(item);
    setDraft({
      title: item.title,
      body: item.body,
      imageUrl: item.imageUrl || "",
      isPublished: item.isPublished,
    });
    setFormError(null);
  }

  function close() {
    setEditing(null);
    setFormError(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === announcements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(announcements.map((a) => a.id));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.title.trim();
    const body = draft.body.trim();
    const imageUrl = draft.imageUrl.trim() || null;

    if (!title || !body) {
      setFormError("Both a title and a message are required.");
      return;
    }
    setFormError(null);
    try {
      if (editing === "new") {
        await create.mutateAsync({
          title,
          body,
          imageUrl,
          isPublished: draft.isPublished,
        });
      } else if (editing) {
        await update.mutateAsync({
          id: editing.id,
          payload: {
            title,
            body,
            imageUrl,
            isPublished: draft.isPublished,
          },
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
      setSelectedIds((prev) => prev.filter((id) => id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Could not delete this announcement.",
      );
      setPendingDelete(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    await bulkDelete.mutateAsync(selectedIds);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  }

  const saving = create.isPending || update.isPending;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full h-full min-h-[70vh]">
      {isAdmin && <PeopleBanner active="announcements" />}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>
            Company Announcements
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
            {isAdmin ? "Manage, broadcast news and attach visual media to all employees." : "Stay up to date with the latest company news and milestones."}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {announcements.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="btn-press flex items-center justify-center gap-2 border px-3 py-2 text-xs font-bold transition hover:opacity-90"
                style={{
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-text-2)",
                  background: "var(--adm-surface)",
                }}
              >
                {selectedIds.length === announcements.length ? (
                  <>
                    <CheckSquare size={14} /> Deselect All
                  </>
                ) : (
                  <>
                    <Square size={14} /> Select All
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={openCreate}
              className="btn-press flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: "var(--adm-blue)" }}
            >
              <Plus size={16} /> New Broadcast
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bulk Action Bar */}
      {isAdmin && selectedIds.length > 0 && (
        <div
          className="sticky top-20 z-40 flex items-center justify-between border p-4 shadow-xl backdrop-blur-md"
          style={{
            borderColor: "var(--adm-blue)",
            background: "var(--adm-surface)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-6 w-6 items-center justify-center text-xs font-mono font-bold text-white"
              style={{ background: "var(--adm-blue)" }}
            >
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
              {selectedIds.length} {selectedIds.length === 1 ? "broadcast" : "broadcasts"} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkDelete.isPending}
              className="btn-press flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
              style={{ background: "var(--adm-red)" }}
            >
              <Trash2 size={14} /> Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="btn-press px-3 py-2 text-xs font-semibold hover:opacity-80"
              style={{ color: "var(--adm-text-3)" }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {formError && !editing && (
        <p className="border px-4 py-3 text-sm" role="alert" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}>
          {formError}
        </p>
      )}

      {/* Announcements Stream */}
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
            <p className="text-sm text-adm-text-3 mt-1">
              {isAdmin ? "Publish the first broadcast with New Broadcast." : "There is no news to share right now."}
            </p>
          </div>
        ) : (
          announcements.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <article
                key={item.id}
                className={`border overflow-hidden transition flex flex-col ${
                  isSelected ? "ring-1 ring-adm-blue" : "hover:border-adm-border-2"
                }`}
                style={{
                  borderColor: isSelected ? "var(--adm-blue)" : "var(--adm-border)",
                  background: "var(--adm-surface)",
                }}
              >
                {/* Optional Cover Image */}
                {item.imageUrl && (
                  <div
                    className="relative w-full h-56 sm:h-72 bg-adm-surface-2 cursor-pointer group overflow-hidden border-b"
                    style={{ borderColor: "var(--adm-border)" }}
                    onClick={() => setLightboxImage(item.imageUrl || null)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition bg-black/60 text-white text-xs font-mono px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-sm">
                        <Maximize2 size={13} /> View Photo
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Content Area */}
                <div className="p-6 sm:p-8 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 rounded-none border-adm-border text-adm-blue cursor-pointer"
                        />
                      )}
                      <div className="h-10 w-10 rounded-full bg-adm-blue-light text-adm-blue flex items-center justify-center shrink-0">
                        <Megaphone size={18} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold uppercase text-adm-text leading-snug">
                          {item.title}
                        </h2>
                        <p className="text-xs text-adm-text-3 font-semibold mt-0.5">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        {!item.isPublished && (
                          <span className="bg-adm-amber-light text-adm-amber text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                            Draft
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="h-8 w-8 rounded-full hover:bg-adm-surface-2 flex items-center justify-center text-adm-text-3 hover:text-adm-blue transition"
                          aria-label="Edit announcement"
                          title="Edit announcement"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          className="h-8 w-8 rounded-full hover:bg-adm-red-light flex items-center justify-center text-adm-text-3 hover:text-adm-red transition"
                          aria-label="Delete announcement"
                          title="Delete announcement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-adm-text-2 whitespace-pre-wrap leading-relaxed mt-2 text-[15px]">
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Admin Broadcast Drawer */}
      {isAdmin && (
        <>
          <AdminDrawer
            open={editing !== null}
            title={editing === "new" ? "New Broadcast" : "Edit Broadcast"}
            onClose={close}
          >
            <form onSubmit={submit} className="grid gap-5">
              <AdminField label="Broadcast Title *" htmlFor="announcement-title">
                <input
                  id="announcement-title"
                  required
                  value={draft.title}
                  maxLength={220}
                  onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
                  placeholder="What is the news or milestone?"
                  className={adminInputClass}
                  style={adminInputStyle}
                />
              </AdminField>

              {/* Cover Image with Live Preview and Presets */}
              <div>
                <AdminField label="Cover Image URL (Optional)" htmlFor="announcement-image">
                  <input
                    id="announcement-image"
                    type="url"
                    value={draft.imageUrl}
                    onChange={(event) => setDraft((d) => ({ ...d, imageUrl: event.target.value }))}
                    placeholder="https://images.example.com/cover.jpg or /logo.png"
                    className={adminInputClass}
                    style={adminInputStyle}
                  />
                </AdminField>

                {/* Preset suggestions */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-adm-text-3 mr-1">Presets:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, imageUrl: preset.url }))}
                      className="px-2 py-0.5 text-[10px] font-mono border hover:border-adm-blue transition"
                      style={{
                        borderColor: "var(--adm-border)",
                        background: "var(--adm-surface-2)",
                        color: "var(--adm-text-2)",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                  {draft.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, imageUrl: "" }))}
                      className="px-1.5 py-0.5 text-[10px] text-adm-red hover:underline"
                    >
                      Clear photo
                    </button>
                  )}
                </div>

                {/* Live Image Preview */}
                {draft.imageUrl && (
                  <div className="mt-3 border p-2" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}>
                    <span className="text-[10px] font-mono uppercase text-adm-text-3 block mb-1">Image Preview</span>
                    <div className="relative h-36 w-full overflow-hidden bg-black/20">
                      <img
                        src={draft.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <AdminField label="Message *" htmlFor="announcement-body">
                <textarea
                  id="announcement-body"
                  required
                  rows={8}
                  value={draft.body}
                  onChange={(event) => setDraft((d) => ({ ...d, body: event.target.value }))}
                  placeholder="Write the announcement everyone will read…"
                  className={`${adminInputClass} resize-y`}
                  style={adminInputStyle}
                />
              </AdminField>

              <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: "var(--adm-text-2)" }}>
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(event) => setDraft((d) => ({ ...d, isPublished: event.target.checked }))}
                  className="h-4 w-4 rounded-none text-adm-blue cursor-pointer"
                />
                <span>Publish to all employees now (uncheck to save as draft)</span>
              </label>

              {formError && editing && (
                <p className="text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
                  {formError}
                </p>
              )}

              <AdminFormActions
                onCancel={close}
                isPending={saving}
                submitLabel={editing === "new" ? "Broadcast" : "Save Changes"}
              />
            </form>
          </AdminDrawer>

          {/* Single Delete Confirm */}
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

          {/* Bulk Delete Confirm */}
          <AdminConfirmDialog
            open={isBulkDeleteOpen}
            title="Delete selected announcements?"
            description={`Are you sure you want to permanently delete ${selectedIds.length} broadcasts? This cannot be undone.`}
            isPending={bulkDelete.isPending}
            onConfirm={handleBulkDelete}
            onCancel={() => setBulkDeleteOpen(false)}
          />
        </>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white p-2 hover:bg-black transition"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage}
              alt="Full view"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
