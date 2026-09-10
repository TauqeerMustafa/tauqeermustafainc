"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCheck,
  Download,
  FileText,
  MessageCircle,
  Paperclip,
  Send,
  Shield,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

import { PortalButton } from "@/components/portal/PortalUI";
import { useCurrentUser } from "@/hooks/useAuth";
import { useMyStaffThread, useSendStaffMessage } from "@/hooks/useStaffMessages";

export type ChatContact = {
  id: string;
  name: string;
  role: string;
  title: string;
  avatarBg: string;
  badge: string;
  status: "online" | "away" | "busy";
  welcomeMessage: string;
};

export const DIRECT_CONTACTS: ChatContact[] = [
  {
    id: "admin-hr",
    name: "System Admin & HR Office",
    role: "Administrator",
    title: "Executive & Administrative Desk",
    avatarBg: "bg-adm-blue text-white",
    badge: "Admin Desk",
    status: "online",
    welcomeMessage:
      "Welcome to the Admin & HR direct communication channel. Send any administrative, policy, or urgent workplace matters directly here.",
  },
  {
    id: "head-eng",
    name: "Head of Engineering",
    role: "Department Head",
    title: "Engineering & Architecture Lead",
    avatarBg: "bg-emerald-600 text-white",
    badge: "Engineering Head",
    status: "online",
    welcomeMessage:
      "Engineering leadership channel. Reach out regarding sprint blockers, architectural decisions, production escalations, or tooling support.",
  },
  {
    id: "head-product",
    name: "Head of Product & Design",
    role: "Department Head",
    title: "Design Systems & Product Strategy",
    avatarBg: "bg-purple-600 text-white",
    badge: "Product Head",
    status: "online",
    welcomeMessage:
      "Design and Product desk. Use this thread for feature requirements, design reviews, client spec approvals, or UX questions.",
  },
  {
    id: "exec-desk",
    name: "Executive Management Desk",
    role: "Executive",
    title: "Operations & Governance",
    avatarBg: "bg-amber-600 text-white",
    badge: "Executive",
    status: "away",
    welcomeMessage:
      "Executive management bridge. For confidential escalations, strategic initiatives, or executive sign-offs.",
  },
];

