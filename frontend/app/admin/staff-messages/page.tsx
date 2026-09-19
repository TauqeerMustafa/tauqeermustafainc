"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Shield,
  User,
  X,
} from "lucide-react";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import CommunicationsBanner from "@/components/portal/CommunicationsBanner";
import { useEmployees } from "@/hooks/useEmployees";
import {
  useReplyToStaff,
  useStaffThreadDetail,
  useStaffThreads,
} from "@/hooks/useStaffMessages";
import type { EmployeeRecord } from "@/types";
import type { StaffMessage, StaffThread } from "@/types/staff-message";

const DESK_CHANNELS = [
  { id: "all", label: "All Desks" },
  { id: "admin-hr", label: "Admin & HR Office", badge: "Admin Desk", color: "text-adm-blue border-adm-blue/30 bg-adm-blue/10" },
  { id: "head-eng", label: "Engineering Lead", badge: "Engineering", color: "text-emerald-700 border-emerald-300 bg-emerald-50" },
  { id: "head-product", label: "Product & Design", badge: "Product", color: "text-purple-700 border-purple-300 bg-purple-50" },
  { id: "exec-desk", label: "Executive Desk", badge: "Executive", color: "text-amber-700 border-amber-300 bg-amber-50" },
] as const;

function getDeskBadge(channel: string) {
  const desk = DESK_CHANNELS.find((d) => d.id === channel);
  if (desk && "badge" in desk) {
    return { label: desk.badge, color: desk.color };
  }
  return { label: "General Desk", color: "text-adm-text-2 border-adm-border bg-adm-surface-2" };
}

function getEmployeeDisplayName(name: string | null | undefined, email?: string | null): string {
  if (!name || name.trim() === "" || name.trim() === "None None" || name.trim() === "None") {
    return email ? email.split("@")[0] : "Staff Member";
  }
  return name.replace(/\bNone\b/g, "").trim() || (email ? email.split("@")[0] : "Staff Member");
}

function formatWhen(value: string | null | undefined) {
  if (!value) return "No messages";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No messages";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const QUICK_RESPONSES = [
  "Acknowledged, reviewing this now.",
  "Approved. You may proceed.",
  "Please schedule a 15-min sync to discuss.",
  "Resolved. Let us know if you need any further support.",
];

