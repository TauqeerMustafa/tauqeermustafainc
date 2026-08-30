"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";

import { AdminPageHeader, AdminEmptyState, AdminLoadingState, AdminErrorState } from "@/components/admin/AdminUI";
import { useMessages, useMarkMessageRead, useDeleteMessage } from "@/hooks/useMessages";
import type { ContactMessage } from "@/types";

export default function AdminCommunityPage() {
  const { data, isLoading, isError } = useMessages({ pageSize: 100, unreadOnly: false });
  const markRead = useMarkMessageRead();
  const deleteMsg = useDeleteMessage();

  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const allMessages = data?.data.items ?? [];
  const communityMessages = allMessages.filter(
    (m: ContactMessage) =>
      m.message.includes("Community Application:") ||
      m.message.includes("Service: Community") ||
      m.message.includes("Community")
  );

  return (
    <div>
      <AdminPageHeader title="Community" description="Manage community members, posts, and applications." />
      
      <div className="mb-6 flex border-b border-[var(--adm-border)]">
        <button
          className="border-b-2 border-action px-4 py-3 text-sm font-semibold text-action flex items-center gap-2"
        >
          Applications
          {communityMessages.filter((a: ContactMessage) => !a.isRead).length > 0 && (
            <span className="bg-[var(--adm-red-light)] px-2 py-0.5 text-xs text-[var(--adm-red)]">
              {communityMessages.filter((a: ContactMessage) => !a.isRead).length}
            </span>
          )}
        </button>
      </div>

      {isLoading ? <AdminLoadingState label="Loading community applications..." /> : null}
      {isError ? (
        <AdminErrorState message="Could not load applications. Confirm the backend is running and reachable." />
      ) : null}

      {!isLoading && !isError && communityMessages.length === 0 ? (
        <AdminEmptyState title="No applications yet" description="Community applications will appear here." />
      ) : null}

      {!isLoading && !isError && communityMessages.length > 0 && (
        <div className="space-y-4">
          {communityMessages.map((msg: ContactMessage) => (
            <div
              key={msg.id}
              className={msg.isRead ? "overflow-hidden border transition border-line-2 bg-surface" : "overflow-hidden border transition border-action/20 bg-[var(--adm-blue-light)]"}
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
                    className={msg.isRead ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--adm-surface-2)] text-[var(--adm-text-3)]" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action/10 text-action"}
                  >
                    {msg.isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className={msg.isRead ? "text-sm font-medium text-[var(--adm-text)]" : "text-sm font-bold text-[var(--adm-text)]"}>
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
          ))}
        </div>
      )}
    </div>
  );
}
