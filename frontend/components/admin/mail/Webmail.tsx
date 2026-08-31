"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Archive, ChevronDown, Clock, Edit3, Inbox as InboxIcon,
  Loader2, Mail, RefreshCw, Reply, Send, Trash2, Ban, FileText, ArrowUpRight, X,
} from "lucide-react";

import { getStoredToken } from "@/lib/auth-storage";

/**
 * The /api/mail/* routes are authenticated + scoped per user (see lib/mail-auth):
 * a non-admin only ever reaches their own mailbox. So every call must carry the
 * portal session token, exactly like the axios client does for the backend.
 */
function authFetch(input: string, init: RequestInit = {}) {
  const token = getStoredToken();
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

type Mailbox = { id: string; primaryAddress: string };
type Message = Record<string, any>;

type FolderKey = "all" | "inbox" | "sent" | "drafts" | "spam" | "scheduled" | "outbox" | "archive" | "trash";

const FOLDERS: { key: FolderKey; label: string; icon: typeof Mail; match: string[] }[] = [
  { key: "all", label: "All mail", icon: Mail, match: [] },
  { key: "inbox", label: "Inbox", icon: InboxIcon, match: ["inbox"] },
  { key: "sent", label: "Sent", icon: ArrowUpRight, match: ["sent"] },
  { key: "drafts", label: "Drafts", icon: FileText, match: ["draft", "drafts"] },
  { key: "spam", label: "Spam", icon: Ban, match: ["spam", "junk"] },
  { key: "scheduled", label: "Scheduled", icon: Clock, match: ["scheduled", "schedule"] },
  { key: "outbox", label: "Outbox", icon: Send, match: ["outbox", "queued"] },
  { key: "archive", label: "Archive", icon: Archive, match: ["archive", "archived"] },
  { key: "trash", label: "Trash", icon: Trash2, match: ["trash", "deleted"] },
];

function addr(a: any): string {
  if (!a) return "Unknown";
  if (Array.isArray(a)) return a[0] ? addr(a[0]) : "Unknown";
  return a.address || a.email || (typeof a === "string" ? a : "Unknown");
}

function labelNames(msg: Message): string[] {
  const raw = msg.labels ?? msg.label ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((l: any) => (typeof l === "string" ? l : l?.name || l?.label || ""))
    .filter(Boolean)
    .map((s: string) => s.toLowerCase());
}

const KNOWN = new Set(FOLDERS.flatMap((f) => f.match));

function whenOf(msg: Message): string {
  const v = msg.receivedAt || msg.date || msg.createdAt || msg.sentAt;
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export default function Webmail({
  initialTo = "",
  initialSubject = "",
  autoCompose = false,
}: {
  initialTo?: string;
  initialSubject?: string;
  autoCompose?: boolean;
}) {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mbOpen, setMbOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [trash, setTrash] = useState<Message[]>([]);
  const [folder, setFolder] = useState<FolderKey>("inbox");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Message | null>(null);
  const [content, setContent] = useState<{ html: boolean; body: string } | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // Compose / reply state
  const [composing, setComposing] = useState(autoCompose);
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [bodyText, setBodyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const active = mailboxes.find((m) => m.id === activeId) ?? null;

  const loadMailboxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/mail/mailboxes");
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not load mailboxes.");
      setMailboxes(json.mailboxes || []);
      setActiveId((prev) => prev || json.mailboxes?.[0]?.id || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (mailboxId: string, silent = false) => {
    if (!mailboxId) return;
    if (silent) setRefreshing(true);
    setError(null);
    try {
      const [live, expunged] = await Promise.all([
        authFetch(`/api/mail/messages?mailbox=${mailboxId}`).then((r) => r.json()),
        authFetch(`/api/mail/messages?mailbox=${mailboxId}&state=expunged`).then((r) => r.json()),
      ]);
      if (live.error) throw new Error(live.error);
      setMessages(live.messages || []);
      setTrash(expunged.error ? [] : expunged.messages || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMailboxes();
  }, [loadMailboxes]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  async function openMessage(msg: Message) {
    setComposing(false);
    setSelected(msg);
    setContent(null);
    setLoadingContent(true);
    try {
      const res = await authFetch(`/api/mail/message?mailbox=${activeId}&id=${msg.id}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not load the message.");
      setContent({ html: Boolean(json.isHtml), body: json.content });
    } catch (e: any) {
      setContent({ html: false, body: `Error: ${e.message}` });
    } finally {
      setLoadingContent(false);
    }
  }

  function startCompose() {
    setSelected(null);
    setComposing(true);
    setTo("");
    setSubject("");
    setBodyText("");
    setSendError(null);
  }

  function startReply(msg: Message) {
    setComposing(true);
    setTo(addr(msg.from));
    setSubject(/^re:/i.test(msg.subject || "") ? msg.subject : `Re: ${msg.subject || ""}`);
    setBodyText("");
    setSendError(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await authFetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailbox: active.id,
          fromAddress: active.primaryAddress,
          toAddress: to.trim(),
          subject: subject.trim(),
          text: bodyText,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not send the message.");
      setComposing(false);
      setNotice("Message sent.");
      loadMessages(active.id, true);
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(msg: Message) {
    if (!active) return;
    setNotice(null);
    try {
      const res = await authFetch("/api/mail/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailbox: active.id, id: msg.id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not delete the message.");
      if (selected?.id === msg.id) setSelected(null);
      setNotice("Message deleted.");
      loadMessages(active.id, true);
    } catch (e: any) {
      setNotice(`Delete failed — ${e.message}`);
    }
  }

  const counts = useMemo(() => {
    const c: Record<FolderKey, number> = {
      all: messages.length, inbox: 0, sent: 0, drafts: 0, spam: 0,
      scheduled: 0, outbox: 0, archive: 0, trash: trash.length,
    };
    for (const msg of messages) {
      const names = labelNames(msg);
      let matched = false;
      for (const f of FOLDERS) {
        if (f.key === "all" || f.key === "trash") continue;
        if (f.match.some((m) => names.includes(m))) { c[f.key]++; matched = true; }
      }
      if (!matched && !names.some((n) => KNOWN.has(n))) c.inbox++;
    }
    return c;
  }, [messages, trash]);

  const visible = useMemo(() => {
    if (folder === "trash") return trash;
    if (folder === "all") return messages;
    const def = FOLDERS.find((f) => f.key === folder)!;
    return messages.filter((msg) => {
      const names = labelNames(msg);
      if (def.match.some((m) => names.includes(m))) return true;
      if (folder === "inbox" && !names.some((n) => KNOWN.has(n))) return true;
      return false;
    });
  }, [folder, messages, trash]);

  if (loading) {
    return (
      <div className="flex h-[720px] items-center justify-center border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--adm-blue)" }} />
      </div>
    );
  }

  if (error && mailboxes.length === 0) {
    return (
      <div className="flex h-[720px] flex-col items-center justify-center border border-dashed text-center" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)" }}>
        <Mail className="mb-4 h-12 w-12" style={{ color: "var(--adm-red)" }} />
        <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--adm-text)" }}>Could not load your mailbox</h3>
        <p className="mb-2 max-w-md text-sm" style={{ color: "var(--adm-text-2)" }}>{error}</p>
        <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>Confirm OPENEMAIL_API_KEY is set on the server.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[720px] overflow-hidden border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r sm:flex" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}>
        <div className="border-b p-3" style={{ borderColor: "var(--adm-border)" }}>
          <div className="relative">
            <button type="button" onClick={() => setMbOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 border px-3 py-2 text-left text-xs font-medium" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}>
              <span className="truncate">{active?.primaryAddress ?? "No mailbox"}</span>
              <ChevronDown size={13} style={{ color: "var(--adm-text-3)" }} />
            </button>
            {mbOpen && mailboxes.length > 0 && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
                {mailboxes.map((mb) => (
                  <button key={mb.id} type="button" onClick={() => { setActiveId(mb.id); setMbOpen(false); setSelected(null); setFolder("inbox"); }} className="block w-full truncate px-3 py-2 text-left text-xs transition hover:bg-adm-surface-2" style={{ color: mb.id === activeId ? "var(--adm-blue)" : "var(--adm-text-2)", fontWeight: mb.id === activeId ? 600 : 400 }}>
                    {mb.primaryAddress}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={startCompose} className="btn-press mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90" style={{ background: "var(--adm-blue)" }}>
            <Edit3 size={14} /> Compose
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const isActive = folder === f.key;
            return (
              <button key={f.key} type="button" onClick={() => { setFolder(f.key); setSelected(null); setComposing(false); }} className="mb-0.5 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition" style={{ background: isActive ? "var(--adm-blue-light)" : "transparent", color: isActive ? "var(--adm-blue)" : "var(--adm-text-2)", fontWeight: isActive ? 600 : 400 }}>
                <span className="flex items-center gap-2.5"><Icon size={15} />{f.label}</span>
                {counts[f.key] > 0 && <span className="text-xs" style={{ color: isActive ? "var(--adm-blue)" : "var(--adm-text-3)" }}>{counts[f.key]}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col">
        {notice && (
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2 text-xs" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)", color: "var(--adm-text-2)" }}>
            <span>{notice}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)}><X size={13} /></button>
          </div>
        )}
        {composing ? (
          <form onSubmit={handleSend} className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "var(--adm-border)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--adm-text)" }}>New message</h2>
              <button type="button" onClick={() => setComposing(false)} aria-label="Close" style={{ color: "var(--adm-text-3)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3 border-b p-5" style={{ borderColor: "var(--adm-border)" }}>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>From</span>
                <span style={{ color: "var(--adm-text-2)" }}>{active?.primaryAddress}</span>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>To</span>
                <input type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" className="flex-1 bg-transparent outline-none" style={{ color: "var(--adm-text)" }} />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>Subject</span>
                <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="flex-1 bg-transparent font-medium outline-none" style={{ color: "var(--adm-text)" }} />
              </label>
            </div>
            {sendError && (
              <div className="mx-5 mt-4 flex items-start gap-2 border p-3 text-sm" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" /><span>{sendError}</span>
              </div>
            )}
            <textarea required value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Write your message…" className="flex-1 resize-none bg-transparent p-5 text-sm outline-none" style={{ color: "var(--adm-text-2)" }} />
            <div className="flex justify-end gap-3 border-t p-4" style={{ borderColor: "var(--adm-border)" }}>
              <button type="button" onClick={() => setComposing(false)} className="border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}>Discard</button>
              <button type="submit" disabled={sending} className="btn-press flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "var(--adm-blue)" }}>
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}{sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        ) : selected ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--adm-border)" }}>
              <button type="button" onClick={() => setSelected(null)} className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>← Back</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => startReply(selected)} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}><Reply size={13} /> Reply</button>
                <button type="button" onClick={() => handleDelete(selected)} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-red-light" style={{ borderColor: "var(--adm-border)", color: "var(--adm-red)" }}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
            <div className="border-b p-5" style={{ borderColor: "var(--adm-border)" }}>
              <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--adm-text)" }}>{selected.subject || "(No subject)"}</h2>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold" style={{ color: "var(--adm-text)" }}>{addr(selected.from)}</p>
                  <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>To: {addr(selected.to)}</p>
                </div>
                <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>{whenOf(selected)}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {loadingContent ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--adm-blue)" }} /></div>
              ) : content?.html ? (
                <div className="prose prose-sm max-w-none" style={{ color: "var(--adm-text-2)" }} dangerouslySetInnerHTML={{ __html: content.body }} />
              ) : (
                <pre className="whitespace-pre-wrap break-words font-sans text-sm" style={{ color: "var(--adm-text-2)" }}>{content?.body ?? ""}</pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "var(--adm-border)" }}>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--adm-text)" }}>{FOLDERS.find((f) => f.key === folder)?.label}</h2>
              <button type="button" onClick={() => loadMessages(activeId, true)} aria-label="Refresh" className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-surface-2" style={{ color: "var(--adm-text-3)" }}>
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="flex-1 divide-y overflow-y-auto" style={{ borderColor: "var(--adm-border)" }}>
              {visible.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-20" style={{ color: "var(--adm-text-3)" }}>
                  <Mail className="mb-3 h-10 w-10 opacity-30" /><p className="text-sm">No messages in {FOLDERS.find((f) => f.key === folder)?.label}.</p>
                </div>
              ) : (
                visible.map((msg) => (
                  <div key={msg.id} className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-adm-surface-2" onClick={() => openMessage(msg)}>
                    <div className="w-48 shrink-0 truncate text-sm font-semibold" style={{ color: "var(--adm-text)" }}>{addr(msg.from)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--adm-text)" }}>{msg.subject || "(No subject)"}</p>
                      <p className="truncate text-xs" style={{ color: "var(--adm-text-3)" }}>{msg.snippet || msg.preview || ""}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: "var(--adm-text-3)" }}>{whenOf(msg)}</span>
                    {folder !== "trash" && (
                      <button type="button" aria-label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(msg); }} className="shrink-0 opacity-0 transition group-hover:opacity-100" style={{ color: "var(--adm-text-3)" }}><Trash2 size={15} /></button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

