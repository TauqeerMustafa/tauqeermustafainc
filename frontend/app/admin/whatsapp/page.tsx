"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Check,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Trash2,
  Bot,
  MessageSquare,
  BarChart3,
  Search,
  Tag,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  Sparkles,
  MoreVertical,
  Paperclip,
  Archive,
  ArchiveRestore,
  Pin,
  PinOff,
  ArrowLeft,
  Circle,
  Lock,
  Smile,
  Mic,
  X,
} from "lucide-react";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
  AdminField,
  adminInputClass,
  adminInputStyle,
} from "@/components/admin/AdminUI";
import {
  useWhatsAppMessages,
  useSendWhatsAppMessage,
  useWhatsAppStats,
  useAutoReplyRules,
  useSaveAutoReplyRules,
  useWhatsAppTemplates,
  useSaveTemplate,
  useDeleteTemplate,
  useMetaTemplates,
  useSubmitMetaTemplate,
  uploadWhatsAppMedia,
  useConversationMeta,
  useUpdateConversationMeta,
  useDeleteConversation,
} from "@/hooks/useWhatsApp";
import type { WAMessage, AutoReplyRule, WATemplate, MetaTemplate, MediaKind, ConvMeta } from "@/hooks/useWhatsApp";
import { BUTTON_TEMPLATES } from "@/lib/button-templates";
import { countVariables } from "@/lib/meta-templates";

type MessageType = "text" | "media" | "buttons" | "template";
type TabKey = "inbox" | "send" | "templates" | "rules" | "stats";
type DealStatus = "new" | "contacted" | "negotiating" | "won" | "lost";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "inbox", label: "Inbox", icon: <MessageSquare size={16} /> },
  { key: "send", label: "Send Message", icon: <Send size={16} /> },
  { key: "templates", label: "Start Chat", icon: <Sparkles size={16} /> },
  { key: "rules", label: "Auto-Reply", icon: <Bot size={16} /> },
  { key: "stats", label: "Stats", icon: <BarChart3 size={16} /> },
];

const DEAL_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Lead", color: "#3B82F6", bgColor: "#DBEAFE" },
  { value: "contacted", label: "Contacted", color: "#8B5CF6", bgColor: "#EDE9FE" },
  { value: "negotiating", label: "Negotiating", color: "#F59E0B", bgColor: "#FEF3C7" },
  { value: "won", label: "Deal Won", color: "#10B981", bgColor: "#D1FAE5" },
  { value: "lost", label: "Lost", color: "#EF4444", bgColor: "#FEE2E2" },
];

// ─── Helpers ────────────────────────────────────────────────────────────

type Conversation = {
  number: string;
  name: string;
  messages: WAMessage[];
  dealStatus?: DealStatus;
  notes?: string;
  tags?: string[];
};

function numberOf(m: WAMessage): string {
  if (m.jid) return m.jid.split("@")[0].split(":")[0];
  const raw = m.direction === "inbound" ? m.from : m.to;
  return (raw || "unknown").replace(/[^0-9]/g, "") || "unknown";
}

