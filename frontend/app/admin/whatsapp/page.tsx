"use client";

import { useState } from "react";
import {
  Wifi,
  WifiOff,
  Send,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronLeft,
  Bot,
  MessageSquare,
  BarChart3,
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
  useWhatsAppConnection,
  useWhatsAppLogout,
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
type TabKey = "connection" | "inbox" | "send" | "rules" | "stats";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "connection", label: "Connection", icon: <Wifi size={16} /> },
  { key: "inbox", label: "Inbox", icon: <MessageSquare size={16} /> },
  { key: "send", label: "Send Message", icon: <Send size={16} /> },
  { key: "rules", label: "Auto-Reply", icon: <Bot size={16} /> },
  { key: "stats", label: "Stats", icon: <BarChart3 size={16} /> },
];

// ─── Helpers ────────────────────────────────────────────────────────────

type Conversation = { number: string; name: string; messages: WAMessage[] };

function numberOf(m: WAMessage): string {
  if (m.jid) return m.jid.split("@")[0].split(":")[0];
  const raw = m.direction === "inbound" ? m.from : m.to;
  return (raw || "unknown").replace(/[^0-9]/g, "") || "unknown";
}

/** Group the flat message list into per-contact threads, newest activity first. */
function groupConversations(messages: WAMessage[]): Conversation[] {
  const byNumber = new Map<string, Conversation>();
  for (const m of messages) {
    const number = numberOf(m);
    let conv = byNumber.get(number);
    if (!conv) {
      conv = { number, name: number, messages: [] };
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
        title="WhatsApp Manager"
        description="Self-hosted WhatsApp bot powered by Baileys (open source)"
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

      {activeTab === "connection" && <ConnectionTab />}
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

// ─── Connection ─────────────────────────────────────────────────────────

function ConnectionTab() {
  const { data, isLoading, isError, refetch } = useWhatsAppConnection();
  const logout = useWhatsAppLogout();

  if (isLoading) return <AdminLoadingState label="Checking connection…" />;
  if (isError)
    return (
      <AdminErrorState message="Could not reach the WhatsApp bot service. Check that it is running and WA_SERVICE_URL is set." />
    );

  const status = data?.status ?? "close";
  const qr = data?.qr ?? null;
  const me = data?.me ?? null;
  const connected = status === "open";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Status card */}
      <div
        className="flex flex-col gap-4 border bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--adm-border)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: connected ? "#DCFCE7" : "#FEE2E2" }}
          >
            {connected ? (
              <Wifi size={24} className="text-green-600" />
            ) : (
              <WifiOff size={24} className="text-red-600" />
            )}
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--adm-text)" }}>
              {connected
                ? "Connected"
                : status === "qr"
                  ? "Waiting for QR scan"
                  : status === "connecting"
                    ? "Connecting…"
                    : status === "logged_out"
                      ? "Logged out"
                      : "Disconnected"}
            </p>
            <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
              {connected && me
                ? `Linked as +${me.number}`
                : "Scan the QR code below with WhatsApp to link this bot."}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 border px-3 py-2 text-sm font-semibold transition hover:shadow-sm"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="btn-press px-3 py-2 text-sm font-semibold text-white transition hover:shadow-md disabled:opacity-50"
            style={{ background: "var(--adm-red)" }}
          >
            {logout.isPending ? "Working…" : connected ? "Unlink" : "Re-pair"}
          </button>
        </div>
      </div>

      {/* QR / ready card */}
      {connected ? (
        <div className="border bg-white p-8 text-center" style={{ borderColor: "var(--adm-border)" }}>
          <CheckCheck size={44} className="mx-auto mb-3 text-green-500" />
          <h3 className="mb-1 text-lg font-bold" style={{ color: "var(--adm-text)" }}>
            Ready to go
          </h3>
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            WhatsApp is connected. Send and receive messages from the Inbox and Send tabs.
          </p>
        </div>
      ) : (
        <div className="border bg-white p-6 text-center" style={{ borderColor: "var(--adm-border)" }}>
          <h3 className="mb-4 text-lg font-bold" style={{ color: "var(--adm-text)" }}>
            Pairing QR Code
          </h3>
          {qr ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={qr}
                alt="WhatsApp login QR code"
                width={264}
                height={264}
                className="rounded border"
                style={{ borderColor: "var(--adm-border)" }}
              />
              <ol
                className="mx-auto max-w-sm space-y-1 text-left text-sm"
                style={{ color: "var(--adm-text-3)" }}
              >
                <li>1. Open WhatsApp on your phone.</li>
                <li>2. Tap Settings → Linked Devices → Link a Device.</li>
                <li>3. Point your camera at this code.</li>
              </ol>
            </div>
          ) : (
            <AdminEmptyState
              title="Generating QR…"
              description="The bot service is preparing a login code. It appears here within a few seconds. If it never shows, restart the bot service on the host."
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inbox ──────────────────────────────────────────────────────────────

function InboxTab({ onReply }: { onReply: (number: string) => void }) {
  const { data, isLoading, isError } = useWhatsAppMessages();

  if (isLoading) return <AdminLoadingState label="Loading conversations…" />;
  if (isError)
    return <AdminErrorState message="Could not load messages. Verify the bot service is reachable." />;

  const conversations = groupConversations(data?.data ?? []);

  if (conversations.length === 0) {
    return (
      <AdminEmptyState
        title="No conversations yet"
        description="When someone messages your linked number, the thread appears here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conv) => (
        <ConversationCard key={conv.number} conv={conv} onReply={() => onReply(conv.number)} />
      ))}
    </div>
  );
}

function ConversationCard({ conv, onReply }: { conv: Conversation; onReply: () => void }) {
  const sendMessage = useSendWhatsAppMessage();
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  const displayName = conv.name !== conv.number ? `${conv.name} · +${conv.number}` : `+${conv.number}`;

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
    <div className="border bg-white p-5" style={{ borderColor: "var(--adm-border)" }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-base font-bold" style={{ color: "var(--adm-text)" }}>
          {displayName}
        </h3>
        <button
          type="button"
          onClick={onReply}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold"
          style={{ color: "var(--adm-blue)" }}
        >
          <Send size={12} /> Rich reply
        </button>
      </div>

      <div className="mb-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {conv.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

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
          placeholder="Type a reply…  (Enter to send, Shift+Enter for newline)"
          rows={2}
          className={adminInputClass}
          style={{ ...adminInputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={handleReply}
          disabled={sendMessage.isPending || !reply.trim()}
          className="btn-press flex items-center justify-center gap-2 px-4 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--adm-blue)" }}
        >
          <Send size={14} />
          {sendMessage.isPending ? "…" : "Send"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs" style={{ color: "var(--adm-red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: WAMessage }) {
  const isOutbound = message.direction === "outbound";
  return (
    <div
      className="max-w-[85%] border px-3 py-2 text-sm"
      style={{
        marginLeft: isOutbound ? "auto" : undefined,
        borderColor: isOutbound ? "#BBF7D0" : "#BFDBFE",
        background: isOutbound ? "#F0FDF4" : "#EFF6FF",
      }}
    >
      <p className="whitespace-pre-wrap" style={{ color: "var(--adm-text)" }}>
        {message.body}
      </p>
      <div className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: "var(--adm-text-3)" }}>
        {isOutbound && <CheckCheck size={11} className="text-blue-500" />}
        <span>
          {isOutbound ? "Sent" : "Received"} ·{" "}
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
  const [buttons, setButtons] = useState<Array<{ id: string; title: string }>>([{ id: "", title: "" }]);
  const [templateName, setTemplateName] = useState("");
  const [cannedText, setCannedText] = useState("");
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
      setSendError("Please enter a recipient phone number (digits only, with country code).");
      return;
    }

    try {
      const payload: Record<string, unknown> = { type: messageType, to };

      if (messageType === "text") {
        if (!messageText.trim()) {
          setSendError("Please enter a message.");
          return;
        }
        payload.message = messageText;
      } else if (messageType === "buttons") {
        const validButtons = buttons.filter((b) => b.title.trim());
        if (!bodyText.trim() || validButtons.length === 0) {
          setSendError("Enter body text and at least one button.");
          return;
        }
        if (validButtons.length > 3) {
          setSendError("Maximum 3 buttons.");
          return;
        }
        payload.bodyText = bodyText;
        payload.buttons = validButtons.map((b, i) => ({ id: b.id || `btn_${i + 1}`, title: b.title }));
      } else if (messageType === "template") {
        if (!templateName) {
          setSendError("Select a saved message.");
          return;
        }
        payload.template = templateName;
      }

      await sendMessage.mutateAsync(payload as any);
      setSendSuccess(true);
      onSent();

      setTimeout(() => {
        setMessageText("");
        setBodyText("");
        setButtons([{ id: "", title: "" }]);
        setTemplateName("");
        setCannedText("");
        setSendSuccess(false);
      }, 2000);
    } catch (error: any) {
      setSendError(error.message || "Failed to send message.");
    }
  };

  const selectTemplate = (name: string) => {
    setTemplateName(name);
    setCannedText(templates.find((t) => t.name === name)?.text ?? "");
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
        <AdminField label="Recipient phone number (with country code, digits only)" htmlFor="recipient">
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
              placeholder="Enter your message here…"
              rows={6}
              className={adminInputClass}
              style={adminInputStyle}
            />
            <p className="mt-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
              Supports WhatsApp markdown: *bold* _italic_ ~strikethrough~
            </p>
          </AdminField>
        )}

        {/* Buttons */}
        {messageType === "buttons" && (
          <>
            <AdminField label="Body text" htmlFor="bodyText">
              <textarea
                id="bodyText"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Main message text…"
                rows={4}
                className={adminInputClass}
                style={adminInputStyle}
              />
            </AdminField>

            <div>
              <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                Buttons{" "}
                <span className="text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>
                  (max 3 — sent as a numbered menu so every phone can reply)
                </span>
              </label>
              <div className="space-y-2">
                {buttons.map((btn, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={btn.title}
                      onChange={(e) => {
                        const next = [...buttons];
                        next[index] = { ...next[index], title: e.target.value };
                        setButtons(next);
                      }}
                      placeholder={`Option ${index + 1}`}
                      className={adminInputClass}
                      style={{ ...adminInputStyle, flex: 1 }}
                    />
                    {buttons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setButtons(buttons.filter((_, i) => i !== index))}
                        className="border px-3 text-sm transition hover:shadow-sm"
                        style={{ borderColor: "var(--adm-border)", color: "var(--adm-red)" }}
                        aria-label="Remove option"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {buttons.length < 3 && (
                <button
                  type="button"
                  onClick={() => setButtons([...buttons, { id: "", title: "" }])}
                  className="mt-3 border px-4 py-2 text-sm font-semibold transition hover:shadow-sm"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                >
                  + Add option
                </button>
              )}
            </div>
          </>
        )}

        {/* Template / canned messages */}
        {messageType === "template" && (
          <>
            <AdminField label="Saved message" htmlFor="template">
              <select
                id="template"
                value={templateName}
                onChange={(e) => selectTemplate(e.target.value)}
                className={adminInputClass}
                style={{ ...adminInputStyle, appearance: "none" }}
              >
                <option value="">Select a saved message…</option>
                {templates.map((tpl) => (
                  <option key={tpl.name} value={tpl.name}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </AdminField>

            {cannedText && (
              <div
                className="border p-3 text-sm"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}
              >
                <p className="whitespace-pre-wrap">{cannedText}</p>
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
            Message sent!
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
          Manage saved messages
        </p>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-xs font-semibold"
          style={{ color: "var(--adm-blue)" }}
        >
          {showAdd ? "Close" : "+ New"}
        </button>
      </div>

      {templates.length > 0 && (
        <div className="mt-3 space-y-2">
          {templates.map((t) => (
            <div key={t.name} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span className="font-semibold" style={{ color: "var(--adm-text)" }}>
                  {t.name}
                </span>
                <span className="ml-2 break-words" style={{ color: "var(--adm-text-3)" }}>
                  {t.text}
                </span>
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
            placeholder="Name (e.g. hours)"
            className={adminInputClass}
            style={adminInputStyle}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="The saved message text…"
            rows={3}
            className={adminInputClass}
            style={adminInputStyle}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saveTemplate.isPending || !name.trim() || !text.trim()}
            className="btn-press px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--adm-blue)" }}
          >
            {saveTemplate.isPending ? "Saving…" : "Save template"}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>
            Auto-Reply Rules
          </h3>
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            The bot answers automatically when an incoming message matches a keyword.
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
          description="Add keyword-based rules so the bot can answer common questions automatically."
        />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-3 border bg-white p-4"
              style={{ borderColor: "var(--adm-border)" }}
            >
              <div className="min-w-0">
                <p className="font-semibold" style={{ color: "var(--adm-text)" }}>
                  “{rule.keyword}”{" "}
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
    <div className="border bg-white p-4" style={{ borderColor: "var(--adm-border)" }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="Keyword" htmlFor={`kw-${rule.id}`}>
          <input
            id={`kw-${rule.id}`}
            type="text"
            value={rule.keyword}
            onChange={(e) => onUpdate(rule.id, "keyword", e.target.value)}
            placeholder="e.g. hello"
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
            style={{ ...adminInputStyle, appearance: "none" }}
          >
            <option value="contains">Contains</option>
            <option value="equals">Exact match</option>
            <option value="starts">Starts with</option>
          </select>
        </AdminField>
      </div>

      <div className="mt-3">
        <AdminField label="Reply" htmlFor={`reply-${rule.id}`}>
          <textarea
            id={`reply-${rule.id}`}
            value={rule.reply}
            onChange={(e) => onUpdate(rule.id, "reply", e.target.value)}
            placeholder="The message to send back automatically…"
            rows={2}
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Messages" value={stats.total} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<MessageSquare size={22} />} />
      <StatCard title="Received" value={stats.inbound} iconBg="#DBEAFE" iconColor="#2563EB" icon={<ChevronLeft size={22} />} />
      <StatCard title="Sent" value={stats.outbound} iconBg="#DCFCE7" iconColor="#16A34A" icon={<Send size={20} />} />
      <StatCard title="Today" value={stats.today} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<BarChart3 size={22} />} />
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
    <div className="flex items-center justify-between border bg-white p-5" style={{ borderColor: "var(--adm-border)" }}>
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
