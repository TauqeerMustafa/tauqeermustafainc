"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";

import { AdminPageHeader, AdminEmptyState, AdminLoadingState, AdminErrorState } from "@/components/admin/AdminUI";
import { useMessages, useMarkMessageRead, useDeleteMessage } from "@/hooks/useMessages";

export default function AdminCommunityPage() {
  const { data, isLoading, isError } = useMessages({ pageSize: 100, unreadOnly: false });
  const markRead = useMarkMessageRead();
  const deleteMsg = useDeleteMessage();

  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const allMessages = data?.data.items ?? [];
  const communityMessages = allMessages.filter(
    (m) =>
      m.message.includes("Community Application:") ||
      m.message.includes("Service: Community") ||
      m.message.includes("Community")
  );

  return (
    <div>
      <AdminPageHeader title="Community" description="Manage community members, posts, and applications." />
      
      <div className="mb-6 flex border-b border-gray-200">
        <button
          className="border-b-2 border-action px-4 py-3 text-sm font-semibold text-action flex items-center gap-2"
        >
          Applications
          {communityMessages.filter(a => !a.is_read).length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
              {communityMessages.filter(a => !a.is_read).length}
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
          {communityMessages.map((msg) => (
            <div
              key={msg.id}
              className={msg.is_read ? "overflow-hidden rounded-xl border transition border-line-2 bg-surface" : "overflow-hidden rounded-xl border transition border-action/20 bg-blue-50/30"}
            >
              <div
                className="flex cursor-pointer items-center justify-between p-4 sm:p-5"
                onClick={() => {
                  setExpandedApp(expandedApp === msg.id ? null : msg.id);
                  if (!msg.is_read) markRead.mutate(msg.id);
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={msg.is_read ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action/10 text-action"}
                  >
                    {msg.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className={msg.is_read ? "text-sm font-medium text-gray-900" : "text-sm font-bold text-gray-900"}>
                      {msg.name} <span className="font-normal text-gray-500">({msg.email})</span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {expandedApp === msg.id && (
                <div className="border-t border-line-2 bg-gray-50/50 p-4 sm:p-6">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                    {msg.message}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => deleteMsg.mutate(msg.id)}
                      className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
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
