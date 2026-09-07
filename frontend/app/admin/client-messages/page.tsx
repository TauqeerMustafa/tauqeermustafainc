"use client";

/**
 * Admin → Inbox → Client Portal: the staff half of the client portal's
 * "Direct line".
 *
 * Clients could always post a note from `/client/dashboard`, but nothing read
 * `client_messages` and nothing could write a message the client did not author
 * — so every note went into a table no portal showed, and their "unread
 * replies" counter was hardcoded to zero because a reply was impossible. This
 * page reads `GET /clients/threads` and answers through
 * `POST /clients/{id}/messages`, which is what makes that counter real.
 *
 * Both routes are manager-gated (admin, exec, team lead).
 */

import { useMemo, useState } from "react";
import { Building2, Send } from "lucide-react";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import { useClientThreads, useReplyToClient } from "@/hooks/useClientMessages";
import type { ClientThread } from "@/types/client";

function formatWhen(value: string | null | undefined) {
  if (!value) return "No messages yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No messages yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AdminClientMessagesPage() {
  const threads = useClientThreads();
  const reply = useReplyToClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const rows = threads.data ?? [];
  // Default to whatever is at the top of the queue — the server already sorts
  // clients awaiting a reply first.
  const active: ClientThread | undefined = useMemo(
    () => rows.find((thread) => thread.clientId === selectedId) ?? rows[0],
    [rows, selectedId],
  );
  const waiting = rows.reduce((total, thread) => total + thread.awaitingReply, 0);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!active || !draft.trim()) return;
    setError(null);
    try {
      await reply.mutateAsync({ clientId: active.clientId, body: draft.trim() });
      setDraft("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send this reply.");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Client Portal Messages"
        description={
          threads.isLoading
            ? "Loading client conversations…"
            : waiting > 0
              ? `${waiting} client message${waiting === 1 ? "" : "s"} waiting for a reply.`
              : "Every client conversation from the client portal's direct line."
        }
      />

      {threads.isLoading ? (
        <AdminLoadingState label="Loading client conversations…" />
      ) : threads.isError ? (
        <AdminErrorState
          message={
            threads.error instanceof Error ? threads.error.message : "Could not load client messages."
          }
        />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No client accounts yet"
          description="Conversations appear here once a client registers in the client portal."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--adm-border)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--adm-text-2)" }}>
                Clients
              </h3>
            </div>
            <ul className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {rows.map((thread) => {
                const isActive = active?.clientId === thread.clientId;
                return (
                  <li key={thread.clientId}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(thread.clientId);
                        setDraft("");
                        setError(null);
                      }}
                      className="w-full px-4 py-3 text-left transition"
                      style={{
                        background: isActive ? "var(--adm-surface-2)" : "transparent",
                        borderLeft: `3px solid ${isActive ? "var(--adm-blue)" : "transparent"}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                          {thread.clientName}
                        </span>
                        {thread.awaitingReply > 0 ? (
                          <span
                            className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: "var(--adm-amber-light)", color: "var(--adm-amber)" }}
                          >
                            {thread.awaitingReply} new
                          </span>
                        ) : null}
                      </div>
                      <span className="mt-0.5 block truncate text-xs" style={{ color: "var(--adm-text-3)" }}>
                        {thread.clientEmail}
                      </span>
                      <span className="mt-1 block text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                        {formatWhen(thread.lastMessageAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            className="flex flex-col border"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
          >
            {active ? (
              <>
                <div
                  className="flex items-center gap-3 border-b px-5 py-4"
                  style={{ borderColor: "var(--adm-border)" }}
                >
                  <Building2 size={18} style={{ color: "var(--adm-blue)" }} />
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--adm-text)" }}>
                      {active.clientName}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
                      {active.clientEmail}
                    </p>
                  </div>
                </div>

                <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto px-5 py-5">
                  {active.messages.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
                      No messages with this client yet. Send the first one below.
                    </p>
                  ) : (
                    // Server order is newest first; read it oldest-first here.
                    [...active.messages].reverse().map((message) => (
                      <div
                        key={message.id}
                        className="max-w-[80%] border p-4"
                        style={{
                          alignSelf: message.fromTeam ? "flex-end" : "flex-start",
                          borderColor: message.fromTeam ? "var(--adm-blue)" : "var(--adm-border)",
                          background: message.fromTeam ? "var(--adm-blue-light)" : "var(--adm-surface-2)",
                        }}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: message.fromTeam ? "var(--adm-blue)" : "var(--adm-text-2)" }}
                          >
                            {message.fromTeam ? message.authorName : active.clientName}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                            {formatWhen(message.createdAt)}
                          </span>
                          {message.fromTeam && !message.readAt ? (
                            <span className="text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                              · unread
                            </span>
                          ) : null}
                        </div>
                        <p
                          className="whitespace-pre-wrap text-sm leading-6"
                          style={{ color: "var(--adm-text)" }}
                        >
                          {message.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={send}
                  className="border-t px-5 py-4"
                  style={{ borderColor: "var(--adm-border)" }}
                >
                  <label
                    htmlFor="client-reply"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--adm-text-2)" }}
                  >
                    Reply to {active.clientName}
                  </label>
                  <textarea
                    id="client-reply"
                    rows={3}
                    maxLength={5000}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Answer their question or share the next update…"
                    className={`${adminInputClass} resize-y`}
                    style={adminInputStyle}
                  />
                  {error ? (
                    <p className="mt-2 text-sm" role="alert" style={{ color: "var(--adm-red)" }}>
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={reply.isPending || !draft.trim()}
                    className="btn-press mt-3 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--adm-blue)" }}
                  >
                    <Send size={14} />
                    {reply.isPending ? "Sending…" : "Send reply"}
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
