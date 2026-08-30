"use client";

import { useState } from "react";
import { Pencil, Trash2, Mail, MailOpen } from "lucide-react";

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
import { useCareers, useCreateCareer, useDeleteCareer, useUpdateCareer } from "@/hooks/useCareers";
import { useMessages, useMarkMessageRead, useDeleteMessage } from "@/hooks/useMessages";
import type { Career, ContactMessage } from "@/types";
import type { CareerPayload } from "@/services/career.service";

const emptyForm: CareerPayload = {
  slug: "",
  title: "",
  location: "",
  type: "Full-time",
  summary: "",
  responsibilities: [],
  isOpen: true,
};

function toList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminCareersPage() {
  const { data, isLoading, isError } = useCareers({ openOnly: false, pageSize: 100 });
  const createCareer = useCreateCareer();
  const updateCareer = useUpdateCareer();
  const deleteCareer = useDeleteCareer();
  const messagesQuery = useMessages({ pageSize: 100, unreadOnly: false });
  const markRead = useMarkMessageRead();
  const deleteMsg = useDeleteMessage();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Career | null>(null);
  const [form, setForm] = useState<CareerPayload>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Career | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'applications'>('roles');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const jobs = data?.data.items ?? [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  }

  function openEdit(job: Career) {
    setEditing(job);
    setForm({
      slug: job.slug,
      title: job.title,
      location: job.location,
      type: job.type,
      summary: job.summary,
      responsibilities: job.responsibilities ?? [],
      isOpen: job.isOpen,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateCareer.mutateAsync({ id: editing.id, payload: form });
    } else {
      await createCareer.mutateAsync(form);
    }
    setDrawerOpen(false);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteCareer.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  const isSaving = createCareer.isPending || updateCareer.isPending;

  const allMessages = messagesQuery.data?.data.items ?? [];
  const applications = allMessages.filter((m: ContactMessage) => m.message.includes("Job Application:"));

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[var(--adm-text)]">Careers & Applicants</h1>
          <p className="mt-1 text-sm text-[var(--adm-text-3)]">Manage open roles and review job applications.</p>
        </div>
        {activeTab === 'roles' && (
          <button
            onClick={openCreate}
            className="bg-[var(--adm-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            New Role
          </button>
        )}
      </div>

      <div className="mb-6 flex border-b border-[var(--adm-border)]">
        <button
          onClick={() => setActiveTab('roles')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'roles' ? 'border-action text-action' : 'border-transparent text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)]'
          }`}
        >
          Job Postings
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`border-b-2 px-4 py-3 text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'applications' ? 'border-action text-action' : 'border-transparent text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)]'
          }`}
        >
          Applications
          {applications.filter((a: ContactMessage) => !a.isRead).length > 0 && (
            <span className="bg-[var(--adm-red-light)] px-2 py-0.5 text-xs text-[var(--adm-red)]">
              {applications.filter((a: ContactMessage) => !a.isRead).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'roles' && (
        <>
          {isLoading ? <AdminLoadingState label="Loading roles..." /> : null}
          {isError ? (
            <AdminErrorState message="Could not load job listings. Confirm the backend is running and reachable." />
          ) : null}

          {!isLoading && !isError && jobs.length === 0 ? (
            <AdminEmptyState title="No roles yet" description="Post your first opening to get started." />
          ) : null}

          {!isLoading && !isError && jobs.length > 0 ? (
            <div className="overflow-x-auto border border-line-2 bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line-2 bg-canvas text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {jobs.map((job) => (
                <tr key={job.id} className="text-ink transition hover:bg-canvas">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{job.title}</p>
                    <p className="text-xs text-ink-muted">{job.type}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{job.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold ${job.isOpen ? "bg-action/10 text-action" : "bg-line-2 text-ink-muted"}`}
                    >
                      {job.isOpen ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(job)}
                        aria-label={`Edit ${job.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-line-2 text-ink-muted transition hover:border-ink hover:text-ink"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(job)}
                        aria-label={`Delete ${job.title}`}
                        className="flex h-8 w-8 items-center justify-center border border-line-2 text-ink-muted transition hover:border-[var(--adm-red)] hover:text-[var(--adm-red)]"
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
        </>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <AdminEmptyState title="No applications yet" description="Job applications will appear here." />
          ) : (
            applications.map((msg: ContactMessage) => (
              <div
                key={msg.id}
                className={`overflow-hidden border transition ${
                  msg.isRead ? "border-line-2 bg-surface" : "border-action/20 bg-[var(--adm-blue-light)]"
                }`}
              >
                <div
                  className="flex cursor-pointer items-center justify-between p-4 sm:p-5"
                  onClick={() => {
                    setExpandedApp(expandedApp === msg.id ? null : msg.id);
                    if (!msg.isRead) markRead.mutate({ id: msg.id, isRead: true });
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        msg.isRead ? "bg-[var(--adm-surface-2)] text-[var(--adm-text-3)]" : "bg-action/10 text-action"
                      }`}
                    >
                      {msg.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={`text-sm ${msg.isRead ? "font-medium text-[var(--adm-text)]" : "font-bold text-[var(--adm-text)]"}`}>
                        {msg.name} <span className="font-normal text-[var(--adm-text-3)]">({msg.email})</span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--adm-text-3)]">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {expandedApp === msg.id && (
                  <div className="border-t border-line-2 bg-[var(--adm-surface-2)] p-4 sm:p-6">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[var(--adm-text-2)]">
                      {msg.message}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => deleteMsg.mutate(msg.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--adm-red)] hover:bg-[var(--adm-surface-2)]"
                      >
                        <Trash2 className="h-4 w-4" /> Delete Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <AdminDrawer
        open={drawerOpen}
        title={editing ? "Edit Role" : "New Role"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid gap-5">
          <AdminField label="Title" htmlFor="c-title">
            <input
              id="c-title"
              required
              className={adminInputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </AdminField>
          <AdminField label="Slug" htmlFor="c-slug">
            <input
              id="c-slug"
              required
              pattern="[a-z0-9-]+"
              className={adminInputClass}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </AdminField>
          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Location" htmlFor="c-location">
              <input
                id="c-location"
                required
                className={adminInputClass}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </AdminField>
            <AdminField label="Type" htmlFor="c-type">
              <select
                id="c-type"
                className={adminInputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Hybrid</option>
              </select>
            </AdminField>
          </div>
          <AdminField label="Summary" htmlFor="c-summary">
            <textarea
              id="c-summary"
              required
              rows={3}
              className={adminInputClass}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </AdminField>
          <AdminField label="Responsibilities (one per line)" htmlFor="c-resp">
            <textarea
              id="c-resp"
              rows={5}
              className={adminInputClass}
              value={(form.responsibilities ?? []).join("\n")}
              onChange={(e) => setForm({ ...form, responsibilities: toList(e.target.value) })}
            />
          </AdminField>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--adm-text-2)]">
            <input
              type="checkbox"
              checked={form.isOpen}
              onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
              className="h-4 w-4 accent-[var(--adm-blue)]"
            />
            Open for applications
          </label>

          <AdminFormActions onCancel={() => setDrawerOpen(false)} isPending={isSaving} />
        </form>
      </AdminDrawer>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this role?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : undefined}
        isPending={deleteCareer.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

