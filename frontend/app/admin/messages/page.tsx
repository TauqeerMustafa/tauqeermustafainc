"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/admin/AdminUI";
import { useDeleteMessage, useMarkMessageRead, useMessages } from "@/hooks/useMessages";
import type { ContactMessage } from "@/types";

export default function AdminMessagesPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, isError } = useMessages({ pageSize: 100, unreadOnly });
  const markRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();

  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const messages = data?.data.items ?? [];

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteMessage.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions from the site."
      />

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`px-3 py-1.5 text-sm font-semibold transition ${!unreadOnly ? "bg-yellow-400 text-black" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`px-3 py-1.5 text-sm font-semibold transition ${unreadOnly ? "bg-yellow-400 text-black" : "border border-white/10 text-slate-300 hover:bg-white/5"}`}
        >
          Unread
        </button>
      </div>

      {isLoading ? <AdminLoadingState label="Loading messages..." /> : null}
      {isError ? (
        <AdminErrorState message="Could not load messages. Confirm the backend is running and reachable." />
      ) : null}

      {!isLoading && !isError && messages.length === 0 ? (
        <AdminEmptyState title="No messages yet" description="Submissions from the contact form will appear here." />
      ) : null}

      {!isLoading && !isError && messages.length > 0 ? (
        <div className="grid gap-3">
          {messages.map((message) => {
            const isOpen = expanded === message.id;
            return (
              <div key={message.id} className="border border-white/10 bg-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setExpanded(isOpen ? null : message.id);
                    if (!message.isRead) {
                      markRead.mutate({ id: message.id, isRead: true });
                    }
                  }}
                  className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {message.isRead ? (
                      <MailOpen size={18} className="mt-0.5 shrink-0 text-slate-500" />
                    ) : (
                      <Mail size={18} className="mt-0.5 shrink-0 text-yellow-400" />
                    )}
                    <div className="min-w-0">
                      <p className={`truncate font-semibold ${message.isRead ? "text-slate-300" : "text-white"}`}>
                        {message.name}
                        {message.company ? ` · ${message.company}` : ""}
                      </p>
                      <p className="truncate text-xs text-slate-500">{message.email}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs text-slate-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </button>

                {isOpen ? (
                  <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{message.message}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={`mailto:${message.email}`}
                        className="border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-yellow-400"
                      >
                        Reply by email
                      </a>
                      <button
                        type="button"
                        onClick={() => markRead.mutate({ id: message.id, isRead: !message.isRead })}
                        className="border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-yellow-400"
                      >
                        Mark as {message.isRead ? "unread" : "read"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(message)}
                        className="flex items-center gap-1.5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-red-400 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        description={pendingDelete ? `The message from "${pendingDelete.name}" will be permanently removed.` : undefined}
        isPending={deleteMessage.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
