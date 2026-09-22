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
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react";
import type { WAMessage, ConvMeta } from "@/hooks/useWhatsApp";

export type ConversationItem = {
  key: string;
  number: string;
  name: string;
  messages: WAMessage[];
  channel?: string;
  department: "general" | "support" | "direct";
};

export type DepartmentFilter = "all" | "general" | "support" | "direct" | string;
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
  if (s === "failed") return <AlertCircle size={12} className="text-red-500 shrink-0" />;
  if (s === "read") return <CheckCheck size={14} className="text-blue-500 shrink-0" />;
  if (s === "delivered") return <CheckCheck size={14} className="text-adm-text-3 shrink-0" />;
  if (s === "sent") return <Check size={14} className="text-adm-text-3 shrink-0" />;
  return <Clock size={12} className="text-adm-text-3 shrink-0" />;
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
  unreadCounts: {
    general: number;
    support: number;
    direct: number;
    total: number;
    line1?: number;
    line2?: number;
    line3?: number;
    line4?: number;
    line5?: number;
    line6?: number;
    line7?: number;
    [key: string]: number | undefined;
  };
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
    if (currentDepartment === "general" || currentDepartment === "1239592269240963" || currentDepartment === "line1") {
      return conv.channel === "1239592269240963" || conv.department === "general";
    }
    if (currentDepartment === "support" || currentDepartment === "1318810581311680" || currentDepartment === "line2") {
      return (
        conv.channel === "1318810581311680" ||
        (conv.department === "support" &&
          conv.channel !== "1291624014041103" &&
          conv.channel !== "1034864159583818" &&
          conv.channel !== "1083562997861778" &&
          conv.channel !== "2663451950739498" &&
          conv.channel !== "1739099617324219" &&
          conv.channel !== "1485319076722009")
      );
    }
    if (
      currentDepartment === "direct" ||
      currentDepartment === "1034864159583818" ||
      currentDepartment === "1083562997861778" ||
      currentDepartment === "line3"
    ) {
      return (
        conv.channel === "1034864159583818" ||
        conv.channel === "1083562997861778" ||
        (conv.department === "direct" &&
          conv.channel !== "2663451950739498" &&
          conv.channel !== "1485319076722009")
      );
    }
    if (currentDepartment === "2663451950739498" || currentDepartment === "line4") {
      return conv.channel === "2663451950739498";
    }
    if (currentDepartment === "1739099617324219" || currentDepartment === "line5") {
      return conv.channel === "1739099617324219";
    }
    if (currentDepartment === "1485319076722009" || currentDepartment === "line6") {
      return conv.channel === "1485319076722009";
    }
    if (currentDepartment === "1291624014041103" || currentDepartment === "line7") {
      return conv.channel === "1291624014041103";
    }
    return conv.channel === currentDepartment || conv.department === currentDepartment;
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
    <aside
      className="flex h-full w-full md:w-[350px] lg:w-[380px] shrink-0 flex-col border-r"
      style={{
        background: "var(--adm-surface)",
        borderColor: "var(--adm-border)",
      }}
    >
      {/* Top Header & Refresh */}
      <div
        className="flex h-14 items-center justify-between border-b px-4 shrink-0"
        style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-adm-blue text-white shadow-sm">
            <MessageSquare size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight" style={{ color: "var(--adm-text)" }}>
              WhatsApp Inbox
            </h2>
            <p className="text-[11px] font-medium" style={{ color: "var(--adm-text-3)" }}>
              Unified Command Stream
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg p-2 text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2 transition"
          title="Refresh messages"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Department Line Filter Pills & Search */}
      <div
        className="flex flex-col gap-2 border-b p-3 shrink-0"
        style={{ borderColor: "var(--adm-border)" }}
      >
        {/* Line selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* All Lines */}
          <button
            type="button"
            onClick={() => onDepartmentChange("all")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "all"
                ? "bg-adm-text text-adm-bg shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
          >
            <span>All</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                currentDepartment === "all"
                  ? "bg-adm-bg/20 text-adm-bg"
                  : "bg-adm-surface text-adm-text-3"
              }`}
            >
              {unreadCounts.total}
            </span>
          </button>

          {/* Line 1 */}
          <button
            type="button"
            onClick={() => onDepartmentChange("general")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "general" || currentDepartment === "1239592269240963" || currentDepartment === "line1"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 1 (+92 335 6701199)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span>Line 1</span>
            {(unreadCounts.line1 ?? unreadCounts.general) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line1 ?? unreadCounts.general}
              </span>
            )}
          </button>

          {/* Line 2 */}
          <button
            type="button"
            onClick={() => onDepartmentChange("support")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "support" || currentDepartment === "1318810581311680" || currentDepartment === "line2"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 2 (+44 7575 376078)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Line 2</span>
            {(unreadCounts.line2 ?? unreadCounts.support ?? 0) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line2 ?? unreadCounts.support}
              </span>
            )}
          </button>

          {/* Line 3 */}
          <button
            type="button"
            onClick={() => onDepartmentChange("direct")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "direct" ||
              currentDepartment === "1034864159583818" ||
              currentDepartment === "1083562997861778" ||
              currentDepartment === "line3"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 3"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>Line 3</span>
            {(unreadCounts.line3 ?? unreadCounts.direct) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line3 ?? unreadCounts.direct}
              </span>
            )}
          </button>

          {/* Line 4 (NL 1) */}
          <button
            type="button"
            onClick={() => onDepartmentChange("2663451950739498")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "2663451950739498" || currentDepartment === "line4"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 4 (NL 1: 2663451950739498)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span>Line 4</span>
            {(unreadCounts.line4 ?? 0) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line4}
              </span>
            )}
          </button>

          {/* Line 5 (NL 2) */}
          <button
            type="button"
            onClick={() => onDepartmentChange("1739099617324219")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "1739099617324219" || currentDepartment === "line5"
                ? "bg-cyan-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 5 (NL 2: 1739099617324219)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Line 5</span>
            {(unreadCounts.line5 ?? 0) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line5}
              </span>
            )}
          </button>

          {/* Line 6 (SL) */}
          <button
            type="button"
            onClick={() => onDepartmentChange("1485319076722009")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "1485319076722009" || currentDepartment === "line6"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 6 (SL: 1485319076722009)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>Line 6</span>
            {(unreadCounts.line6 ?? 0) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line6}
              </span>
            )}
          </button>

          {/* Line 7 (Sandbox) */}
          <button
            type="button"
            onClick={() => onDepartmentChange("1291624014041103")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
              currentDepartment === "1291624014041103" || currentDepartment === "line7"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-adm-surface-2 text-adm-text-2 border border-adm-border hover:border-adm-text-3 hover:text-adm-text"
            }`}
            title="Line 7 (Sandbox)"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Line 7</span>
            {(unreadCounts.line7 ?? 0) > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                {unreadCounts.line7}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-adm-text-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts, numbers, messages…"
            className="w-full rounded-md border py-1.5 pl-9 pr-8 text-xs outline-none transition focus:border-adm-blue"
            style={{
              borderColor: "var(--adm-border)",
              background: "var(--adm-surface-2)",
              color: "var(--adm-text)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-adm-text-3 hover:text-adm-text"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs pt-0.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-0.5 text-[11px] font-medium transition ${
              statusFilter === "all"
                ? "bg-adm-surface-2 text-adm-text font-bold border border-adm-border"
                : "text-adm-text-3 hover:text-adm-text"
            }`}
          >
            All ({lineFiltered.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unread")}
            className={`rounded-full px-3 py-0.5 text-[11px] font-medium transition ${
              statusFilter === "unread"
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-adm-text-3 hover:text-adm-text"
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("archived")}
            className={`rounded-full px-3 py-0.5 text-[11px] font-medium transition flex items-center gap-1 ${
              statusFilter === "archived"
                ? "bg-adm-surface-2 text-adm-text font-bold border border-adm-border"
                : "text-adm-text-3 hover:text-adm-text"
            }`}
          >
            <Archive size={11} />
            <span>Archived</span>
          </button>
        </div>
      </div>

      {/* Conversations Scroll Stream */}
      <div
        className="flex-1 overflow-y-auto divide-y"
        style={{ borderColor: "var(--adm-border)" }}
      >
        {sortedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-adm-text-3 space-y-2">
            <p className="font-semibold text-adm-text-2">No conversations found</p>
            <span className="text-[11px]">
              {searchQuery ? "Try a different search keyword or number" : "Incoming messages on all 4 lines will stream here"}
            </span>
          </div>
        ) : (
          sortedList.map(({ conv, meta, unread }) => {
            const isSelected = selectedKey === conv.key || selectedKey === conv.number;
            const name = meta?.name || (conv.name !== conv.number ? conv.name : `+${conv.number}`);
            const last = conv.messages.at(-1);
            const isOutbound = last?.direction === "outbound";
            const lastText = last?.body || (last?.type ? `[${last.type}]` : "No messages");

            const isLine4 = conv.channel === "1291624014041103";
            const isLine3 =
              conv.channel === "1034864159583818" ||
              conv.channel === "1083562997861778" ||
              conv.department === "direct";
            const isLine2 =
              conv.channel === "1318810581311680" ||
              (conv.department === "support" && !isLine4 && !isLine3);
            const isLine1 = conv.channel === "1239592269240963" || conv.department === "general";

            const lineThemeColor = isLine4
              ? "#d97706"
              : isLine3
              ? "#7c3aed"
              : isLine2
              ? "#059669"
              : "var(--adm-blue)";

            return (
              <button
                key={conv.key}
                type="button"
                onClick={() => onSelectConversation(conv.key, conv.number, conv.department)}
                className={`flex w-full items-start gap-3 p-3 text-left transition ${
                  isSelected
                    ? "bg-adm-surface-2 border-l-4"
                    : "hover:bg-adm-surface-2/60 border-l-4 border-transparent"
                }`}
                style={{
                  borderLeftColor: isSelected ? lineThemeColor : "transparent",
                }}
              >
                {/* Avatar with Department Color */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ background: lineThemeColor }}
                >
                  {initials(name)}
                </div>

                {/* Info & Last Message */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="truncate text-xs font-bold"
                        style={{ color: "var(--adm-text)" }}
                      >
                        {name}
                      </span>
                      {meta?.pinned && (
                        <Pin size={11} className="shrink-0 text-amber-500 rotate-45" />
                      )}
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-mono"
                      style={{ color: "var(--adm-text-3)" }}
                    >
                      {last ? formatListTime(last.timestamp) : ""}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-1 min-w-0 text-[11px]"
                      style={{ color: "var(--adm-text-2)" }}
                    >
                      {isOutbound && (
                        <span className="shrink-0">
                          <Ticks status={last?.status} />
                        </span>
                      )}
                      <span className="truncate">{lastText}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Department Line indicator */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isLine4
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : isLine3
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            : isLine2
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {isLine4
                          ? "Line 4"
                          : isLine3
                          ? "Line 3"
                          : isLine2
                          ? "Line 2"
                          : "Line 1"}
                      </span>

                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
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