export default function StaffMessagesAdminPage() {
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const threadsQuery = useStaffThreads({
    channel: channelFilter === "all" ? undefined : channelFilter,
    urgentOnly,
    unreadOnly,
  });

  const replyMutation = useReplyToStaff();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [replyChannel, setReplyChannel] = useState<string>("admin-hr");
  const [replyUrgent, setReplyUrgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compose Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeEmployee, setComposeEmployee] = useState<EmployeeRecord | null>(null);
  const [composeSearch, setComposeSearch] = useState("");
  const [composeChannel, setComposeChannel] = useState<string>("admin-hr");
  const [composeBody, setComposeBody] = useState("");
  const [composeUrgent, setComposeUrgent] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  const employeesQuery = useEmployees(isComposeOpen);
  const allEmployees = employeesQuery.data ?? [];

  const filteredEmployees = useMemo(() => {
    const q = composeSearch.trim().toLowerCase();
    if (!q) return allEmployees;
    return allEmployees.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.jobTitle ?? "").toLowerCase().includes(q) ||
        (e.employeeIdString ?? "").toLowerCase().includes(q),
    );
  }, [allEmployees, composeSearch]);

  const threads = threadsQuery.data ?? [];

  // Filter threads by search term
  const filteredThreads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter(
      (t) =>
        t.employeeName.toLowerCase().includes(term) ||
        t.employeeEmail.toLowerCase().includes(term) ||
        (t.jobTitle ?? "").toLowerCase().includes(term) ||
        (t.departmentName ?? "").toLowerCase().includes(term) ||
        (t.lastMessagePreview ?? "").toLowerCase().includes(term),
    );
  }, [threads, searchTerm]);

  // Determine active thread
  const activeThreadBrief: StaffThread | undefined = useMemo(() => {
    if (selectedUserId) {
      return threads.find((t) => t.userId === selectedUserId);
    }
    return filteredThreads[0];
  }, [threads, filteredThreads, selectedUserId]);

  const activeUserId = selectedUserId ?? activeThreadBrief?.userId ?? null;
  const threadDetailQuery = useStaffThreadDetail(activeUserId);

  // Active full thread with live messages (ensuring no stale data from previous selections)
  const activeThread: StaffThread | undefined =
    threadDetailQuery.data?.userId === activeUserId
      ? threadDetailQuery.data
      : activeThreadBrief;

  const totalWaiting = threads.reduce((acc, t) => acc + (t.awaitingReply ?? 0), 0);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUserId || !draft.trim()) return;
    setError(null);
    try {
      await replyMutation.mutateAsync({
        userId: activeUserId,
        payload: {
          channel: replyChannel,
          body: draft.trim(),
          isUrgent: replyUrgent,
        },
      });
      setDraft("");
      setReplyUrgent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply to staff member.");
    }
  }

  async function handleSendCompose(e: React.FormEvent) {
    e.preventDefault();
    if (!composeEmployee || !composeBody.trim()) return;
    setComposeError(null);
    try {
      await replyMutation.mutateAsync({
        userId: composeEmployee.userId,
        payload: {
          channel: composeChannel,
          body: composeBody.trim(),
          isUrgent: composeUrgent,
        },
      });
      setSelectedUserId(composeEmployee.userId);
      setIsComposeOpen(false);
      setComposeEmployee(null);
      setComposeBody("");
      setComposeUrgent(false);
      setComposeSearch("");
    } catch (err) {
      setComposeError(
        err instanceof Error ? err.message : "Failed to initiate staff conversation."
      );
    }
  }

  return (
    <div className="space-y-6">
      <CommunicationsBanner active="staff-messages" />

      <AdminPageHeader
        title="Staff Direct Messages"
        description={
          threadsQuery.isLoading
            ? "Loading staff conversations…"
            : totalWaiting > 0
            ? `${totalWaiting} staff message${totalWaiting === 1 ? "" : "s"} waiting for leadership reply.`
            : "Central inbox for direct employee messages, blocker escalations, and confidential staff inquiries."
        }
        actionLabel="Compose Message"
        onAction={() => setIsComposeOpen(true)}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded border border-adm-border bg-adm-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {DESK_CHANNELS.map((d) => {
            const isActive = channelFilter === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setChannelFilter(d.id)}
                className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                  isActive
                    ? "bg-adm-blue text-white"
                    : "border border-adm-border bg-adm-surface text-adm-text-2 hover:bg-adm-surface-2"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-adm-text cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-adm-border text-adm-blue focus:ring-adm-blue"
            />
            <span>Unread Only</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-adm-red cursor-pointer select-none">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(e) => setUrgentOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-adm-border text-adm-red focus:ring-adm-red"
            />
            <span>Urgent Only</span>
          </label>

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-adm-text-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff..."
              className="rounded border border-adm-border bg-adm-surface py-1 pl-8 pr-2.5 text-xs text-adm-text placeholder:text-adm-text-3 focus:border-adm-blue focus:outline-none"
            />
          </div>
        </div>
      </div>

      {threadsQuery.isLoading ? (
        <AdminLoadingState label="Loading staff conversation threads…" />
      ) : threadsQuery.isError ? (
        <AdminErrorState
          message={
            threadsQuery.error instanceof Error
              ? threadsQuery.error.message
              : "Could not load staff direct messages."
          }
        />
      ) : filteredThreads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded border border-adm-border bg-adm-surface p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-adm-surface-2 text-adm-text-3">
            <MessageSquare size={24} />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-adm-text">
              {searchTerm || urgentOnly || unreadOnly
                ? "No matching staff conversations"
                : "No staff messages yet"}
            </h3>
            <p className="text-xs text-adm-text-3">
              {searchTerm || urgentOnly || unreadOnly
                ? "No staff conversations match the active filters. Try clearing your search or filter options."
                : "Start a direct conversation with any employee, or wait for staff to reach out from their direct chat portal."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="inline-flex items-center gap-2 rounded bg-adm-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-adm-blue-mid"
          >
            <Plus size={14} /> Compose New Staff Message
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Left Thread List */}
          <div className="flex flex-col rounded border border-adm-border bg-adm-surface">
            <div className="border-b border-adm-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-adm-text-2">
                  Staff Conversations ({filteredThreads.length})
                </h3>
                {totalWaiting > 0 && (
                  <span className="rounded bg-adm-amber-light px-1.5 py-0.5 text-[10px] font-bold uppercase text-adm-amber">
                    {totalWaiting} awaiting
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(true)}
                title="Start new conversation"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-adm-blue hover:underline"
              >
                <Plus size={13} /> New
              </button>
            </div>

            <ul className="divide-y divide-adm-border max-h-[600px] overflow-y-auto">
              {filteredThreads.map((thread) => {
                const isActive = activeThread?.userId === thread.userId;
                const displayName = getEmployeeDisplayName(thread.employeeName, thread.employeeEmail);
                return (
                  <li key={thread.userId}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserId(thread.userId);
                        setDraft("");
                        setError(null);
                      }}
                      className={`w-full p-3.5 text-left transition ${
                        isActive
                          ? "bg-adm-surface-2 border-l-4 border-l-adm-blue"
                          : "hover:bg-black/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-adm-text">
                            {displayName}
                          </p>
                          <p className="truncate text-[11px] text-adm-text-3">
                            {thread.jobTitle || thread.departmentName || thread.employeeEmail}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {thread.hasUrgent && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-red-700">
                              <AlertCircle size={10} /> Urgent
                            </span>
                          )}
                          {thread.awaitingReply > 0 && (
                            <span className="rounded bg-adm-amber-light px-1.5 py-0.2 text-[10px] font-bold text-adm-amber">
                              {thread.awaitingReply} new
                            </span>
                          )}
                        </div>
                      </div>

                      {thread.lastMessagePreview && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-adm-text-2 italic">
                          &ldquo;{thread.lastMessagePreview}&rdquo;
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px] text-adm-text-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {formatWhen(thread.lastMessageAt)}
                        </span>
                        {(thread.channels ?? []).length > 0 && (
                          <span className="rounded bg-adm-surface-2 px-1.5 py-0.5 border border-adm-border text-[9px]">
                            {getDeskBadge((thread.channels ?? [])[0]).label}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Active Chat Panel */}
          <div className="flex flex-col rounded border border-adm-border bg-adm-surface">
            {activeThread ? (
              <>
                {/* Active thread header */}
                <div className="border-b border-adm-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-adm-surface-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-adm-blue text-white font-bold text-sm">
                      {getEmployeeDisplayName(activeThread.employeeName, activeThread.employeeEmail).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-adm-text">
                        {getEmployeeDisplayName(activeThread.employeeName, activeThread.employeeEmail)}
                      </h3>
                      <p className="text-xs text-adm-text-3">
                        {activeThread.employeeEmail}
                        {activeThread.jobTitle && ` · ${activeThread.jobTitle}`}
                        {activeThread.departmentName && ` (${activeThread.departmentName})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-adm-text-3">
                      Responding Desk:
                    </label>
                    <select
                      value={replyChannel}
                      onChange={(e) => setReplyChannel(e.target.value)}
                      className="rounded border border-adm-border bg-adm-surface px-2.5 py-1 text-xs font-semibold text-adm-text focus:outline-none"
                    >
                      <option value="admin-hr">Admin &amp; HR Desk</option>
                      <option value="head-eng">Head of Engineering</option>
                      <option value="head-product">Head of Product</option>
                      <option value="exec-desk">Executive Desk</option>
                    </select>
                  </div>
                </div>

                {/* Message timeline */}
                <div className="flex max-h-[440px] min-h-[260px] flex-col gap-3 overflow-y-auto p-4 sm:p-5">
                  {(activeThread.messages ?? []).length === 0 ? (
                    <p className="text-xs text-adm-text-3 text-center py-10">
                      No messages recorded in this conversation yet. Send the first message below.
                    </p>
                  ) : (
                    (activeThread.messages ?? []).map((msg) => {
                      const badge = getDeskBadge(msg.channel);
                      return (
                        <div
                          key={msg.id}
                          className={`max-w-[85%] rounded border p-3.5 space-y-1.5 ${
                            msg.isFromStaff
                              ? "self-start border-adm-border bg-adm-surface-2"
                              : "self-end border-adm-blue/30 bg-adm-blue/5"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold uppercase tracking-wider ${
                                  msg.isFromStaff ? "text-adm-text" : "text-adm-blue"
                                }`}
                              >
                                {msg.authorName}
                              </span>
                              <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${badge.color}`}>
                                {badge.label}
                              </span>
                              {msg.isUrgent && (
                                <span className="rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-red-700">
                                  Urgent
                                </span>
                              )}
                            </div>
                            <span className="text-adm-text-3 font-mono text-[10px]">
                              {formatWhen(msg.createdAt)}
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap text-xs text-adm-text leading-relaxed">
                            {msg.body}
                          </p>

                          {msg.attachmentName && (
                            <div className="mt-2 flex items-center justify-between rounded border border-adm-border bg-adm-surface p-2 text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <FileText size={15} className="text-adm-blue shrink-0" />
                                <div className="truncate">
                                  <p className="truncate font-semibold text-adm-text">
                                    {msg.attachmentName}
                                  </p>
                                  {msg.attachmentSize && (
                                    <p className="text-[10px] text-adm-text-3">{msg.attachmentSize}</p>
                                  )}
                                </div>
                              </div>
                              {msg.attachmentUrl && (
                                <a
                                  href={msg.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded bg-adm-surface-2 px-2 py-1 text-[10px] font-bold text-adm-blue hover:bg-black/5"
                                >
                                  <Download size={11} /> Open
                                </a>
                              )}
                            </div>
                          )}

                          {!msg.isFromStaff && (
                            <div className="text-right text-[10px] text-adm-text-3 font-mono">
                              {msg.readAt ? "✓ Read by staff" : "Sent"}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick canned replies */}
                <div className="border-t border-adm-border/70 px-4 pt-3 pb-1 flex flex-wrap items-center gap-1.5 bg-adm-surface-2/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-adm-text-3">
                    Quick Insert:
                  </span>
                  {QUICK_RESPONSES.map((quick, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDraft(quick)}
                      className="rounded border border-adm-border/70 bg-adm-surface px-2 py-0.5 text-[11px] text-adm-text-2 hover:border-adm-blue hover:text-adm-blue transition"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Reply form */}
                <form onSubmit={handleSendReply} className="border-t border-adm-border p-4 bg-adm-surface">
                  {error && (
                    <p className="mb-2 text-xs font-semibold text-red-600">{error}</p>
                  )}

                  <div className="space-y-2.5">
                    <textarea
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={`Reply as ${getDeskBadge(replyChannel).label} to ${getEmployeeDisplayName(activeThread.employeeName, activeThread.employeeEmail)}...`}
                      className={adminInputClass}
                      style={adminInputStyle}
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-adm-text-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={replyUrgent}
                          onChange={(e) => setReplyUrgent(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-adm-border text-red-600 focus:ring-red-500"
                        />
                        <span className="text-[11px]">Mark reply as high priority</span>
                      </label>

                      <button
                        type="submit"
                        disabled={!draft.trim() || replyMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded bg-adm-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-adm-blue-mid disabled:opacity-50"
                      >
                        <Send size={13} />
                        {replyMutation.isPending ? "Sending…" : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-adm-text-3">
                Select an employee conversation from the left to view messages and respond.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose New Message Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded border border-adm-border bg-adm-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-adm-border px-5 py-4 bg-adm-surface-2">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-adm-blue" />
                <h3 className="text-sm font-bold text-adm-text">
                  New Staff Conversation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsComposeOpen(false);
                  setComposeEmployee(null);
                  setComposeError(null);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-adm-text-3 hover:bg-black/10 hover:text-adm-text"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="p-5 space-y-4">
              {composeError && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  {composeError}
                </div>
              )}

              {/* Recipient Employee */}
              <div>
                <label className="block text-xs font-bold text-adm-text mb-1.5">
                  Select Recipient Employee <span className="text-red-500">*</span>
                </label>
                {composeEmployee ? (
                  <div className="flex items-center justify-between rounded border border-adm-blue/40 bg-adm-blue/5 p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-adm-blue text-white text-xs font-bold">
                        {getEmployeeDisplayName(composeEmployee.name, composeEmployee.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-adm-text truncate">
                          {getEmployeeDisplayName(composeEmployee.name, composeEmployee.email)}
                        </p>
                        <p className="text-[11px] text-adm-text-3 truncate">
                          {composeEmployee.email} {composeEmployee.jobTitle ? `· ${composeEmployee.jobTitle}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setComposeEmployee(null)}
                      className="text-xs font-bold text-adm-blue hover:underline shrink-0"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-adm-text-3" />
                      <input
                        type="text"
                        value={composeSearch}
                        onChange={(e) => setComposeSearch(e.target.value)}
                        placeholder="Search employees by name, title, or email..."
                        className="w-full rounded border border-adm-border bg-adm-surface py-2 pl-8 pr-3 text-xs text-adm-text placeholder:text-adm-text-3 focus:border-adm-blue focus:outline-none"
                      />
                    </div>

                    <div className="max-h-44 overflow-y-auto divide-y divide-adm-border rounded border border-adm-border bg-adm-surface">
                      {employeesQuery.isLoading ? (
                        <div className="p-4 text-center text-xs text-adm-text-3 flex items-center justify-center gap-2">
                          <Loader2 size={14} className="animate-spin text-adm-blue" />
                          Loading staff roster...
                        </div>
                      ) : filteredEmployees.length === 0 ? (
                        <p className="p-4 text-center text-xs text-adm-text-3">
                          No employees found matching &ldquo;{composeSearch}&rdquo;.
                        </p>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => setComposeEmployee(emp)}
                            className="w-full flex items-center justify-between p-2.5 text-left hover:bg-adm-surface-2 transition text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-adm-text truncate">
                                {getEmployeeDisplayName(emp.name, emp.email)}
                              </p>
                              <p className="text-[11px] text-adm-text-3 truncate">
                                {emp.email} {emp.jobTitle ? `· ${emp.jobTitle}` : ""}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-adm-blue shrink-0">
                              Select &rarr;
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Desk Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-adm-text mb-1.5">
                    Sending As (Desk)
                  </label>
                  <select
                    value={composeChannel}
                    onChange={(e) => setComposeChannel(e.target.value)}
                    className="w-full rounded border border-adm-border bg-adm-surface px-3 py-2 text-xs font-semibold text-adm-text focus:border-adm-blue focus:outline-none"
                  >
                    <option value="admin-hr">Admin &amp; HR Desk</option>
                    <option value="head-eng">Head of Engineering</option>
                    <option value="head-product">Head of Product</option>
                    <option value="exec-desk">Executive Desk</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-adm-red cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={composeUrgent}
                      onChange={(e) => setComposeUrgent(e.target.checked)}
                      className="h-4 w-4 rounded border-adm-border text-red-600 focus:ring-red-500"
                    />
                    <span>Flag as High Priority / Urgent</span>
                  </label>
                </div>
              </div>

              {/* Quick Outreach Templates */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-adm-text-3 mb-1.5">
                  Quick Outreach Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Please provide a status update on your current deliverables.",
                    "Can we schedule a 10-minute sync to align on priorities?",
                    "Following up on our recent conversation. Please review.",
                    "Urgent action required regarding project deliverables.",
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setComposeBody(tpl)}
                      className="rounded border border-adm-border/80 bg-adm-surface-2 px-2 py-0.5 text-[11px] text-adm-text-2 hover:border-adm-blue hover:text-adm-blue transition text-left"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message text */}
              <div>
                <label className="block text-xs font-bold text-adm-text mb-1.5">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message to this staff member..."
                  className={adminInputClass}
                  style={adminInputStyle}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-adm-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsComposeOpen(false);
                    setComposeEmployee(null);
                    setComposeError(null);
                  }}
                  className="rounded border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-text hover:bg-adm-surface-2 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!composeEmployee || !composeBody.trim() || replyMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded bg-adm-blue px-5 py-2 text-xs font-bold text-white transition hover:bg-adm-blue-mid disabled:opacity-50"
                >
                  <Send size={13} />
                  {replyMutation.isPending ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
