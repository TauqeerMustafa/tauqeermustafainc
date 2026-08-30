"use client";

import { useMemo, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";

import { AdminConfirmDialog } from "@/components/admin/AdminUI";
import {
  Badge,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  Tabs,
  Toolbar,
} from "@/components/portal/PortalUI";
import { useDeleteMessage, useMarkMessageRead, useMessages } from "@/hooks/useMessages";
import { MESSAGE_KIND_LABEL, classifyMessage, type MessageKind } from "@/lib/message-kind";
import type { ContactMessage } from "@/types";

type Filter = "all" | MessageKind;

const KIND_TONE: Record<MessageKind, "blue" | "green" | "amber" | "neutral"> = {
  job: "amber",
  community: "green",
  service: "blue",
  contact: "neutral",
};

export default function AdminMessagesPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isError, refetch } = useMessages({ pageSize: 100, unreadOnly: false });
  const markRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();

  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const all = data?.data.items ?? [];

  // Every submission is listed here — the kind tabs narrow the view instead of
  // silently dropping rows, which is what made applications look deleted.
  const tagged = useMemo(
    () => all.map((m) => ({ message: m, kind: classifyMessage(m.message) })),
    [all],
  );

  const unreadFor = (kind: Filter) =>
    tagged.filter((t) => (kind === "all" || t.kind === kind) && !t.message.isRead).length;

  const visible = tagged.filter(
    (t) => (filter === "all" || t.kind === filter) && (!unreadOnly || !t.message.isRead),
  );

  async function handleDelete() {
    if (!pendingDelete) return;
    await deleteMessage.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="grid gap-6">
      <PortalPageHeader
        title="Messages"
        description="Every submission from the public forms — contact, service enquiries, job and community applications."
      />

      <Panel padded={false}>
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: `All (${tagged.length})`, count: unreadFor("all") },
            { id: "contact", label: "Contact", count: unreadFor("contact") },
            { id: "service", label: "Service", count: unreadFor("service") },
            { id: "job", label: "Applications", count: unreadFor("job") },
            { id: "community", label: "Community", count: unreadFor("community") },
          ]}
        />
        <Toolbar>
          <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text-2">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-4 w-4 accent-adm-blue"
            />
            Unread only
          </label>
          <span className="ml-auto text-xs text-adm-text-3">{visible.length} shown</span>
        </Toolbar>

        {isLoading && <LoadingBlock label="Loading messages…" />}
        {isError && (
          <ErrorBlock
            message="Could not load messages. Confirm the backend is running and reachable."
            onRetry={() => void refetch()}
          />
        )}
        {!isLoading && !isError && visible.length === 0 && (
          <EmptyBlock title="Nothing here" description="No submissions match this filter yet." />
        )}

        {visible.map(({ message, kind }) => {
          const isOpen = expanded === message.id;
          return (
            <div key={message.id} className="border-b border-adm-border last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  setExpanded(isOpen ? null : message.id);
                  if (!message.isRead) markRead.mutate({ id: message.id, isRead: true });
                }}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-adm-surface-2"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {message.isRead ? (
                    <MailOpen size={18} className="mt-0.5 shrink-0 text-adm-text-3" />
                  ) : (
                    <Mail size={18} className="mt-0.5 shrink-0 text-adm-blue" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`truncate ${message.isRead ? "font-medium text-adm-text-2" : "font-bold text-adm-text"}`}
                    >
                      {message.name}
                      {message.company ? ` · ${message.company}` : ""}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-adm-text-3">{message.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={KIND_TONE[kind]}>{MESSAGE_KIND_LABEL[kind]}</Badge>
                  <span className="hidden text-xs text-adm-text-3 sm:inline">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-adm-border bg-adm-surface-2 px-5 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-adm-text">
                    {message.message}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={`mailto:${message.email}`}
                      className="border border-adm-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-adm-text-2 transition hover:bg-adm-surface hover:text-adm-text"
                    >
                      Reply by email
                    </a>
                    <button
                      type="button"
                      onClick={() => markRead.mutate({ id: message.id, isRead: !message.isRead })}
                      className="border border-adm-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-adm-text-2 transition hover:bg-adm-surface hover:text-adm-text"
                    >
                      Mark as {message.isRead ? "unread" : "read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(message)}
                      className="flex items-center gap-1.5 border border-adm-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-adm-red transition hover:border-adm-red hover:bg-adm-red-light"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Panel>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        description={
          pendingDelete
            ? `The message from "${pendingDelete.name}" will be permanently removed.`
            : undefined
        }
        isPending={deleteMessage.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
