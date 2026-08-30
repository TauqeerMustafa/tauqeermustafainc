"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, AlertTriangle, ArrowLeft, Edit, Send } from "lucide-react";

const EMAIL_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to Tauqeer Mustafa Inc!",
    body: "Hi there,\n\nWelcome to the team! We are thrilled to have you onboard.\n\nBest,\nHR Team"
  },
  {
    id: "meeting",
    name: "Meeting Request",
    subject: "Request for Meeting",
    body: "Hello,\n\nI would like to schedule a brief meeting to discuss our ongoing projects. Let me know what time works best for you.\n\nThanks!"
  },
  {
    id: "followup",
    name: "Follow Up",
    subject: "Following up on our last conversation",
    body: "Hi,\n\nI'm following up on our previous conversation. Please let me know if you have any updates.\n\nBest regards,"
  }
];

export default function MailInbox() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messageContent, setMessageContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mail/inbox")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load inbox");
        return res.json();
      })
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectMessage = async (msg: any) => {
    setIsComposing(false);
    setSelectedMessage(msg);
    setMessageContent(null);
    setContentError(null);
    setLoadingContent(true);
    
    try {
      const res = await fetch(`/api/mail/message?accountId=${data?.account?.accountId}&messageId=${msg.id}`);
      if (!res.ok) throw new Error("Failed to load message content");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setMessageContent(json.content);
    } catch (err: any) {
      setContentError(err.message);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCompose = () => {
    setIsComposing(true);
    setSelectedMessage(null);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setSendError(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) return;
    
    setSending(true);
    setSendError(null);
    
    try {
      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: data?.account?.accountId,
          toAddress: composeTo,
          subject: composeSubject,
          content: composeBody
        }),
      });
      
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to send email");
      
      setIsComposing(false);
      alert("Email sent successfully!");
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center border border-[var(--adm-border)] bg-[var(--adm-surface)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--adm-blue)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center border border-[var(--adm-border)] bg-[var(--adm-red-light)] text-[var(--adm-red)]">
        <AlertTriangle className="mb-2 h-8 w-8" />
        <p className="font-medium">{error}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--adm-red)" }}>Could not fetch your inbox.</p>
      </div>
    );
  }

  const messages = data?.messages || [];
  const showRightPane = selectedMessage || isComposing;

  function extractEmail(address: any) {
    if (!address) return "Unknown";
    if (Array.isArray(address) && address[0]) {
      return address[0].address || address[0].email || "Unknown";
    }
    return address.address || address.email || "Unknown";
  }

  return (
    <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] overflow-hidden flex flex-col md:flex-row h-[700px]">
      {/* Inbox List */}
      <div className={`md:w-1/3 flex-col border-r border-[var(--adm-border)] ${showRightPane ? "hidden md:flex" : "flex w-full"}`}>
        <div className="flex items-center justify-between border-b px-6 py-4 border-[var(--adm-border)]">
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>Inbox</h3>
            <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>{data?.account?.primaryEmailAddress}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCompose}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-[var(--adm-bg)] transition text-[var(--adm-text-2)]"
              title="Compose"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 divide-y" style={{ borderColor: "var(--adm-border)" }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--adm-text-3)]">
              <Mail className="mb-2 h-8 w-8 opacity-50" />
              <p>Your inbox is empty.</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div 
                key={msg.id} 
                onClick={() => handleSelectMessage(msg)}
                className={`flex flex-col px-6 py-4 transition cursor-pointer ${selectedMessage?.id === msg.id ? 'bg-[var(--adm-bg)] border-l-4 border-l-[var(--adm-blue)]' : 'hover:bg-[var(--adm-bg)]'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate" style={{ color: "var(--adm-text)" }}>{extractEmail(msg.from)}</p>
                  <span className="text-xs shrink-0 ml-2" style={{ color: "var(--adm-text-3)" }}>
                    {new Date(msg.receivedAt || msg.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium truncate" style={{ color: "var(--adm-text-2)" }}>{msg.subject}</p>
                <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--adm-text-3)" }}>{msg.snippet}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area (Message Viewer or Compose) */}
      <div className={`md:w-2/3 flex-col bg-[var(--adm-surface)] ${showRightPane ? "flex w-full" : "hidden md:flex"}`}>
        {isComposing ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-[var(--adm-border)] md:hidden">
              <button 
                onClick={() => setIsComposing(false)}
                className="flex items-center gap-2 text-sm font-medium text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
              >
                <ArrowLeft size={16} /> Back to Inbox
              </button>
            </div>
            <div className="p-6 border-b border-[var(--adm-border)] flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: "var(--adm-text)" }}>New Message</h2>
            </div>
            <form onSubmit={handleSendMessage} className="flex flex-col flex-1">
              <div className="px-6 py-4 border-b border-[var(--adm-border)]">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-semibold w-16 text-[var(--adm-text-3)]">Template:</label>
                  <select
                    className="flex-1 outline-none bg-transparent text-sm"
                    style={{ color: "var(--adm-text)" }}
                    onChange={(e) => {
                      const template = EMAIL_TEMPLATES.find(t => t.id === e.target.value);
                      if (template) {
                        setComposeSubject(template.subject);
                        setComposeBody(template.body);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a template...</option>
                    {EMAIL_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-semibold w-16 text-[var(--adm-text-3)]">To:</label>
                  <input
                    type="email"
                    required
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="flex-1 outline-none bg-transparent"
                    style={{ color: "var(--adm-text)" }}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-semibold w-16 text-[var(--adm-text-3)]">Subject:</label>
                  <input
                    type="text"
                    required
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="flex-1 outline-none bg-transparent font-medium"
                    style={{ color: "var(--adm-text)" }}
                    placeholder="Enter subject"
                  />
                </div>
              </div>
              
              <div className="flex-1 p-6 flex flex-col">
                {sendError && (
                  <div className="mb-4 p-4 bg-[var(--adm-red-light)] text-[var(--adm-red)] border border-[var(--adm-red)]">
                    <p className="font-medium flex items-center gap-2"><AlertTriangle size={16} /> Error sending message</p>
                    <p className="text-sm mt-1">{sendError}</p>
                  </div>
                )}
                <textarea
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="flex-1 outline-none resize-none bg-transparent"
                  style={{ color: "var(--adm-text)" }}
                  placeholder="Write your message here..."
                />
              </div>
              
              <div className="p-6 border-t border-[var(--adm-border)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-6 py-2.5 text-sm font-semibold border border-[var(--adm-border)] text-[var(--adm-text-2)] hover:bg-[var(--adm-surface-2)] transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 text-sm font-semibold bg-[var(--adm-blue)] text-white hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Message
                </button>
              </div>
            </form>
          </div>
        ) : selectedMessage ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-[var(--adm-border)] md:hidden">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="flex items-center gap-2 text-sm font-medium text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
              >
                <ArrowLeft size={16} /> Back to Inbox
              </button>
            </div>
            <div className="p-6 border-b border-[var(--adm-border)]">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--adm-text)" }}>{selectedMessage.subject}</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: "var(--adm-text)" }}>{extractEmail(selectedMessage.from)}</p>
                  <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>To: {extractEmail(selectedMessage.to)}</p>
                </div>
                <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
                  {new Date(selectedMessage.receivedAt || selectedMessage.date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {loadingContent ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--adm-blue)]" />
                </div>
              ) : contentError ? (
                <div className="p-4 bg-[var(--adm-red-light)] text-[var(--adm-red)] border border-[var(--adm-red)]">
                  <p className="font-medium flex items-center gap-2"><AlertTriangle size={16} /> Error loading message</p>
                  <p className="text-sm mt-1">{contentError}</p>
                </div>
              ) : messageContent ? (
                <div
                  className="prose prose-invert max-w-none prose-sm"
                  style={{ color: "var(--adm-text-2)" }}
                  dangerouslySetInnerHTML={{ __html: messageContent }}
                />
              ) : (
                <p className="text-[var(--adm-text-3)]">No content.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--adm-text-3)]">
            <Mail className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
