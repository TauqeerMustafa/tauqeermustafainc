"use client";

import { useState } from "react";
import {
  Search,
  RefreshCw,
  Archive,
  Pin,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Briefcase,
  LifeBuoy,
  ShieldCheck,
  X,
} from "lucide-react";
import type { WAMessage, ConvMeta, WANumberInfo } from "@/hooks/useWhatsApp";

export type ConversationItem = {
  key: string;
  number: string;
  name: string;
  messages: WAMessage[];
  channel?: string;
  department: "general" | "support" | "direct";
};

type DepartmentFilter = "all" | "general" | "support" | "direct";
type StatusFilter = "all" | "unread" | "archived";

function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatListTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days <= 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

function Ticks({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  if (s === "failed") return <AlertCircle size={12} className="text-red-400" />;
  if (s === "read") return <CheckCheck size={14} className="text-blue-400" />;
  if (s === "delivered") return <CheckCheck size={14} className="text-slate-400" />;
  if (s === "sent") return <Check size={14} className="text-slate-400" />;
  return <Clock size={12} className="text-slate-500" />;
}

export function ConversationListPane({
  conversations,
  metaMap,
  selectedKey,
  onSelectConversation,
  currentDepartment,
  onDepartmentChange,
  onRefresh,
  unreadCounts,
}: {
  conversations: ConversationItem[];
  metaMap: Record<string, ConvMeta>;
  selectedKey: string | null;
  onSelectConversation: (key: string, number: string, dept: "general" | "support" | "direct") => void;
  currentDepartment: DepartmentFilter;
  onDepartmentChange: (dept: DepartmentFilter) => void;
  onRefresh: () => void;
  unreadCounts: { general: number; support: number; direct: number; total: number };
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const withDetails = conversations.map((conv) => {
    const meta = metaMap[conv.key] || metaMap[conv.number];
    const since = meta?.lastReadAt ? new Date(meta.lastReadAt).getTime() : 0;
    const unread = conv.messages.filter(
      (m) => m.direction === "inbound" && new Date(m.timestamp).getTime() > since
    ).length;
    return { conv, meta, unread };
  });

  // Filter by line/department
  const lineFiltered = withDetails.filter(({ conv }) => {
    if (currentDepartment === "all") return true;
    return conv.department === currentDepartment;
  });

  // Filter by search query
  const searchFiltered = lineFiltered.filter(({ conv, meta }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (meta?.name || conv.name).toLowerCase();
    const num = conv.number;
    const lastBody = (conv.messages.at(-1)?.body || "").toLowerCase();
    return name.includes(q) || num.includes(q) || lastBody.includes(q);
  });

  // Filter by status (all, unread, archived)
  const statusFiltered = searchFiltered.filter(({ meta, unread }) => {
    if (statusFilter === "archived") return !!meta?.archived;
    if (meta?.archived) return false;
    if (statusFilter === "unread") return unread > 0;
    return true;
  });

  // Sort pinned conversations to top, then newest message
  const sortedList = [...statusFiltered].sort((a, b) => {
    const aPin = a.meta?.pinned ? 1 : 0;
    const bPin = b.meta?.pinned ? 1 : 0;
    if (bPin !== aPin) return bPin - aPin;
    const at = a.conv.messages.at(-1) ? new Date(a.conv.messages.at(-1)!.timestamp).getTime() : 0;
    const bt = b.conv.messages.at(-1) ? new Date(b.conv.messages.at(-1)!.timestamp).getTime() : 0;
    return bt - at;
  });

  return (
    <aside className="flex h-full w-full md:w-[350px] lg:w-[380px] shrink-0 flex-col border-r border-slate-800 bg-slate-900/95">
      {/* Top Header & Refresh */}
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
        <div>
          <h1 className="text-sm font-bold text-slate-100">WhatsApp CRM</h1>
          <p className="text-[11px] text-slate-400">Omnichannel Meta Cloud Console</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          title="Refresh messages"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Multi-line Filter Tabs */}
      <div className="p-3 pb-2 border-b border-slate-800/80 space-y-2.5">
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => onDepartmentChange("all")}
            className={`flex items-center justify-center gap-1 rounded py-1.5 transition ${
              currentDepartment === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>All</span>
            {unreadCounts.total > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-slate-950">
                {unreadCounts.total}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDepartmentChange("general")}
            className={`flex items-center justify-center gap-1 rounded py-1.5 transition ${
              currentDepartment === "general"
                ? "bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Line 1: General Inquiries & Sales"
          >
            <span>Line 1</span>
            {unreadCounts.general > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.general}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDepartmentChange("support")}
            className={`flex items-center justify-center gap-1 rounded py-1.5 transition ${
              currentDepartment === "support"
                ? "bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Line 2: Client Support Desk"
          >
            <span>Line 2</span>
            {unreadCounts.support > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-slate-950">
                {unreadCounts.support}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDepartmentChange("direct")}
            className={`flex items-center justify-center gap-1 rounded py-1.5 transition ${
              currentDepartment === "direct"
                ? "bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Line 3: Executive Desk"
          >
            <span>Line 3</span>
            {unreadCounts.direct > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.direct}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, message…"
            className="w-full rounded-md border border-slate-800 bg-slate-950 py-1.5 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-emerald-500/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
              statusFilter === "all"
                ? "bg-slate-800 text-slate-200 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({lineFiltered.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unread")}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
              statusFilter === "unread"
                ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("archived")}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition flex items-center gap-1 ${
              statusFilter === "archived"
                ? "bg-slate-800 text-slate-200 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Archive size={11} />
            <span>Archived</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {sortedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-slate-500 space-y-2">
            <p>No conversations found</p>
            <span className="text-[10px] text-slate-600">
              {searchQuery ? "Try a different search keyword" : "Incoming messages will appear here"}
            </span>
          </div>
        ) : (
          sortedList.map(({ conv, meta, unread }) => {
            const isSelected = selectedKey === conv.key || selectedKey === conv.number;
            const name = meta?.name || (conv.name !== conv.number ? conv.name : `+${conv.number}`);
            const last = conv.messages.at(-1);
            const isOutbound = last?.direction === "outbound";
            const lastText = last?.body || (last?.type ? `[${last.type}]` : "No messages");

            return (
              <button
                key={conv.key}
                type="button"
                onClick={() => onSelectConversation(conv.key, conv.number, conv.department)}
                className={`flex w-full items-start gap-3 p-3 text-left transition ${
                  isSelected
                    ? "bg-slate-800/90 border-l-4 border-emerald-500"
                    : "hover:bg-slate-800/40 border-l-4 border-transparent"
                }`}
              >
                {/* Avatar with Department Color */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                  style={{
                    background:
                      conv.department === "direct"
                        ? "#7c3aed"
                        : conv.department === "support"
                        ? "#059669"
                        : "#2563eb",
                  }}
                >
                  {initials(name)}
                </div>

                {/* Info & Last Message */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate text-xs font-bold text-slate-100">{name}</span>
                      {meta?.pinned && (
                        <Pin size={11} className="shrink-0 text-amber-400 rotate-45" />
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-500 font-mono">
                      {last ? formatListTime(last.timestamp) : ""}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 min-w-0 text-[11px] text-slate-400">
                      {isOutbound && (
                        <span className="shrink-0">
                          <Ticks status={last?.status} />
                        </span>
                      )}
                      <span className="truncate">{lastText}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Department indicator */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          conv.department === "direct"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : conv.department === "support"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {conv.department === "direct"
                          ? "Direct"
                          : conv.department === "support"
                          ? "Support"
                          : "Sales"}
                      </span>

                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
