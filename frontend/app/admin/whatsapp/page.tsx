"use client";

import { useState } from "react";
import {
  Send,
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
} from "@/hooks/useWhatsApp";
import type { WAMessage, AutoReplyRule, WATemplate } from "@/hooks/useWhatsApp";

type MessageType = "text" | "buttons" | "template";
type TabKey = "inbox" | "send" | "rules" | "stats";
type DealStatus = "new" | "contacted" | "negotiating" | "won" | "lost";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "inbox", label: "Inbox", icon: <MessageSquare size={16} /> },
  { key: "send", label: "Send Message", icon: <Send size={16} /> },
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
      {activeTab === "rules" && <RulesTab />}
      {activeTab === "stats" && <StatsTab />}
    </div>
  );
}

// ─── Inbox ──────────────────────────────────────────────────────────────

function InboxTab({ onReply }: { onReply: (number: string) => void }) {
  const { data, isLoading, isError, refetch } = useWhatsAppMessages();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");

  if (isLoading) return <AdminLoadingState label="Loading conversations…" />;
  if (isError)
    return <AdminErrorState message="Could not load messages. Check your WhatsApp configuration." />;

  const conversations = groupConversations(data?.data ?? []);

  // Filter conversations
  const filtered = conversations.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.number.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || conv.dealStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--adm-text-3)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className={adminInputClass}
            style={{ ...adminInputStyle, paddingLeft: "2.5rem" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DealStatus | "all")}
            className={adminInputClass}
            style={{ ...adminInputStyle, width: "auto", minWidth: "140px" }}
          >
            <option value="all">All Status</option>
            {DEAL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 border px-3 py-2 text-sm font-semibold transition hover:shadow-sm"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Conversations */}
      {filtered.length === 0 ? (
        <AdminEmptyState
          title={searchQuery || statusFilter !== "all" ? "No matches" : "No conversations yet"}
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "When customers message your WhatsApp Business number, conversations appear here."
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((conv) => (
            <ConversationCard key={conv.number} conv={conv} onReply={() => onReply(conv.number)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationCard({ conv, onReply }: { conv: Conversation; onReply: () => void }) {
  const sendMessage = useSendWhatsAppMessage();
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [dealStatus, setDealStatus] = useState<DealStatus>(conv.dealStatus || "new");
  const [notes, setNotes] = useState(conv.notes || "");

  const displayName = conv.name !== conv.number ? `${conv.name}` : `+${conv.number}`;
  const statusConfig = DEAL_STATUSES.find((s) => s.value === dealStatus);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setError("");
    try {
      await sendMessage.mutateAsync({ type: "text", to: conv.number, message: reply });
      setReply("");
    } catch (e: any) {
      setError(e.message || "Failed to send");
    }
  };

  return (
    <div className="border bg-white" style={{ borderColor: "var(--adm-border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b p-4" style={{ borderColor: "var(--adm-border)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--adm-blue-light)" }}>
            <User size={20} style={{ color: "var(--adm-blue)" }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: "var(--adm-text)" }}>
              {displayName}
            </h3>
            <p className="flex items-center gap-1 text-xs" style={{ color: "var(--adm-text-3)" }}>
              <Phone size={11} />
              +{conv.number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: statusConfig?.bgColor, color: statusConfig?.color }}
          >
            {statusConfig?.label}
          </span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold"
            style={{ color: "var(--adm-blue)" }}
          >
            {showDetails ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="border-b p-4" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--adm-text)" }}>
              Deal Status
            </label>
            <select
              value={dealStatus}
              onChange={(e) => setDealStatus(e.target.value as DealStatus)}
              className={adminInputClass}
              style={adminInputStyle}
            >
              {DEAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--adm-text)" }}>
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this customer (private, not sent)…"
              rows={2}
              className={adminInputClass}
              style={adminInputStyle}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="max-h-80 space-y-2 overflow-y-auto p-4">
        {conv.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Reply Box */}
      <div className="border-t p-3" style={{ borderColor: "var(--adm-border)" }}>
        <div className="flex gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
            placeholder="Type a reply… (Enter to send, Shift+Enter for newline)"
            rows={2}
            className={adminInputClass}
            style={{ ...adminInputStyle, flex: 1 }}
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleReply}
              disabled={sendMessage.isPending || !reply.trim()}
              className="btn-press flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--adm-blue)" }}
            >
              <Send size={14} />
              {sendMessage.isPending ? "…" : "Send"}
            </button>
            <button
              type="button"
              onClick={onReply}
              className="flex items-center justify-center gap-1 border px-4 py-2 text-xs font-semibold transition hover:shadow-sm"
              style={{ borderColor: "var(--adm-border)", color: "var(--adm-blue)" }}
            >
              <FileText size={12} />
              Template
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-xs" style={{ color: "var(--adm-red)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: WAMessage }) {
  const isOutbound = message.direction === "outbound";
  return (
    <div
      className="max-w-[85%] rounded-lg px-3 py-2 text-sm"
      style={{
        marginLeft: isOutbound ? "auto" : undefined,
        background: isOutbound ? "#DCF8C6" : "#FFFFFF",
        border: isOutbound ? "none" : "1px solid var(--adm-border)",
      }}
    >
      <p className="whitespace-pre-wrap" style={{ color: "var(--adm-text)" }}>
        {message.body}
      </p>
      <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: "var(--adm-text-3)" }}>
        {isOutbound && <CheckCheck size={11} className="text-blue-500" />}
        <span>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
  const [bodyText, setBodyText] = useState("");
  const [buttons, setButtons] = useState<string[]>(["", "", ""]);
  const [templateName, setTemplateName] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  const sendMessage = useSendWhatsAppMessage();
  const { data: templatesData } = useWhatsAppTemplates();
  const templates: WATemplate[] = templatesData?.data ?? [];

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
      } else if (messageType === "buttons") {
        const validButtons = buttons.filter((b) => b.trim()).slice(0, 3);
        if (!bodyText.trim() || validButtons.length === 0) {
          setSendError("Enter message text and at least one button");
          return;
        }
        payload.bodyText = bodyText;
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
        setBodyText("");
        setButtons(["", "", ""]);
        setTemplateName("");
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
          <div className="grid grid-cols-3 gap-3">
            {(["text", "buttons", "template"] as MessageType[]).map((type) => (
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

        {/* Buttons */}
        {messageType === "buttons" && (
          <>
            <AdminField label="Message text" htmlFor="bodyText">
              <textarea
                id="bodyText"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Main message…"
                rows={4}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>

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
          </>
        )}

        {/* Template */}
        {messageType === "template" && (
          <>
            <AdminField label="Saved template" htmlFor="template">
              <select
                id="template"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={adminInputClass}
                style={adminInputStyle}
              >
                <option value="">Select a template…</option>
                {templates.map((tpl) => (
                  <option key={tpl.name} value={tpl.name}>
                    {tpl.name}
                  </option>
                ))}
              </select>
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
          <select
            id={`mode-${rule.id}`}
            value={rule.mode}
            onChange={(e) => onUpdate(rule.id, "mode", e.target.value)}
            className={adminInputClass}
            style={adminInputStyle}
          >
            <option value="contains">Contains keyword</option>
            <option value="equals">Exact match</option>
            <option value="starts">Starts with</option>
          </select>
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