/** Group messages into conversations, newest activity first. */
function groupConversations(messages: WAMessage[]): Conversation[] {
  const byNumber = new Map<string, Conversation>();
  for (const m of messages) {
    const number = numberOf(m);
    let conv = byNumber.get(number);
    if (!conv) {
      conv = { number, name: number, messages: [], dealStatus: "new", notes: "", tags: [] };
      byNumber.set(number, conv);
    }
    if (m.direction === "inbound" && m.name && m.name !== number) conv.name = m.name;
    conv.messages.push(m);
  }
  const convos = [...byNumber.values()];
  for (const c of convos) {
    c.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  convos.sort((a, b) => {
    const at = a.messages.at(-1) ? new Date(a.messages.at(-1)!.timestamp).getTime() : 0;
    const bt = b.messages.at(-1) ? new Date(b.messages.at(-1)!.timestamp).getTime() : 0;
    return bt - at;
  });
  return convos;
}

// ─── Page ───────────────────────────────────────────────────────────────

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("inbox");
  const [prefillRecipient, setPrefillRecipient] = useState<string | null>(null);

  const goReply = (number: string) => {
    setPrefillRecipient(number);
    setActiveTab("send");
  };

  return (
    <div>
      <AdminPageHeader
        title="WhatsApp Business Manager"
        description="Manage customer conversations, send messages, and track deals"
      />

      {/* Tabs */}
      <div
        className="mb-6 flex items-center gap-1 overflow-x-auto border-b"
        style={{ borderColor: "var(--adm-border)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition"
            style={{
              borderColor: activeTab === tab.key ? "var(--adm-blue)" : "transparent",
              color: activeTab === tab.key ? "var(--adm-blue)" : "var(--adm-text-2)",
              marginBottom: "-1px",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "inbox" && <InboxTab onReply={goReply} />}
      {activeTab === "send" && (
        <SendTab
          key={prefillRecipient ?? "blank"}
          defaultRecipient={prefillRecipient ?? ""}
          onSent={() => setPrefillRecipient(null)}
        />
      )}
      {activeTab === "templates" && <MetaTemplatesTab defaultRecipient={prefillRecipient ?? ""} />}
      {activeTab === "rules" && <RulesTab />}
      {activeTab === "stats" && <StatsTab />}
    </div>
  );
}

// ─── Inbox ──────────────────────────────────────────────────────────────

// WhatsApp Web (light) palette — matched to the real client.
const WA = {
  panel: "#f0f2f5", // header bars, composer, app chrome
  panelBorder: "#d1d7db",
  listBg: "#ffffff", // chat-list background
  chatBg: "#efeae2", // conversation wallpaper base
  out: "#d9fdd3", // outgoing bubble
  outTail: "#d9fdd3",
  in: "#ffffff", // incoming bubble
  green: "#00a884", // primary accent / send
  headerGreen: "#008069",
  badge: "#25d366", // unread count badge
  tick: "#53bdeb", // read ✓✓ (blue)
  tickGrey: "#8696a0", // sent/delivered ✓
  text: "#111b21", // primary text
  sub: "#667781", // secondary text / timestamps
  icon: "#54656f", // header icons
  divider: "#e9edef",
  datePill: "#ffffff",
  dateText: "#54656f",
  e2e: "#fdf6cb", // encryption notice pill
  e2eText: "#54656f",
};
// Faithful WhatsApp wallpaper doodle tile (subtle, low-opacity marks on #efeae2).
const DOODLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='0.035' stroke-width='1.4'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cpath d='M40 8l6 6-6 6-6-6z'/%3E%3Cpath d='M8 42h10M13 37v10'/%3E%3Ccircle cx='46' cy='44' r='5'/%3E%3C/g%3E%3C/svg%3E\")";

function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function unreadCount(conv: Conversation, meta?: ConvMeta) {
  const since = meta?.lastReadAt ? new Date(meta.lastReadAt).getTime() : 0;
  return conv.messages.filter((m) => m.direction === "inbound" && new Date(m.timestamp).getTime() > since).length;
}

/** WhatsApp-style labels for messages that carry no text of their own. */
const MEDIA_LABELS: Record<string, string> = {
  image: "📷 Photo",
  video: "🎥 Video",
  audio: "🎤 Voice message",
  voice: "🎤 Voice message",
  document: "📄 Document",
  sticker: "🏷️ Sticker",
  location: "📍 Location",
  contacts: "👤 Contact",
  reaction: "💬 Reaction",
  unsupported: "⚠️ Unsupported message",
};

/**
 * Readable text for a message. Media, stickers and other non-text types are
 * stored with an empty body, so fall back to a type label instead of rendering
 * a blank bubble.
 */
function describeMessage(m: WAMessage) {
  const body = (m.body || "").trim();
  if (body) return body;
  if (MEDIA_LABELS[m.type]) return MEDIA_LABELS[m.type];
  return m.type && m.type !== "text" ? `📎 ${m.type}` : "";
}

function lastPreview(conv: Conversation) {
  const m = conv.messages.at(-1);
  if (!m) return "";
  return describeMessage(m).replace(/\n/g, " ");
}

/** WhatsApp chat-list timestamp: time today, "Yesterday", weekday this week, else date. */
function formatListTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days <= 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "long" });
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/** WhatsApp date divider label: TODAY / YESTERDAY / full date. */
function formatDateDivider(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days <= 0) return "TODAY";
  if (days === 1) return "YESTERDAY";
  return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

const dayKey = (ts: string) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/**
 * A <select> that always offers a "Custom…" escape hatch. Picking it reveals a
 * free-text input so the admin is never limited to the preset options.
 */
function SelectWithCustom({
  value,
  onChange,
  options,
  id,
  placeholder,
  customLabel = "✏️ Custom…",
  customPlaceholder = "Type your own value…",
  className = adminInputClass,
  style = adminInputStyle,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  placeholder?: string;
  customLabel?: string;
  customPlaceholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isPreset = options.some((o) => o.value === value);
  const [custom, setCustom] = useState(!isPreset && value !== "");
  return (
    <div className="space-y-2">
      <select
        id={id}
        value={custom ? "__custom__" : value}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setCustom(true);
            onChange("");
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
        className={className}
        style={style}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value="__custom__">{customLabel}</option>
      </select>
      {custom && (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={customPlaceholder}
            className={adminInputClass}
            style={adminInputStyle}
          />
          <button
            type="button"
            onClick={() => {
              setCustom(false);
              onChange(options[0]?.value ?? "");
            }}
            className="shrink-0 rounded p-2"
            style={{ color: "var(--adm-text-3)" }}
            aria-label="Use a preset instead"
            title="Back to list"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function InboxTab({ onReply }: { onReply: (number: string) => void }) {
  const { data, isLoading, isError, refetch } = useWhatsAppMessages();
  const { data: metaData } = useConversationMeta();
  const updateMeta = useUpdateConversationMeta();
  const deleteConv = useDeleteConversation();

  const metaMap = metaData?.data ?? {};

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<string | null>(null); // customer number

  if (isLoading) return <AdminLoadingState label="Loading conversations…" />;
  if (isError)
    return <AdminErrorState message="Could not load messages. Check your WhatsApp configuration." />;

  const allMessages = data?.data ?? [];
  const conversations = groupConversations(allMessages);

  const withMeta = conversations.map((conv) => {
    const meta = metaMap[conv.number];
    return { conv, meta, unread: unreadCount(conv, meta) };
  });

  const searched = withMeta.filter(({ conv, meta }) => {
    const q = searchQuery.toLowerCase();
    const name = (meta?.name || conv.name).toLowerCase();
    return name.includes(q) || conv.number.includes(searchQuery);
  });

  const archivedList = searched.filter((x) => x.meta?.archived);
  const activeList = searched
    .filter((x) => !x.meta?.archived)
    .filter((x) => (filter === "unread" ? x.unread > 0 : true))
    .sort((a, b) => Number(!!b.meta?.pinned) - Number(!!a.meta?.pinned));
  const list = showArchived ? archivedList : activeList;

  const selectedConv = selected ? withMeta.find((x) => x.conv.number === selected) : null;

  const patch = (number: string, p: Partial<ConvMeta>) =>
    updateMeta.mutate({ key: number, patch: p });

  const handleDelete = (number: string) => {
    if (!confirm("Delete this entire conversation? This removes its messages from your inbox.")) return;
    deleteConv.mutate({ number, key: number });
    if (selected === number) setSelected(null);
  };

  const totalUnread = activeList.reduce((n, x) => n + (x.unread > 0 ? 1 : 0), 0);

  return (
    <div
      className="flex overflow-hidden rounded-lg border"
      style={{ borderColor: WA.panelBorder, height: "calc(100vh - 230px)", minHeight: 520 }}
    >
      {/* LEFT: chat list */}
      <aside
        className={`${selected ? "hidden md:flex" : "flex"} w-full flex-col md:w-[400px]`}
        style={{ background: WA.listBg, borderRight: `1px solid ${WA.divider}` }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: WA.panel, height: 59 }}
        >
          <span className="text-[17px] font-semibold" style={{ color: WA.text }}>
            Chats
          </span>
          <div className="flex items-center gap-1" style={{ color: WA.icon }}>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw size={19} />
            </button>
          </div>
        </div>

        {/* Search + filter chips */}
        <div className="px-3 pb-1.5 pt-1.5" style={{ background: WA.listBg }}>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: WA.sub }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start a new chat"
              className="w-full rounded-lg border-0 py-[7px] pl-12 pr-3 text-[14px] outline-none"
              style={{ background: WA.panel, color: WA.text }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {(["all", "unread"] as const).map((f) => {
              const on = filter === f && !showArchived;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFilter(f);
                    setShowArchived(false);
                  }}
                  className="rounded-full px-3 py-1 text-[13px] font-medium capitalize transition"
                  style={{
                    background: on ? "#d9fdd3" : WA.panel,
                    color: on ? "#008069" : WA.sub,
                  }}
                >
                  {f}
                  {f === "unread" && totalUnread ? ` ${totalUnread}` : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Archived row */}
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className="flex items-center gap-6 px-5 py-3 text-[14px] transition hover:bg-black/[0.03]"
          style={{ borderBottom: `1px solid ${WA.divider}`, color: WA.text }}
        >
          <Archive size={18} style={{ color: WA.green }} />
          <span className="font-normal">{showArchived ? "Back to chats" : "Archived"}</span>
          {!showArchived && archivedList.length > 0 && (
            <span className="ml-auto text-[13px] font-medium" style={{ color: WA.green }}>
              {archivedList.length}
            </span>
          )}
        </button>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="px-6 py-10 text-center text-[14px]" style={{ color: WA.sub }}>
              {showArchived
                ? "No archived chats."
                : filter === "unread"
                  ? "No unread chats."
                  : searchQuery
                    ? "No chats found."
                    : "No conversations yet. When customers message you, they appear here."}
            </div>
          ) : (
            list.map(({ conv, meta, unread }) => (
              <ChatListItem
                key={conv.number}
                conv={conv}
                meta={meta}
                unread={unread}
                active={selected === conv.number}
                onClick={() => setSelected(conv.number)}
              />
            ))
          )}
        </div>
      </aside>

      {/* RIGHT: conversation */}
      <section className={`${selected ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedConv ? (
          <ChatView
            key={selectedConv.conv.number}
            conv={selectedConv.conv}
            meta={selectedConv.meta}
            onBack={() => setSelected(null)}
            onMarkRead={() => patch(selectedConv.conv.number, { lastReadAt: new Date().toISOString() })}
            onMarkUnread={() => {
              patch(selectedConv.conv.number, { lastReadAt: new Date(0).toISOString() });
              setSelected(null);
            }}
            onTogglePin={() => patch(selectedConv.conv.number, { pinned: !selectedConv.meta?.pinned })}
            onToggleArchive={() => {
              patch(selectedConv.conv.number, { archived: !selectedConv.meta?.archived });
              setSelected(null);
            }}
            onDelete={() => handleDelete(selectedConv.conv.number)}
            onSaveMeta={(p) => patch(selectedConv.conv.number, p)}
            onTemplate={() => onReply(selectedConv.conv.number)}
            onRefresh={() => refetch()}
          />
        ) : (
          <EmptyChatState />
        )}
      </section>
    </div>
  );
}

/** WhatsApp Web's "keep your phone connected" splash shown before a chat is picked. */
function EmptyChatState() {
  return (
    <div
      className="hidden flex-1 flex-col items-center justify-center gap-5 border-b-[6px] md:flex"
      style={{ background: WA.panel, borderBottomColor: WA.green }}
    >
      <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full" style={{ background: "#daf1e8" }}>
        <MessageSquare size={96} strokeWidth={1} style={{ color: "#a7c5bd" }} />
      </div>
      <p className="text-[32px] font-light" style={{ color: "#41525d" }}>
        WhatsApp Business
      </p>
      <p className="max-w-md text-center text-[14px]" style={{ color: WA.sub }}>
        Select a chat to read and reply to customer messages, or start a new conversation from the Send tab.
      </p>
      <p className="mt-6 flex items-center gap-2 text-[13px]" style={{ color: WA.sub }}>
        <Lock size={13} /> Your messages are end-to-end encrypted
      </p>
    </div>
  );
}

function ChatListItem({
  conv,
  meta,
  unread,
  active,
  onClick,
}: {
  conv: Conversation;
  meta?: ConvMeta;
  unread: number;
  active: boolean;
  onClick: () => void;
}) {
  const name = meta?.name || (conv.name !== conv.number ? conv.name : `+${conv.number}`);
  const last = conv.messages.at(-1);
  const dealCfg = DEAL_STATUSES.find((s) => s.value === meta?.dealStatus);
  const preview = lastPreview(conv);
  const outbound = last?.direction === "outbound";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 pl-3 pr-4 text-left transition hover:bg-black/[0.03]"
      style={{ background: active ? "#f0f2f5" : "transparent" }}
    >
      <div
        className="flex h-[49px] w-[49px] shrink-0 items-center justify-center self-center rounded-full text-[17px] font-medium text-white"
        style={{ background: "#6b7c85" }}
      >
        {initials(name)}
      </div>
      <div
        className="flex min-w-0 flex-1 flex-col justify-center py-3"
        style={{ borderBottom: `1px solid ${WA.divider}`, minHeight: 72 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[16px]" style={{ color: WA.text }}>
            {name}
          </span>
          <span
            className="shrink-0 text-[12px]"
            style={{ color: unread ? WA.green : WA.sub }}
          >
            {last ? formatListTime(last.timestamp) : ""}
          </span>
        </div>
        <div className="mt-[3px] flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 text-[14px]" style={{ color: WA.sub }}>
            {meta?.pinned && <Pin size={13} className="shrink-0" style={{ transform: "rotate(45deg)" }} />}
            {outbound && (
              <span className="shrink-0">
                <Ticks status={last?.status} small />
              </span>
            )}
            <span className="truncate">{preview || "No messages"}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {dealCfg && (
              <span
                className="rounded-full px-1.5 py-px text-[10px] font-semibold"
                style={{ background: dealCfg.bgColor, color: dealCfg.color }}
              >
                {dealCfg.label}
              </span>
            )}
            {unread > 0 && (
              <span
                className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-1.5 text-[12px] font-semibold text-white"
                style={{ background: WA.badge }}
              >
                {unread}
              </span>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

function ChatView({
  conv,
  meta,
  onBack,
  onMarkRead,
  onMarkUnread,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onSaveMeta,
  onTemplate,
  onRefresh,
}: {
  conv: Conversation;
  meta?: ConvMeta;
  onBack: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onSaveMeta: (p: Partial<ConvMeta>) => void;
  onTemplate: () => void;
  onRefresh: () => void;
}) {
  const sendMessage = useSendWhatsAppMessage();
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const name = meta?.name || (conv.name !== conv.number ? conv.name : `+${conv.number}`);
  const lastTs = conv.messages.at(-1)?.timestamp ?? "";

  // Mark read whenever this chat is open and (new) messages are present.
  useEffect(() => {
    if (unreadCount(conv, meta) > 0) onMarkRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv.number, lastTs, conv.messages.length]);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastTs, conv.messages.length]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setError("");
    try {
      await sendMessage.mutateAsync({
        type: "text",
        to: conv.number,
        message: reply,
        markReadMessageId: conv.messages.filter((m) => m.direction === "inbound").at(-1)?.id,
      });
      setReply("");
    } catch (e: any) {
      setError(e.message || "Failed to send");
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const up = await uploadWhatsAppMedia(file);
      await sendMessage.mutateAsync({
        type: "media",
        to: conv.number,
        mediaType: up.mediaType,
        mediaId: up.id,
        caption: reply.trim() || undefined,
        filename: up.mediaType === "document" ? up.filename : undefined,
        markReadMessageId: conv.messages.filter((m) => m.direction === "inbound").at(-1)?.id,
      });
      setReply("");
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const canSend = !!reply.trim();

  return (
    <div className="flex h-full flex-col" style={{ background: WA.chatBg }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4"
        style={{ background: WA.panel, height: 59, borderBottom: `1px solid ${WA.divider}` }}
      >
        <button type="button" onClick={onBack} className="md:hidden" style={{ color: WA.icon }} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
            style={{ background: "#6b7c85" }}
          >
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-medium" style={{ color: WA.text }}>
              {name}
            </p>
            <p className="truncate text-[13px]" style={{ color: WA.sub }}>
              click here for contact info
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1" style={{ color: WA.icon }}>
          <button
            type="button"
            onClick={onRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5"
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw size={19} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5"
              aria-label="Chat menu"
            >
              <MoreVertical size={20} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 z-20 mt-1 w-60 overflow-hidden rounded-md bg-white py-2 shadow-lg"
                  style={{ boxShadow: "0 2px 10px rgba(11,20,26,0.16)" }}
                >
                  <MenuItem icon={<User size={15} />} label="Contact info & deal" onClick={() => { setShowDetails(true); setMenuOpen(false); }} />
                  <MenuItem
                    icon={meta?.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                    label={meta?.pinned ? "Unpin chat" : "Pin chat"}
                    onClick={() => { onTogglePin(); setMenuOpen(false); }}
                  />
                  <MenuItem icon={<Circle size={15} />} label="Mark as unread" onClick={() => { onMarkUnread(); setMenuOpen(false); }} />
                  <MenuItem
                    icon={meta?.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                    label={meta?.archived ? "Unarchive chat" : "Archive chat"}
                    onClick={() => { onToggleArchive(); setMenuOpen(false); }}
                  />
                  <MenuItem icon={<FileText size={15} />} label="Send template / start chat" onClick={() => { onTemplate(); setMenuOpen(false); }} />
                  <div className="my-1 border-t" style={{ borderColor: WA.divider }} />
                  <MenuItem icon={<Trash2 size={15} />} label="Delete chat" danger onClick={() => { onDelete(); setMenuOpen(false); }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CRM / contact details */}
      {showDetails && (
        <div className="border-b px-4 py-3" style={{ borderColor: WA.divider, background: "#fff" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "var(--adm-text)" }}>Contact &amp; deal</span>
            <button type="button" onClick={() => setShowDetails(false)} style={{ color: "var(--adm-text-3)" }}>
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--adm-text-2)" }}>Display name</label>
              <input
                type="text"
                defaultValue={meta?.name || (conv.name !== conv.number ? conv.name : "")}
                onBlur={(e) => onSaveMeta({ name: e.target.value })}
                placeholder={`+${conv.number}`}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--adm-text-2)" }}>Deal status</label>
              <SelectWithCustom
                value={meta?.dealStatus || "new"}
                onChange={(v) => onSaveMeta({ dealStatus: v })}
                options={DEAL_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--adm-text-2)" }}>Internal notes (private)</label>
            <textarea
              defaultValue={meta?.notes || ""}
              onBlur={(e) => onSaveMeta({ notes: e.target.value })}
              rows={2}
              placeholder="Notes about this customer…"
              className={adminInputClass}
              style={adminInputStyle}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-[5%] py-3 lg:px-[8%]" style={{ backgroundImage: DOODLE }}>
        {/* End-to-end encryption notice */}
        <div className="mb-3 flex justify-center">
          <span
            className="flex max-w-lg items-center gap-1.5 rounded-md px-3 py-1.5 text-center text-[12.5px] leading-[18px] shadow-sm"
            style={{ background: WA.e2e, color: WA.e2eText }}
          >
            <Lock size={12} className="shrink-0" />
            Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
          </span>
        </div>

        {conv.messages.map((msg, i) => {
          const prev = conv.messages[i - 1];
          const showDate = !prev || dayKey(prev.timestamp) !== dayKey(msg.timestamp);
          // A "tail" (bubble beak) shows only on the first message of a run from
          // the same side, exactly like WhatsApp.
          const tail = showDate || !prev || prev.direction !== msg.direction;
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="my-3 flex justify-center">
                  <span
                    className="rounded-md px-3 py-1 text-[12.5px] font-medium uppercase shadow-sm"
                    style={{ background: WA.datePill, color: WA.dateText }}
                  >
                    {formatDateDivider(msg.timestamp)}
                  </span>
                </div>
              )}
              <MessageBubble message={msg} tail={tail} />
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="px-4 py-1 text-xs" style={{ background: WA.panel, color: "var(--adm-red)" }}>
          {error}
        </p>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2 px-4 py-2.5" style={{ background: WA.panel }}>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          className="mb-1.5 flex h-6 shrink-0 items-center"
          style={{ color: WA.icon }}
          aria-label="Emoji"
          title="Emoji"
          tabIndex={-1}
        >
          <Smile size={25} />
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || sendMessage.isPending}
          className="mb-1.5 flex h-6 shrink-0 items-center disabled:opacity-50"
          style={{ color: WA.icon }}
          aria-label="Attach media"
          title="Attach photo / video / document"
        >
          <Paperclip size={24} style={{ transform: "rotate(-45deg)" }} />
        </button>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReply();
            }
          }}
          rows={1}
          placeholder={uploading ? "Uploading…" : "Type a message"}
          className="max-h-28 flex-1 resize-none rounded-lg border-0 px-4 py-2.5 text-[15px] outline-none"
          style={{ background: "#fff", color: WA.text }}
        />
        <button
          type="button"
          onClick={canSend ? handleReply : undefined}
          disabled={sendMessage.isPending || uploading}
          className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
          style={{ color: WA.icon }}
          aria-label={canSend ? "Send" : "Voice message"}
        >
          {canSend ? <Send size={22} style={{ color: WA.green }} /> : <Mic size={24} />}
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50"
      style={{ color: danger ? "var(--adm-red)" : "var(--adm-text)" }}
    >
      {icon}
      {label}
    </button>
  );
}

// WhatsApp tick semantics: sent = single grey ✓, delivered = double grey ✓✓,
// read = double BLUE ✓✓, failed = red !, pending/unknown = clock.
function Ticks({ status, small }: { status?: string; small?: boolean }) {
  const s = (status || "").toLowerCase();
  const sz = small ? 14 : 16;
  if (s === "failed") return <AlertCircle size={small ? 12 : 13} style={{ color: "#f15c6d" }} />;
  if (s === "read") return <CheckCheck size={sz} style={{ color: WA.tick }} />;
  if (s === "delivered") return <CheckCheck size={sz} style={{ color: WA.tickGrey }} />;
  if (s === "sent") return <Check size={sz} style={{ color: WA.tickGrey }} />;
  return <Clock size={small ? 11 : 12} style={{ color: WA.tickGrey }} />;
}

function MessageBubble({ message, tail }: { message: WAMessage; tail?: boolean }) {
  const isOutbound = message.direction === "outbound";
  const text = describeMessage(message);
  const isPlaceholder = !(message.body || "").trim() && !MEDIA_LABELS[message.type];
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const spacer = isOutbound ? "\u00A0".repeat(11) : "\u00A0".repeat(7);
  const isImage = message.type === "image" && message.mediaId;
  
  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"} ${tail ? "mt-2.5" : "mt-0.5"}`}>
      <div
        className={`relative max-w-[65%] text-[14.2px] leading-[19px] ${isImage ? "p-1 pb-5" : "px-[9px] pb-[8px] pt-[6px]"}`}
        style={{
          background: isOutbound ? WA.out : WA.in,
          color: WA.text,
          borderRadius: 7.5,
          boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
          borderTopRightRadius: tail && isOutbound ? 0 : 7.5,
          borderTopLeftRadius: tail && !isOutbound ? 0 : 7.5,
        }}
      >
        {/* Little bubble beak */}
        {tail && (
          <span
            aria-hidden
            className="absolute top-0"
            style={{
              [isOutbound ? "right" : "left"]: -8,
              width: 8,
              height: 13,
              background: isOutbound ? WA.out : WA.in,
              clipPath: isOutbound
                ? "polygon(0 0, 100% 0, 0 100%)"
                : "polygon(0 0, 100% 0, 100% 100%)",
            } as React.CSSProperties}
          />
        )}
        
        {isImage ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/api/whatsapp/media/${message.mediaId}`} 
              alt="WhatsApp Media" 
              className="rounded-md max-h-[300px] object-cover" 
            />
            {text && text !== MEDIA_LABELS["image"] && (
              <div className="px-1 pt-1 pb-0.5 whitespace-pre-wrap break-words">
                {text}
                <span aria-hidden style={{ display: "inline-block" }}>{spacer}</span>
              </div>
            )}
          </div>
        ) : (
          <span
            className="whitespace-pre-wrap break-words"
            style={isPlaceholder ? { fontStyle: "italic", color: WA.sub } : undefined}
          >
            {text || "—"}
            <span aria-hidden style={{ display: "inline-block" }}>
              {spacer}
            </span>
          </span>
        )}

        {/* Floated inline timestamp + ticks */}
        <span
          className={`pointer-events-none absolute bottom-[3px] right-[7px] flex items-center gap-1 ${isImage && (!text || text === MEDIA_LABELS["image"]) ? "text-white bg-black/30 px-1.5 rounded-full bottom-[5px]" : ""}`}
          style={{ height: 15 }}
        >
          <span className="text-[11px] leading-none" style={isImage && (!text || text === MEDIA_LABELS["image"]) ? { color: "white" } : { color: WA.sub }}>
            {time}
          </span>
          {isOutbound && <Ticks status={message.status} small={true} />}
        </span>
      </div>
    </div>
  );
}

// ─── Send ───────────────────────────────────────────────────────────────

function SendTab({
  defaultRecipient,
  onSent,
}: {
  defaultRecipient: string;
  onSent: () => void;
}) {
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [messageText, setMessageText] = useState("");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<string[]>(["", "", ""]);
  const [buttonTemplate, setButtonTemplate] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  // Media (task 3)
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const [mediaLink, setMediaLink] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [mediaFileName, setMediaFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const sendMessage = useSendWhatsAppMessage();
  const { data: templatesData } = useWhatsAppTemplates();
  const templates: WATemplate[] = templatesData?.data ?? [];

  const resetMedia = () => {
    setMediaLink("");
    setMediaId("");
    setMediaFileName("");
    setCaption("");
  };

  const handleFileUpload = async (file: File) => {
    setSendError("");
    setUploading(true);
    try {
      const up = await uploadWhatsAppMedia(file);
      setMediaId(up.id);
      setMediaKind(up.mediaType);
      setMediaFileName(up.filename);
      setMediaLink(""); // uploaded id takes precedence over link
    } catch (e: any) {
      setSendError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    setSendError("");
    setSendSuccess(false);

    const to = recipient.replace(/[^0-9]/g, "");
    if (!to) {
      setSendError("Enter recipient phone number with country code (e.g. 923001234567)");
      return;
    }

    try {
      const payload: Record<string, unknown> = { type: messageType, to };

      if (messageType === "text") {
        if (!messageText.trim()) {
          setSendError("Enter a message");
          return;
        }
        payload.message = messageText;
      } else if (messageType === "media") {
        if (!mediaId && !mediaLink.trim()) {
          setSendError("Upload a file or paste a public media URL");
          return;
        }
        payload.mediaType = mediaKind;
        if (mediaId) payload.mediaId = mediaId;
        else payload.mediaLink = mediaLink.trim();
        if (caption.trim() && mediaKind !== "audio" && mediaKind !== "sticker") {
          payload.caption = caption.trim();
        }
        if (mediaKind === "document" && mediaFileName) payload.filename = mediaFileName;
      } else if (messageType === "buttons") {
        const validButtons = buttons.filter((b) => b.trim()).slice(0, 3);
        if (!bodyText.trim() || validButtons.length === 0) {
          setSendError("Enter message text and at least one button");
          return;
        }
        if (headerText.trim()) payload.headerText = headerText.trim();
        payload.bodyText = bodyText;
        if (footerText.trim()) payload.footerText = footerText.trim();
        payload.buttons = validButtons;
      } else if (messageType === "template") {
        const tpl = templates.find((t) => t.name === templateName);
        if (!tpl) {
          setSendError("Select a template");
          return;
        }
        payload.template = templateName;
        payload.templateText = tpl.text;
      }

      await sendMessage.mutateAsync(payload as any);
      setSendSuccess(true);
      onSent();

      setTimeout(() => {
        setMessageText("");
        setHeaderText("");
        setBodyText("");
        setFooterText("");
        setButtons(["", "", ""]);
        setButtonTemplate("");
        setTemplateName("");
        resetMedia();
        setSendSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSendError(error.message || "Failed to send message");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-6 border bg-white p-6" style={{ borderColor: "var(--adm-border)" }}>
        {/* Message Type */}
        <div>
          <label className="mb-3 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
            Message Type
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["text", "media", "buttons", "template"] as MessageType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMessageType(type)}
                className={`border px-4 py-3 text-sm font-semibold capitalize transition ${
                  messageType === type ? "shadow-sm" : ""
                }`}
                style={{
                  borderColor: messageType === type ? "var(--adm-blue)" : "var(--adm-border)",
                  background: messageType === type ? "var(--adm-blue-light)" : "var(--adm-surface)",
                  color: messageType === type ? "var(--adm-blue)" : "var(--adm-text)",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient */}
        <AdminField label="Recipient (phone with country code)" htmlFor="recipient">
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="923001234567"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </AdminField>

        {/* Text */}
        {messageType === "text" && (
          <AdminField label="Message" htmlFor="message">
            <textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message…"
              rows={6}
              className={adminInputClass}
              style={adminInputStyle}
            />
            <p className="mt-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
              Supports WhatsApp formatting: *bold* _italic_ ~strikethrough~
            </p>
          </AdminField>
        )}

        {/* Media */}
        {messageType === "media" && (
          <>
            <AdminField label="Media type" htmlFor="mediaKind">
              <SelectWithCustom
                id="mediaKind"
                value={mediaKind}
                onChange={(v) => setMediaKind(v as MediaKind)}
                options={[
                  { value: "image", label: "Image" },
                  { value: "video", label: "Video" },
                  { value: "document", label: "Document" },
                  { value: "audio", label: "Audio" },
                  { value: "sticker", label: "Sticker" },
                ]}
              />
            </AdminField>

            <AdminField label="Upload a file" htmlFor="mediaFile">
              <input
                type="file"
                id="mediaFile"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className={adminInputClass}
                style={adminInputStyle}
                disabled={uploading}
              />
              <p className="mt-1 text-xs" style={{ color: "var(--adm-text-3)" }}>
                {uploading
                  ? "Uploading to WhatsApp…"
                  : mediaId
                    ? `✓ Uploaded: ${mediaFileName} (ready to send)`
                    : "Caps: image 5MB · video/audio 16MB · document 100MB. Or paste a public URL below."}
              </p>
            </AdminField>

            <AdminField label="…or public media URL (https)" htmlFor="mediaLink">
              <input
                type="text"
                id="mediaLink"
                value={mediaLink}
                onChange={(e) => {
                  setMediaLink(e.target.value);
                  if (e.target.value) setMediaId(""); // link overrides a previous upload
                }}
                placeholder="https://example.com/file.pdf"
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>

            {mediaKind !== "audio" && mediaKind !== "sticker" && (
              <AdminField label="Caption (optional)" htmlFor="caption">
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption shown under the media…"
                  rows={2}
                  className={adminInputClass}
                  style={adminInputStyle}
                  maxLength={1024}
                />
              </AdminField>
            )}
          </>
        )}

        {/* Buttons */}
        {messageType === "buttons" && (
          <>
            {/* Quick template picker */}
            <AdminField label="Quick template (optional)" htmlFor="buttonTemplate">
              <div className="relative">
                <Sparkles
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--adm-blue)" }}
                />
                <select
                  id="buttonTemplate"
                  value={buttonTemplate}
                  onChange={(e) => {
                    const name = e.target.value;
                    setButtonTemplate(name);
                    const tpl = BUTTON_TEMPLATES.find((t) => t.name === name);
                    if (tpl) {
                      setHeaderText(tpl.header);
                      setBodyText(tpl.body);
                      setFooterText(tpl.footer);
                      const next = [...tpl.buttons.slice(0, 3), "", "", ""].slice(0, 3);
                      setButtons(next);
                    }
                  }}
                  className={adminInputClass}
                  style={{ ...adminInputStyle, paddingLeft: "2.25rem" }}
                >
                  <option value="">Start from scratch…</option>
                  {BUTTON_TEMPLATES.map((tpl) => (
                    <option key={tpl.name} value={tpl.name}>
                      {tpl.header}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
                Pick a ready-made message, then tweak the header, body, footer & buttons below.
              </p>
            </AdminField>

            {/* Header */}
            <AdminField label="Header (optional, bold title)" htmlFor="headerText">
              <input
                type="text"
                id="headerText"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="👋 Welcome to Tauqeer Mustafa Inc"
                className={adminInputClass}
                style={adminInputStyle}
                maxLength={60}
              />
              <p className="mt-1 text-xs" style={{ color: "var(--adm-text-3)" }}>
                {headerText.length}/60 characters
              </p>
            </AdminField>

            {/* Body */}
            <AdminField label="Message text" htmlFor="bodyText">
              <textarea
                id="bodyText"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Main message…"
                rows={5}
                className={adminInputClass}
                style={adminInputStyle}
                maxLength={1024}
              />
            </AdminField>

            {/* Footer */}
            <AdminField label="Footer (optional, small grey text)" htmlFor="footerText">
              <input
                type="text"
                id="footerText"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="We typically respond within 2-4 hours"
                className={adminInputClass}
                style={adminInputStyle}
                maxLength={60}
              />
              <p className="mt-1 text-xs" style={{ color: "var(--adm-text-3)" }}>
                {footerText.length}/60 characters
              </p>
            </AdminField>

            {/* Button inputs */}
            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                Interactive Buttons{" "}
                <span className="text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>
                  (max 3, shown as blue clickable buttons in WhatsApp)
                </span>
              </label>
              <div className="space-y-2">
                {buttons.map((btn, index) => (
                  <input
                    key={index}
                    type="text"
                    value={btn}
                    onChange={(e) => {
                      const next = [...buttons];
                      next[index] = e.target.value;
                      setButtons(next);
                    }}
                    placeholder={`Button ${index + 1}`}
                    className={adminInputClass}
                    style={adminInputStyle}
                    maxLength={20}
                  />
                ))}
              </div>
            </div>

            {/* Live preview */}
            <ButtonPreview
              header={headerText}
              body={bodyText}
              footer={footerText}
              buttons={buttons.filter((b) => b.trim())}
            />
          </>
        )}

        {/* Template */}
        {messageType === "template" && (
          <>
            <AdminField label="Saved template" htmlFor="template">
              <SelectWithCustom
                id="template"
                value={templateName}
                onChange={setTemplateName}
                placeholder="Select a template…"
                customLabel="✏️ Custom template name…"
                customPlaceholder="Template name"
                options={templates.map((tpl) => ({ value: tpl.name, label: tpl.name }))}
              />
            </AdminField>

            {templateName && (
              <div
                className="border p-3 text-sm"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}
              >
                <p className="whitespace-pre-wrap">{templates.find((t) => t.name === templateName)?.text}</p>
              </div>
            )}

            <TemplateManager templates={templates} />
          </>
        )}

        {/* Error / Success */}
        {sendError && (
          <div
            className="flex items-center gap-2 border bg-red-50 p-4 text-sm"
            style={{ borderColor: "var(--adm-red)", color: "var(--adm-red)" }}
          >
            <AlertCircle size={16} className="shrink-0" />
            {sendError}
          </div>
        )}
        {sendSuccess && (
          <div
            className="flex items-center gap-2 border bg-green-50 p-4 text-sm"
            style={{ borderColor: "var(--adm-green)", color: "var(--adm-green)" }}
          >
            <CheckCheck size={16} className="shrink-0" />
            Message sent successfully!
          </div>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={sendMessage.isPending}
          className="flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-white transition hover:shadow-md disabled:opacity-50"
          style={{ background: "var(--adm-blue)" }}
        >
          <Send size={16} />
          {sendMessage.isPending ? "Sending…" : "Send Message"}
        </button>
      </div>
    </div>
  );
}

function ButtonPreview({
  header,
  body,
  footer,
  buttons,
}: {
  header: string;
  body: string;
  footer: string;
  buttons: string[];
}) {
  const hasContent = header.trim() || body.trim() || footer.trim() || buttons.length > 0;

  // Render WhatsApp *bold* _italic_ ~strike~ as HTML for the preview
  const format = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/~(.+?)~/g, "<span style=\"text-decoration:line-through\">$1</span>")
      .replace(/\n/g, "<br/>");

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
        Live Preview
      </label>
      <div
        className="overflow-hidden rounded-lg border p-4"
        style={{
          borderColor: "var(--adm-border)",
          background:
            "#e5ddd5 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1.2' fill='%23000' opacity='0.04'/%3E%3C/svg%3E\")",
        }}
      >
        {!hasContent ? (
          <p className="py-6 text-center text-xs" style={{ color: "#667781" }}>
            Fill in the fields above to preview your message
          </p>
        ) : (
          <div className="mx-auto max-w-xs">
            {/* Message bubble */}
            <div
              className="relative rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm"
              style={{ color: "#111b21" }}
            >
              {header.trim() && (
                <p className="mb-1 text-[15px] font-bold leading-snug">{header}</p>
              )}
              {body.trim() && (
                <p
                  className="text-[14px] leading-snug"
                  dangerouslySetInnerHTML={{ __html: format(body) }}
                />
              )}
              {footer.trim() && (
                <p className="mt-1.5 text-[12px]" style={{ color: "#667781" }}>
                  {footer}
                </p>
              )}
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="text-[11px]" style={{ color: "#667781" }}>
                  12:00 PM
                </span>
                <CheckCheck size={13} style={{ color: "#53bdeb" }} />
              </div>
            </div>

            {/* Reply buttons */}
            {buttons.length > 0 && (
              <div className="mt-1 space-y-1">
                {buttons.slice(0, 3).map((btn, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2.5 text-[14px] font-medium shadow-sm"
                    style={{ color: "#00a5f4" }}
                  >
                    {btn}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function metaStatusStyle(status: string): { label: string; color: string; bg: string } {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return { label: "Approved", color: "#10B981", bg: "#D1FAE5" };
  if (s === "REJECTED" || s === "DISABLED" || s === "PAUSED")
    return { label: s.charAt(0) + s.slice(1).toLowerCase(), color: "#EF4444", bg: "#FEE2E2" };
  if (s === "NOT_SUBMITTED") return { label: "Not submitted", color: "#6B7280", bg: "#F3F4F6" };
  return { label: "Pending review", color: "#F59E0B", bg: "#FEF3C7" };
}

function MetaTemplatesTab({ defaultRecipient }: { defaultRecipient: string }) {
  const { data, isLoading, refetch } = useMetaTemplates();
  const submitTemplate = useSubmitMetaTemplate();
  const [banner, setBanner] = useState("");

  const templates = data?.data ?? [];
  const configured = data?.configured;
  const notice = data?.notice;
  const approvedCount = templates.filter((t) => (t.status || "").toUpperCase() === "APPROVED").length;

  const handleSubmitAll = async () => {
    setBanner("");
    try {
      const res = await submitTemplate.mutateAsync({ all: true });
      setBanner(res.message || "Submitted all templates.");
    } catch (e: any) {
      setBanner(e.message || "Failed to submit templates.");
    }
  };

  if (isLoading) return <AdminLoadingState label="Loading templates…" />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* How it works */}
      <div
        className="border p-4 text-sm"
        style={{ borderColor: "var(--adm-blue)", background: "var(--adm-blue-light)", color: "var(--adm-text-2)" }}
      >
        <p className="mb-1 font-semibold" style={{ color: "var(--adm-blue)" }}>
          Start conversations with new customers
        </p>
        <p>
          WhatsApp only lets you message someone first using a <strong>Meta-approved template</strong>. Submit these
          templates once, wait for approval (minutes to a few hours), then send them to anyone — even people who never
          texted you. Free-form messages only work within 24h of a customer&apos;s last message.
        </p>
      </div>

      {/* Config notice */}
      {!configured && (
        <div
          className="flex items-start gap-2 border p-4 text-sm"
          style={{ borderColor: "var(--adm-amber, #F59E0B)", background: "#FEF3C7", color: "#92400E" }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{notice || "Set WHATSAPP_BUSINESS_ACCOUNT_ID to submit templates."}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--adm-text-2)" }}>
          <strong>{templates.length}</strong> templates ·{" "}
          <span style={{ color: "#10B981" }}>
            <strong>{approvedCount}</strong> approved
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 border px-3 py-2 text-sm font-semibold"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={submitTemplate.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--adm-blue)" }}
          >
            <Sparkles size={14} />
            {submitTemplate.isPending ? "Submitting…" : "Submit All to Meta"}
          </button>
        </div>
      </div>

      {banner && (
        <div
          className="border p-3 text-sm"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}
        >
          {banner}
        </div>
      )}

      {/* Template cards */}
      <div className="space-y-4">
        {templates.map((tpl) => (
          <MetaTemplateCard key={tpl.name} template={tpl} defaultRecipient={defaultRecipient} />
        ))}
      </div>
    </div>
  );
}

function MetaTemplateCard({ template, defaultRecipient }: { template: MetaTemplate; defaultRecipient: string }) {
  const submitTemplate = useSubmitMetaTemplate();
  const sendMessage = useSendWhatsAppMessage();

  const varCount = countVariables(template.body);
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [vars, setVars] = useState<string[]>(() => {
    const seed = template.bodyExample ?? [];
    return Array.from({ length: varCount }, (_, i) => seed[i] ?? "");
  });
  const [msg, setMsg] = useState("");

  const status = (template.status || "").toUpperCase();
  const isApproved = status === "APPROVED";
  const badge = metaStatusStyle(template.status);

  const rendered = template.body.replace(/\{\{\s*(\d+)\s*\}\}/g, (_, n) => vars[Number(n) - 1] || `{{${n}}}`);

  const handleSubmit = async () => {
    setMsg("");
    try {
      const res = await submitTemplate.mutateAsync({ name: template.name });
      const r = res.results?.[0];
      setMsg(r?.error ? `Error: ${r.error}` : "Submitted to Meta — awaiting approval.");
    } catch (e: any) {
      setMsg(e.message || "Failed to submit.");
    }
  };

  const handleSend = async () => {
    setMsg("");
    const to = recipient.replace(/[^0-9]/g, "");
    if (!to) {
      setMsg("Enter a recipient number with country code.");
      return;
    }
    try {
      await sendMessage.mutateAsync({
        type: "meta_template",
        to,
        metaTemplateName: template.name,
        templateVars: vars,
        templateLanguage: template.language,
      });
      setMsg("✅ Sent!");
      setTimeout(() => {
        setMsg("");
        setOpen(false);
      }, 2500);
    } catch (e: any) {
      setMsg(e.message || "Failed to send.");
    }
  };

  return (
    <div className="border bg-white" style={{ borderColor: "var(--adm-border)" }}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs" style={{ color: "var(--adm-text-3)" }}>
              {template.name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.label}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color: "var(--adm-text-3)", background: "var(--adm-surface-2)" }}
            >
              {template.category}
            </span>
          </div>
          {template.header && (
            <p className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>
              {template.header}
            </p>
          )}
          <p className="mt-0.5 whitespace-pre-wrap text-sm" style={{ color: "var(--adm-text-2)" }}>
            {rendered}
          </p>
          {template.footer && (
            <p className="mt-1 text-xs" style={{ color: "var(--adm-text-3)" }}>
              {template.footer}
            </p>
          )}
          {template.buttons && template.buttons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {template.buttons.map((b) => (
                <span
                  key={b}
                  className="rounded border px-2 py-1 text-xs font-medium"
                  style={{ borderColor: "var(--adm-border)", color: "#00a5f4" }}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {isApproved ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--adm-green, #10B981)" }}
            >
              <Send size={14} />
              Send
            </button>
          ) : template.source === "meta" ? (
            // Lives only in Meta — we have no local definition to (re)submit.
            <span className="px-3 py-2 text-xs font-semibold" style={{ color: "var(--adm-text-3)" }}>
              {status || "IN META"}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitTemplate.isPending || status === "PENDING"}
              className="flex items-center gap-2 border px-3 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ borderColor: "var(--adm-blue)", color: "var(--adm-blue)" }}
            >
              <Sparkles size={14} />
              {status === "PENDING" ? "Pending…" : "Submit"}
            </button>
          )}
        </div>
      </div>

      {/* Send form (approved only) */}
      {isApproved && open && (
        <div className="border-t p-4" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
          <AdminField label="Recipient (phone with country code)" htmlFor={`to-${template.name}`}>
            <input
              type="text"
              id={`to-${template.name}`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="923001234567"
              className={adminInputClass}
              style={adminInputStyle}
            />
          </AdminField>
          {varCount > 0 && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                Fill in the blanks
              </label>
              {Array.from({ length: varCount }, (_, i) => (
                <input
                  key={i}
                  type="text"
                  value={vars[i] ?? ""}
                  onChange={(e) => {
                    const next = [...vars];
                    next[i] = e.target.value;
                    setVars(next);
                  }}
                  placeholder={`Variable {{${i + 1}}}${template.bodyExample?.[i] ? ` (e.g. ${template.bodyExample[i]})` : ""}`}
                  className={adminInputClass}
                  style={adminInputStyle}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleSend}
            disabled={sendMessage.isPending}
            className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--adm-blue)" }}
          >
            <Send size={14} />
            {sendMessage.isPending ? "Sending…" : "Send Template"}
          </button>
        </div>
      )}

      {msg && (
        <div
          className="border-t px-4 py-2 text-sm"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}

function TemplateManager({ templates }: { templates: WATemplate[] }) {
  const saveTemplate = useSaveTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !text.trim()) return;
    await saveTemplate.mutateAsync({ name: name.trim(), text: text.trim() });
    setName("");
    setText("");
    setShowAdd(false);
  };

  return (
    <div className="border-t pt-4" style={{ borderColor: "var(--adm-border)" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
          Manage Templates
        </p>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-xs font-semibold"
          style={{ color: "var(--adm-blue)" }}
        >
          {showAdd ? "Cancel" : "+ New Template"}
        </button>
      </div>

      {templates.length > 0 && (
        <div className="mt-3 space-y-2">
          {templates.map((t) => (
            <div key={t.name} className="flex items-start justify-between gap-3 rounded border p-2" style={{ borderColor: "var(--adm-border)" }}>
              <div className="min-w-0 text-sm">
                <span className="font-semibold" style={{ color: "var(--adm-text)" }}>
                  {t.name}
                </span>
                <p className="mt-1 break-words text-xs" style={{ color: "var(--adm-text-3)" }}>
                  {t.text.slice(0, 80)}{t.text.length > 80 ? "…" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteTemplate.mutate(t.name)}
                className="shrink-0"
                style={{ color: "var(--adm-red)" }}
                aria-label={`Delete ${t.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name (e.g. greeting)"
            className={adminInputClass}
            style={adminInputStyle}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message text…"
            rows={3}
            className={adminInputClass}
            style={adminInputStyle}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saveTemplate.isPending || !name.trim() || !text.trim()}
            className="btn-press w-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--adm-blue)" }}
          >
            {saveTemplate.isPending ? "Saving…" : "Save Template"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Auto-Reply Rules ─────────────────────────────────────────────────────

function RulesTab() {
  const { data, isLoading, isError } = useAutoReplyRules();
  const saveRules = useSaveAutoReplyRules();
  const [localRules, setLocalRules] = useState<AutoReplyRule[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const rules: AutoReplyRule[] = data?.data ?? [];

  const startEditing = () => {
    setLocalRules(rules.map((r) => ({ ...r })));
    setIsEditing(true);
  };

  const handleSave = async () => {
    await saveRules.mutateAsync(localRules.filter((r) => r.keyword.trim() && r.reply.trim()));
    setIsEditing(false);
  };

  const addRule = () =>
    setLocalRules([
      ...localRules,
      { id: `rule_${Date.now()}`, keyword: "", mode: "contains", reply: "", enabled: true },
    ]);

  const removeRule = (id: string) => setLocalRules(localRules.filter((r) => r.id !== id));

  const updateRule = (id: string, field: keyof AutoReplyRule, value: unknown) =>
    setLocalRules(localRules.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  if (isLoading) return <AdminLoadingState label="Loading auto-reply rules…" />;
  if (isError) return <AdminErrorState message="Could not load auto-reply rules." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>
            Auto-Reply Rules
          </h3>
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            Automatically respond to common questions when customers message you.
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            className="btn-press shrink-0 px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--adm-blue)" }}
          >
            Edit Rules
          </button>
        ) : (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="border px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
              style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveRules.isPending}
              className="btn-press px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--adm-blue)" }}
            >
              {saveRules.isPending ? "Saving…" : "Save Rules"}
            </button>
          </div>
        )}
      </div>

      {saveRules.isError && (
        <div
          className="flex items-center gap-2 border bg-red-50 p-4 text-sm"
          style={{ borderColor: "var(--adm-red)", color: "var(--adm-red)" }}
        >
          <AlertCircle size={16} />
          Failed to save rules.
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          {localRules.map((rule) => (
            <RuleEditor
              key={rule.id}
              rule={rule}
              onUpdate={updateRule}
              onRemove={removeRule}
            />
          ))}
          <button
            type="button"
            onClick={addRule}
            className="border px-4 py-2 text-sm font-semibold transition hover:shadow-sm"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
          >
            + Add Rule
          </button>
        </div>
      ) : rules.length === 0 ? (
        <AdminEmptyState
          title="No auto-reply rules"
          description="Add keyword-based rules so the bot answers common questions automatically."
        />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-3 border bg-white p-4 rounded"
              style={{ borderColor: "var(--adm-border)" }}
            >
              <div className="min-w-0">
                <p className="font-semibold" style={{ color: "var(--adm-text)" }}>
                  Keyword: "{rule.keyword}"{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>
                    ({rule.mode})
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm" style={{ color: "var(--adm-text-2)" }}>
                  {rule.reply}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: rule.enabled ? "#DCFCE7" : "var(--adm-surface-2)",
                  color: rule.enabled ? "var(--adm-green)" : "var(--adm-text-3)",
                }}
              >
                {rule.enabled ? "Active" : "Paused"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RuleEditor({
  rule,
  onUpdate,
  onRemove,
}: {
  rule: AutoReplyRule;
  onUpdate: (id: string, field: keyof AutoReplyRule, value: unknown) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="border bg-white p-4 rounded" style={{ borderColor: "var(--adm-border)" }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="Keyword or phrase" htmlFor={`kw-${rule.id}`}>
          <input
            id={`kw-${rule.id}`}
            type="text"
            value={rule.keyword}
            onChange={(e) => onUpdate(rule.id, "keyword", e.target.value)}
            placeholder="e.g. price, hours, location"
            className={adminInputClass}
            style={adminInputStyle}
          />
        </AdminField>

        <AdminField label="Match mode" htmlFor={`mode-${rule.id}`}>
          <SelectWithCustom
            id={`mode-${rule.id}`}
            value={rule.mode}
            onChange={(v) => onUpdate(rule.id, "mode", v)}
            customLabel="✏️ Custom mode…"
            customPlaceholder="contains | equals | starts | regex"
            options={[
              { value: "contains", label: "Contains keyword" },
              { value: "equals", label: "Exact match" },
              { value: "starts", label: "Starts with" },
              { value: "regex", label: "Regex (advanced — keyword is the pattern)" },
            ]}
          />
        </AdminField>
      </div>

      <div className="mt-3">
        <AdminField label="Auto-reply message" htmlFor={`reply-${rule.id}`}>
          <textarea
            id={`reply-${rule.id}`}
            value={rule.reply}
            onChange={(e) => onUpdate(rule.id, "reply", e.target.value)}
            placeholder="The message to send automatically…"
            rows={3}
            className={adminInputClass}
            style={adminInputStyle}
          />
        </AdminField>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--adm-text-2)" }}>
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onUpdate(rule.id, "enabled", e.target.checked)}
            className="h-4 w-4"
            style={{ accentColor: "var(--adm-blue)" }}
          />
          Enabled
        </label>
        <button
          type="button"
          onClick={() => onRemove(rule.id)}
          className="flex items-center gap-1 text-sm font-semibold"
          style={{ color: "var(--adm-red)" }}
        >
          <Trash2 size={14} /> Remove
        </button>
      </div>
    </div>
  );
}

// ─── Stats ──────────────────────────────────────────────────────────────

function StatsTab() {
  const stats = useWhatsAppStats();
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>
          Message Statistics
        </h3>
        <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
          Overview of your WhatsApp Business activity
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Messages" value={stats.total} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<MessageSquare size={22} />} />
        <StatCard title="Received" value={stats.inbound} iconBg="#DBEAFE" iconColor="#2563EB" icon={<MessageSquare size={22} />} />
        <StatCard title="Sent" value={stats.outbound} iconBg="#DCFCE7" iconColor="#16A34A" icon={<Send size={20} />} />
        <StatCard title="Today" value={stats.today} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<BarChart3 size={22} />} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center justify-between border bg-white p-5 rounded" style={{ borderColor: "var(--adm-border)" }}>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--adm-text-3)" }}>
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold" style={{ color: "var(--adm-text)" }}>
          {value}
        </p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
  );
}



