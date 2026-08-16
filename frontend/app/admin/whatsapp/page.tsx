"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Clock,
  CheckCheck,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RefreshCw,
  TrendingUp,
  MessageCircle,
  BarChart3,
} from "lucide-react";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/admin/AdminUI";
import { useWhatsAppMessages, useSendWhatsAppMessage, useWhatsAppStats } from "@/hooks/useWhatsApp";

type MessageType = "text" | "buttons" | "template";

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "send" | "stats">("inbox");
  const { data, isLoading, isError, refetch } = useWhatsAppMessages();
  const sendMessage = useSendWhatsAppMessage();
  const stats = useWhatsAppStats();

  const messages = data?.data ?? [];

  // Send form state
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [recipient, setRecipient] = useState("");
  const [messageText, setMessageText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<Array<{ id: string; title: string }>>([
    { id: "btn_1", title: "" },
  ]);
  const [templateName, setTemplateName] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSend = async () => {
    setSendError("");
    setSendSuccess(false);

    if (!recipient.trim()) {
      setSendError("Please enter a recipient phone number");
      return;
    }

    try {
      let payload: any = { type: messageType, to: recipient };

      switch (messageType) {
        case "text":
          if (!messageText.trim()) {
            setSendError("Please enter a message");
            return;
          }
          payload.message = messageText;
          break;

        case "buttons":
          if (!bodyText.trim()) {
            setSendError("Please enter body text");
            return;
          }
          const validButtons = buttons.filter((b) => b.title.trim());
          if (validButtons.length === 0) {
            setSendError("Please add at least one button");
            return;
          }
          if (validButtons.length > 3) {
            setSendError("WhatsApp allows maximum 3 buttons");
            return;
          }
          payload.bodyText = bodyText;
          payload.footerText = footerText;
          payload.buttons = validButtons;
          break;

        case "template":
          if (!templateName.trim()) {
            setSendError("Please enter a template name");
            return;
          }
          payload.template = templateName;
          break;
      }

      await sendMessage.mutateAsync(payload);
      setSendSuccess(true);

      setTimeout(() => {
        setRecipient("");
        setMessageText("");
        setBodyText("");
        setFooterText("");
        setButtons([{ id: "btn_1", title: "" }]);
        setTemplateName("");
        setSendSuccess(false);
      }, 2000);

      refetch();
    } catch (error: any) {
      setSendError(error.message || "Failed to send message");
    }
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { id: `btn_${buttons.length + 1}`, title: "" }]);
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: "id" | "title", value: string) => {
    const updated = [...buttons];
    updated[index][field] = value;
    setButtons(updated);
  };

  return (
    <div>
      <AdminPageHeader
        title="WhatsApp Manager"
        description="Send and receive WhatsApp messages via Meta Cloud API"
      />

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border bg-white p-5" style={{ borderColor: "var(--adm-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--adm-text-3)" }}>
                Total Messages
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: "var(--adm-text)" }}>
                {stats.total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--adm-blue-light)" }}>
              <MessageCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="border bg-white p-5" style={{ borderColor: "var(--adm-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--adm-text-3)" }}>
                Received
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {stats.inbound}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <ArrowLeft className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="border bg-white p-5" style={{ borderColor: "var(--adm-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--adm-text-3)" }}>
                Sent
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats.outbound}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <ArrowRight className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="border bg-white p-5" style={{ borderColor: "var(--adm-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--adm-text-3)" }}>
                Today
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: "var(--adm-blue)" }}>
                {stats.today}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--adm-blue-light)" }}>
              <TrendingUp style={{ color: "var(--adm-blue)" }} size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b" style={{ borderColor: "var(--adm-border)" }}>
        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "inbox"
              ? "text-blue-600"
              : ""
          }`}
          style={{
            borderColor: activeTab === "inbox" ? "var(--adm-blue)" : "transparent",
            color: activeTab === "inbox" ? "var(--adm-blue)" : "var(--adm-text-2)",
            marginBottom: "-1px",
          }}
        >
          <MessageSquare size={16} />
          Inbox
          {messages.length > 0 && (
            <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: "var(--adm-blue)" }}>
              {messages.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("send")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition`}
          style={{
            borderColor: activeTab === "send" ? "var(--adm-blue)" : "transparent",
            color: activeTab === "send" ? "var(--adm-blue)" : "var(--adm-text-2)",
            marginBottom: "-1px",
          }}
        >
          <Send size={16} />
          Send Message
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition`}
          style={{
            borderColor: activeTab === "stats" ? "var(--adm-blue)" : "transparent",
            color: activeTab === "stats" ? "var(--adm-blue)" : "var(--adm-text-2)",
            marginBottom: "-1px",
          }}
        >
          <BarChart3 size={16} />
          API Info
        </button>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading}
          className="ml-auto flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition hover:shadow-sm disabled:opacity-50"
          style={{
            borderColor: "var(--adm-border)",
            color: "var(--adm-text)",
            background: "var(--adm-surface)",
          }}
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Inbox Tab */}
      {activeTab === "inbox" && (
        <div>
          {isLoading && <AdminLoadingState label="Loading messages..." />}
          {isError && (
            <AdminErrorState message="Could not load WhatsApp messages. Verify WA service URL in environment variables." />
          )}

          {!isLoading && !isError && messages.length === 0 && (
            <AdminEmptyState
              title="No messages yet"
              description="WhatsApp messages will appear here once received or sent."
            />
          )}

          {!isLoading && !isError && messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`border bg-white p-5 transition hover:shadow-sm`}
                  style={{
                    borderColor: msg.direction === "inbound" ? "#3B82F6" : "#16A34A",
                    borderLeftWidth: "4px",
                  }}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {msg.direction === "inbound" ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                          <ArrowLeft size={18} className="text-blue-600" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                          <ArrowRight size={18} className="text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold" style={{ color: "var(--adm-text)" }}>
                          {msg.direction === "inbound" ? `From: ${msg.from}` : `To: ${msg.to}`}
                        </p>
                        <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
                          Type: {msg.type} {msg.status && `• Status: ${msg.status}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
                      <Clock size={12} />
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap pl-13 text-sm" style={{ color: "var(--adm-text)" }}>
                    {msg.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Send Tab */}
      {activeTab === "send" && (
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
            <div>
              <label htmlFor="recipient" className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                Recipient Phone Number
                <span className="ml-2 text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>
                  (e.g., 923001234567 - no + symbol)
                </span>
              </label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="923001234567"
                className="w-full border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--adm-border)",
                  background: "var(--adm-surface)",
                  color: "var(--adm-text)",
                }}
              />
            </div>

            {/* Text Message */}
            {messageType === "text" && (
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                  Message
                </label>
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--adm-border)",
                    background: "var(--adm-surface)",
                    color: "var(--adm-text)",
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
                  Supports WhatsApp markdown: *bold* _italic_ ~strikethrough~
                </p>
              </div>
            )}

            {/* Buttons Message */}
            {messageType === "buttons" && (
              <>
                <div>
                  <label htmlFor="bodyText" className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                    Body Text
                  </label>
                  <textarea
                    id="bodyText"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Main message text..."
                    rows={4}
                    className="w-full border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--adm-border)",
                      background: "var(--adm-surface)",
                      color: "var(--adm-text)",
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="footerText" className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                    Footer Text <span className="text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="footerText"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Footer text..."
                    className="w-full border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--adm-border)",
                      background: "var(--adm-surface)",
                      color: "var(--adm-text)",
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                    Buttons <span className="text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>(max 3)</span>
                  </label>
                  <div className="space-y-2">
                    {buttons.map((btn, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={btn.id}
                          onChange={(e) => updateButton(index, "id", e.target.value)}
                          placeholder="Button ID"
                          className="w-1/3 border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: "var(--adm-border)",
                            background: "var(--adm-surface)",
                            color: "var(--adm-text)",
                          }}
                        />
                        <input
                          type="text"
                          value={btn.title}
                          onChange={(e) => updateButton(index, "title", e.target.value)}
                          placeholder="Button Title"
                          className="flex-1 border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: "var(--adm-border)",
                            background: "var(--adm-surface)",
                            color: "var(--adm-text)",
                          }}
                        />
                        {buttons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeButton(index)}
                            className="border px-3 text-sm transition hover:shadow-sm"
                            style={{
                              borderColor: "var(--adm-border)",
                              color: "var(--adm-red)",
                            }}
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
                      onClick={addButton}
                      className="mt-3 border px-4 py-2 text-sm font-semibold transition hover:shadow-sm"
                      style={{
                        borderColor: "var(--adm-border)",
                        color: "var(--adm-text)",
                      }}
                    >
                      + Add Button
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Template Message */}
            {messageType === "template" && (
              <div>
                <label htmlFor="template" className="mb-2 block text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                  Template Name
                </label>
                <input
                  type="text"
                  id="template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="order_update"
                  className="w-full border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--adm-border)",
                    background: "var(--adm-surface)",
                    color: "var(--adm-text)",
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
                  Templates must be pre-approved in Meta Business Manager.
                </p>
              </div>
            )}

            {/* Error/Success */}
            {sendError && (
              <div className="flex items-center gap-2 border bg-red-50 p-4 text-sm" style={{ borderColor: "var(--adm-red)", color: "var(--adm-red)" }}>
                <AlertCircle size={16} className="shrink-0" />
                {sendError}
              </div>
            )}

            {sendSuccess && (
              <div className="flex items-center gap-2 border bg-green-50 p-4 text-sm" style={{ borderColor: "var(--adm-green)", color: "var(--adm-green)" }}>
                <CheckCheck size={16} className="shrink-0" />
                Message sent successfully!
              </div>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sendMessage.isPending}
              className="flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-white transition hover:shadow-md disabled:opacity-50"
              style={{ background: "var(--adm-blue)" }}
            >
              <Send size={16} />
              {sendMessage.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      )}

      {/* API Info Tab */}
      {activeTab === "stats" && (
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="border bg-white p-6" style={{ borderColor: "var(--adm-border)" }}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: "var(--adm-text)" }}>
              <Phone size={18} />
              Service Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--adm-text-3)" }}>WA Service URL:</span>
                <code className="rounded bg-gray-100 px-2 py-1" style={{ color: "var(--adm-text)" }}>
                  {process.env.NEXT_PUBLIC_WA_SERVICE_URL || process.env.WA_SERVICE_URL || "Not configured"}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--adm-text-3)" }}>Status:</span>
                <span className={messages.length >= 0 ? "text-green-600" : "text-red-600"}>
                  {messages.length >= 0 ? "✓ Connected" : "✗ Disconnected"}
                </span>
              </div>
            </div>
          </div>

          <div className="border bg-white p-6" style={{ borderColor: "var(--adm-border)" }}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold" style={{ color: "var(--adm-text)" }}>
              <BarChart3 size={18} />
              API Endpoints
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-mono" style={{ color: "var(--adm-blue)" }}>POST /api/whatsapp/send</p>
                <p style={{ color: "var(--adm-text-3)" }}>Send messages (text, buttons, template)</p>
              </div>
              <div>
                <p className="mb-1 font-mono" style={{ color: "var(--adm-blue)" }}>GET /api/whatsapp/messages</p>
                <p style={{ color: "var(--adm-text-3)" }}>Retrieve message history</p>
              </div>
              <div>
                <p className="mb-1 font-mono" style={{ color: "var(--adm-blue)" }}>POST /api/whatsapp/webhook</p>
                <p style={{ color: "var(--adm-text-3)" }}>Webhook for incoming messages</p>
              </div>
            </div>
          </div>

          <div className="border bg-white p-6" style={{ borderColor: "var(--adm-border)" }}>
            <h3 className="mb-4 text-lg font-bold" style={{ color: "var(--adm-text)" }}>Quick API Example</h3>
            <pre className="overflow-x-auto rounded bg-gray-50 p-4 text-xs" style={{ color: "var(--adm-text)" }}>
{`// Send text message
fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text',
    to: '923001234567',
    message: 'Hello!'
  })
});`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
