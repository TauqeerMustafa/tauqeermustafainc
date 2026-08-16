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
} from "lucide-react";

import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminPageHeader,
} from "@/components/admin/AdminUI";
import { useWhatsAppMessages, useSendWhatsAppMessage } from "@/hooks/useWhatsApp";

type MessageType = "text" | "buttons" | "template";

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "send">("inbox");
  const { data, isLoading, isError, refetch } = useWhatsAppMessages();
  const sendMessage = useSendWhatsAppMessage();

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

    // Validation
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

      // Reset form
      setTimeout(() => {
        setMessageText("");
        setBodyText("");
        setFooterText("");
        setButtons([{ id: "btn_1", title: "" }]);
        setTemplateName("");
        setSendSuccess(false);
      }, 2000);

      // Refresh inbox
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

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
            activeTab === "inbox"
              ? "border-b-2 border-yellow-400 text-white"
              : "text-slate-400 hover:text-slate-300"
          }`}
          style={{ marginBottom: "-14px" }}
        >
          <MessageSquare size={16} />
          Inbox
          {messages.length > 0 && (
            <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black">
              {messages.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("send")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
            activeTab === "send"
              ? "border-b-2 border-yellow-400 text-white"
              : "text-slate-400 hover:text-slate-300"
          }`}
          style={{ marginBottom: "-14px" }}
        >
          <Send size={16} />
          Send Message
        </button>
      </div>

      {/* Inbox Tab */}
      {activeTab === "inbox" && (
        <div>
          {isLoading && <AdminLoadingState label="Loading messages..." />}
          {isError && (
            <AdminErrorState message="Could not load WhatsApp messages. Make sure the WA service is running." />
          )}

          {!isLoading && !isError && messages.length === 0 && (
            <AdminEmptyState
              title="No messages yet"
              description="WhatsApp messages will appear here once your bot receives them."
            />
          )}

          {!isLoading && !isError && messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`border p-4 ${
                    msg.direction === "inbound"
                      ? "border-blue-500/30 bg-blue-500/5"
                      : "border-green-500/30 bg-green-500/5"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {msg.direction === "inbound" ? (
                        <ArrowLeft size={18} className="shrink-0 text-blue-400" />
                      ) : (
                        <ArrowRight size={18} className="shrink-0 text-green-400" />
                      )}
                      <div>
                        <p className="font-semibold text-white">
                          {msg.direction === "inbound" ? `From: ${msg.from}` : `To: ${msg.to}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          Type: {msg.type} {msg.status && `• Status: ${msg.status}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap pl-9 text-sm text-slate-300">{msg.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Send Tab */}
      {activeTab === "send" && (
        <div className="mx-auto max-w-2xl">
          <div className="space-y-6 border border-white/10 bg-white/5 p-6">
            {/* Message Type Selector */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">Message Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(["text", "buttons", "template"] as MessageType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMessageType(type)}
                    className={`border px-4 py-2 text-sm font-semibold capitalize transition ${
                      messageType === type
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                        : "border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label htmlFor="recipient" className="mb-2 block text-sm font-semibold text-white">
                Recipient Phone Number
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (e.g., 923001234567)
                </span>
              </label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="923001234567"
                className="w-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            {/* Text Message */}
            {messageType === "text" && (
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Supports WhatsApp markdown: *bold* _italic_ ~strikethrough~
                </p>
              </div>
            )}

            {/* Buttons Message */}
            {messageType === "buttons" && (
              <>
                <div>
                  <label htmlFor="bodyText" className="mb-2 block text-sm font-semibold text-white">
                    Body Text
                  </label>
                  <textarea
                    id="bodyText"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Main message text..."
                    rows={4}
                    className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="footerText" className="mb-2 block text-sm font-semibold text-white">
                    Footer Text <span className="text-xs font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="footerText"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Footer text..."
                    className="w-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Buttons <span className="text-xs font-normal text-slate-400">(max 3)</span>
                  </label>
                  <div className="space-y-2">
                    {buttons.map((btn, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={btn.id}
                          onChange={(e) => updateButton(index, "id", e.target.value)}
                          placeholder="Button ID"
                          className="w-1/3 border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={btn.title}
                          onChange={(e) => updateButton(index, "title", e.target.value)}
                          placeholder="Button Title"
                          className="flex-1 border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                        />
                        {buttons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeButton(index)}
                            className="border border-white/10 px-3 text-sm text-red-400 transition hover:border-red-400"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {buttons.length < 3 && (
                    <button
                      type="button"
                      onClick={addButton}
                      className="mt-2 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-400"
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
                <label htmlFor="template" className="mb-2 block text-sm font-semibold text-white">
                  Template Name
                </label>
                <input
                  type="text"
                  id="template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="order_update"
                  className="w-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Enter a pre-approved Meta template name. Templates must be created and approved in the Meta Business Manager.
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            {sendError && (
              <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                {sendError}
              </div>
            )}

            {sendSuccess && (
              <div className="flex items-center gap-2 border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                <CheckCheck size={16} className="shrink-0" />
                Message sent successfully!
              </div>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sendMessage.isPending}
              className="flex w-full items-center justify-center gap-2 bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {sendMessage.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>

          {/* API Documentation */}
          <div className="mt-8 border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Phone size={18} />
              API Endpoints
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-mono text-yellow-400">POST /api/whatsapp/send</p>
                <p className="text-slate-300">Send WhatsApp messages programmatically</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-yellow-400">GET /api/whatsapp/messages</p>
                <p className="text-slate-300">Retrieve all message history</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-yellow-400">POST /api/whatsapp/webhook</p>
                <p className="text-slate-300">Webhook endpoint for incoming messages</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