export type ChatMessage = {
  id: string;
  sender: "employee" | "head";
  senderName: string;
  text: string;
  timestamp: string;
  urgent?: boolean;
  file?: {
    name: string;
    size: string;
    url?: string;
  };
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DirectChat() {
  const { data } = useCurrentUser();
  const user = data?.data;

  const [selectedContact, setSelectedContact] = useState<ChatContact>(DIRECT_CONTACTS[0]);
  const [inputVal, setInputVal] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; url?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Live real-time messages query from server database
  const threadQuery = useMyStaffThread(selectedContact.id);
  const sendMutation = useSendStaffMessage();

  const messages: ChatMessage[] = useMemo(() => {
    const serverRows = threadQuery.data ?? [];
    if (serverRows.length === 0) {
      return [
        {
          id: `init-${selectedContact.id}`,
          sender: "head",
          senderName: selectedContact.name,
          text: selectedContact.welcomeMessage,
          timestamp: "Official Channel • Secure & Encrypted",
        },
      ];
    }
    return serverRows.map((m) => ({
      id: m.id,
      sender: m.isFromStaff ? "employee" : "head",
      senderName: m.authorName,
      text: m.body,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      urgent: m.isUrgent,
      file: m.attachmentName
        ? {
            name: m.attachmentName,
            size: m.attachmentSize || "",
            url: m.attachmentUrl || undefined,
          }
        : undefined,
    }));
  }, [threadQuery.data, selectedContact]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      alert("File is too large. Please select a document under 15MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAttachedFile({
      name: file.name,
      size: formatFileSize(file.size),
      url: objectUrl,
    });
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed && !attachedFile) return;

    try {
      await sendMutation.mutateAsync({
        channel: selectedContact.id,
        body: trimmed || (attachedFile ? `Attached: ${attachedFile.name}` : ""),
        isUrgent,
        attachmentName: attachedFile?.name,
        attachmentSize: attachedFile?.size,
        attachmentUrl: attachedFile?.url,
      });

      setInputVal("");
      setAttachedFile(null);
      setIsUrgent(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  function handleClearThread() {
    alert("This channel is logged for official auditing. Messages cannot be deleted from staff records.");
  }

  function handleQuickPrompt(promptText: string) {
    setInputVal(promptText);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Description */}
      <div className="border border-adm-border bg-adm-surface p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-action">
                Direct Communication Rail
              </span>
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-adm-text">
              Direct Chat with Leadership &amp; Administration
            </h2>
            <p className="text-xs text-adm-text-3 mt-0.5">
              Send encrypted direct messages, attach files &amp; report blockers directly to your Department Head or Admin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/employees/messages"
              className="px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider border border-adm-border bg-adm-surface-2 hover:bg-adm-surface-3 text-adm-text-2 hover:text-adm-text transition"
            >
              Switch to Webmail
            </Link>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-adm-border bg-adm-surface min-h-[580px] overflow-hidden">
        {/* Left: Contact list */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-adm-border bg-adm-surface-2/40 flex flex-col">
          <div className="p-3.5 border-b border-adm-border bg-adm-surface-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-adm-text-3">
              Direct Channels
            </p>
          </div>

          <div className="divide-y divide-adm-border flex-1 overflow-y-auto">
            {DIRECT_CONTACTS.map((contact) => {
              const active = selectedContact.id === contact.id;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 ${
                    active
                      ? "bg-adm-surface border-l-4 border-l-adm-blue shadow-sm"
                      : "hover:bg-adm-surface/60 border-l-4 border-l-transparent"
                  }`}
                >
                  <div
                    className={`h-10 w-10 shrink-0 flex items-center justify-center font-bold text-xs ${contact.avatarBg}`}
                  >
                    {contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs truncate ${active ? "font-bold text-adm-text" : "font-medium text-adm-text-2"}`}>
                        {contact.name}
                      </p>
                      <span className="px-1.5 py-0.2 font-mono text-[9px] uppercase font-semibold border border-adm-border bg-adm-surface text-adm-text-3">
                        {contact.badge}
                      </span>
                    </div>

                    <p className="text-[11px] truncate text-adm-text-3">{contact.title}</p>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          contact.status === "online"
                            ? "bg-emerald-500"
                            : contact.status === "busy"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                        }`}
                      />
                      <span className="capitalize text-adm-text-3">{contact.status}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Help Tip */}
          <div className="p-3 border-t border-adm-border bg-adm-surface-2/70 text-[11px] text-adm-text-3">
            <p className="font-semibold text-adm-text-2 mb-1 flex items-center gap-1.5">
              <Shield size={12} className="text-adm-blue" /> Confidential &amp; Logged
            </p>
            All direct communications are safely archived in company audit records.
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-adm-surface">
          {/* Active Contact Header */}
          <div className="p-3.5 border-b border-adm-border bg-adm-surface-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 shrink-0 flex items-center justify-center font-bold text-xs ${selectedContact.avatarBg}`}
              >
                {selectedContact.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-xs font-bold text-adm-text flex items-center gap-2">
                  {selectedContact.name}
                  <span className="px-1.5 py-0.2 font-mono text-[9px] font-semibold border border-adm-border bg-adm-surface text-adm-text-3">
                    {selectedContact.role}
                  </span>
                </p>
                <p className="text-[11px] text-adm-text-3">{selectedContact.title}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearThread}
              title="Clear Thread"
              className="p-2 text-adm-text-3 hover:text-adm-red hover:bg-adm-surface transition"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[460px]">
            {messages.map((msg) => {
              const isMe = msg.sender === "employee";
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="font-mono text-[10px] font-bold text-adm-text-3">
                      {msg.senderName}
                    </span>
                    <span className="font-mono text-[9px] text-adm-text-3 opacity-70">
                      • {msg.timestamp}
                    </span>
                    {msg.urgent && (
                      <span className="px-1 py-0.2 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-mono text-[8.5px] font-bold uppercase">
                        Urgent
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 text-xs leading-relaxed ${
                      isMe
                        ? "bg-adm-blue text-white border border-adm-blue"
                        : "bg-adm-surface-2 text-adm-text border border-adm-border"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Attached File Preview */}
                    {msg.file && (
                      <div
                        className={`mt-2.5 p-2.5 border flex items-center justify-between gap-3 ${
                          isMe
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-adm-border bg-adm-surface text-adm-text"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="shrink-0 text-action" />
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] font-bold truncate">
                              {msg.file.name}
                            </p>
                            <p className="text-[9px] opacity-75 font-mono">{msg.file.size}</p>
                          </div>
                        </div>

                        {msg.file.url && (
                          <a
                            href={msg.file.url}
                            download={msg.file.name}
                            className="p-1 hover:opacity-80 transition shrink-0"
                            title="Download attachment"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sendMutation.isPending && (
              <div className="flex items-center gap-2 text-xs font-mono text-adm-text-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-blue animate-ping" />
                <span>Sending message to {selectedContact.name}…</span>
              </div>
            )}
            <div ref={scrollEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-adm-border bg-adm-surface-2/40 flex flex-wrap gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-adm-text-3 self-center mr-1">
              Quick:
            </span>
            <button
              type="button"
              onClick={() => handleQuickPrompt("I need urgent review on a pending task pull request.")}
              className="px-2 py-0.5 font-mono text-[10px] border border-adm-border bg-adm-surface hover:bg-adm-surface-2 text-adm-text-2 transition"
            >
              Task Review
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("Can we schedule a 10-minute 1:1 call today?")}
              className="px-2 py-0.5 font-mono text-[10px] border border-adm-border bg-adm-surface hover:bg-adm-surface-2 text-adm-text-2 transition"
            >
              Request 1:1
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("Reporting a production blocker that needs escalation.")}
              className="px-2 py-0.5 font-mono text-[10px] border border-adm-border bg-adm-surface hover:bg-adm-surface-2 text-adm-text-2 transition"
            >
              Production Blocker
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("Attached is the requested signed document for HR archives.")}
              className="px-2 py-0.5 font-mono text-[10px] border border-adm-border bg-adm-surface hover:bg-adm-surface-2 text-adm-text-2 transition"
            >
              Submit Document
            </button>
          </div>

          {/* Composer Box */}
          <form onSubmit={handleSend} className="p-4 border-t border-adm-border bg-adm-surface space-y-3">
            {/* File Attachment Pill */}
            {attachedFile && (
              <div className="flex items-center justify-between border border-adm-blue/30 bg-adm-blue/10 px-3 py-1.5 text-xs text-adm-text">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip size={14} className="text-adm-blue shrink-0" />
                  <span className="font-mono font-bold truncate text-[11px]">{attachedFile.name}</span>
                  <span className="font-mono text-[9px] text-adm-text-3">({attachedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-adm-text-3 hover:text-rose-500 transition p-1"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelected}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.csv,.xlsx,.txt"
            />

            {/* Textarea */}
            <div className="relative">
              <textarea
                rows={3}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Type a message to ${selectedContact.name}… (Press Enter to send, Shift+Enter for new line)`}
                className="w-full border border-adm-border bg-adm-surface-2 p-3 text-xs text-adm-text outline-none focus:border-adm-blue transition resize-none placeholder:text-adm-text-3"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 border border-adm-border bg-adm-surface-2 hover:bg-adm-surface-3 text-adm-text-2 hover:text-adm-text font-mono text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                >
                  <Paperclip size={13} />
                  Attach File / Doc
                </button>

                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-mono uppercase tracking-wider text-adm-text-3 hover:text-adm-text">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="accent-rose-500"
                  />
                  <span className={isUrgent ? "text-rose-500 font-bold" : ""}>Mark Urgent</span>
                </label>
              </div>

              <PortalButton
                type="submit"
                variant="primary"
                disabled={(!inputVal.trim() && !attachedFile) || sendMutation.isPending}
              >
                <Send size={13} className="mr-1.5" />
                {sendMutation.isPending ? "Sending…" : "Send Message"}
              </PortalButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
