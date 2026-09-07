"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, Archive, ArrowUpRight, Ban, CalendarClock, CheckCircle2, CheckSquare,
  ChevronDown, Clock, Download, Edit3, FileText, Forward, Inbox as InboxIcon, Loader2, Mail,
  MailOpen, Paperclip, RefreshCw, Reply, ReplyAll, Search, Send, Square, Star, Trash2, X, XCircle,
} from "lucide-react";

import { getStoredToken } from "@/lib/auth-storage";
import { apiRequest } from "@/lib/api-client";

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
type Attachment = Record<string, any>;
type ComposeMode = "new" | "reply" | "replyAll" | "forward";

/** A locally-saved draft. open.email exposes no draft-write API through our key,
 *  so drafts live in the browser, keyed per mailbox — see the storage note below. */
type Draft = {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  savedAt: number;
};

/** A server-side scheduled message (backend /mail/scheduled, camelCase JSON). */
type ScheduledMail = {
  id: string;
  fromAddress: string;
  to: string[];
  subject: string;
  text?: string | null;
  sendAt: string;
  status: "pending" | "sent" | "failed" | "canceled";
  attempts: number;
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
};

type FolderKey =
  | "all" | "inbox" | "starred" | "sent" | "drafts" | "spam"
  | "scheduled" | "outbox" | "archive" | "trash";

const FOLDERS: { key: FolderKey; label: string; icon: typeof Mail; match: string[] }[] = [
  { key: "all", label: "All mail", icon: Mail, match: [] },
  { key: "inbox", label: "Inbox", icon: InboxIcon, match: ["inbox"] },
  { key: "starred", label: "Starred", icon: Star, match: [] },
  { key: "sent", label: "Sent", icon: ArrowUpRight, match: ["sent"] },
  { key: "drafts", label: "Drafts", icon: FileText, match: ["draft", "drafts"] },
  { key: "spam", label: "Spam", icon: Ban, match: ["spam", "junk"] },
  { key: "scheduled", label: "Scheduled", icon: Clock, match: ["scheduled", "schedule"] },
  { key: "outbox", label: "Outbox", icon: Send, match: ["outbox", "queued"] },
  { key: "archive", label: "Archive", icon: Archive, match: ["archive", "archived"] },
  { key: "trash", label: "Trash", icon: Trash2, match: ["trash", "deleted"] },
];

const KNOWN = new Set(FOLDERS.flatMap((f) => f.match));

function idOf(msg: Message): string {
  return String(msg.id ?? msg.messageId ?? msg.uid ?? "");
}

function addr(a: any): string {
  if (!a) return "Unknown";
  if (Array.isArray(a)) return a[0] ? addr(a[0]) : "Unknown";
  return a.address || a.email || (typeof a === "string" ? a : "Unknown");
}

/** Every address on a header field (to/cc), flattened to plain email strings. */
function addrList(v: any): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .map((a: any) => (typeof a === "string" ? a : a?.address || a?.email || ""))
    .map((s: string) => s.trim())
    .filter(Boolean);
}

function labelNames(msg: Message): string[] {
  const raw = msg.labels ?? msg.label ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((l: any) => (typeof l === "string" ? l : l?.name || l?.label || ""))
    .filter(Boolean)
    .map((s: string) => s.toLowerCase());
}

/**
 * Normalise whatever open.email puts on a message into a Date. The API returns a
 * unix timestamp in *seconds* (~1.7e9); handing that straight to `new Date()`,
 * which expects milliseconds, is what pinned every message to "21/01/1970". ISO
 * strings and millisecond epochs pass through untouched.
 */
function parseWhen(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    const d = new Date(v < 1e12 ? v * 1000 : v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    if (/^\d+$/.test(v.trim())) {
      const n = Number(v);
      const d = new Date(n < 1e12 ? n * 1000 : n);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function whenRaw(msg: Message): unknown {
  return msg.receivedAt || msg.date || msg.createdAt || msg.sentAt || msg.timestamp || msg.time;
}

function whenOf(msg: Message): string {
  const d = parseWhen(whenRaw(msg));
  if (!d) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString();
}

/** True when the message carries a server-side "unread" signal, if it exposes one. */
function serverUnread(msg: Message): boolean {
  if (msg.seen === false || msg.read === false || msg.isRead === false) return true;
  if (msg.unread === true || msg.isUnread === true) return true;
  return labelNames(msg).includes("unread");
}

/** Format a Date as the value an <input type="datetime-local"> expects (local time). */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function htmlToText(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "");
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || el.innerText || "").trim();
}

function quoteOriginal(msg: Message, body: string): string {
  const quoted = body.split("\n").map((l) => `> ${l}`).join("\n");
  return `\n\nOn ${whenOf(msg)}, ${addr(msg.from)} wrote:\n${quoted}\n`;
}

function forwardOriginal(msg: Message, body: string): string {
  return [
    "\n\n---------- Forwarded message ----------",
    `From: ${addr(msg.from)}`,
    `Date: ${whenOf(msg)}`,
    `Subject: ${msg.subject || "(No subject)"}`,
    `To: ${addrList(msg.to).join(", ") || "—"}`,
    "",
    body,
  ].join("\n");
}

function formatBytes(n: unknown): string {
  const bytes = typeof n === "number" ? n : Number(n);
  if (!bytes || isNaN(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/**
 * Read/unread, stars and drafts are persisted in the browser, keyed per mailbox.
 * open.email's org-wide key (see lib/mail-auth) does not expose verified
 * flag/label/draft *write* endpoints, so rather than guess an API and risk
 * corrupting a shared mailbox we track these locally — they survive reloads and
 * stay per-account. Server "unread" signals, when a message carries one, are
 * still honoured for the initial state (see serverUnread).
 */
function mailKey(mailboxId: string, suffix: string): string {
  return `tmi_mail:${mailboxId}:${suffix}`;
}
function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function saveSet(key: string, set: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* storage full or blocked — non-fatal */
  }
}
function loadDrafts(key: string): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft[]) : [];
  } catch {
    return [];
  }
}
function saveDrafts(key: string, drafts: Draft[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(drafts));
  } catch {
    /* non-fatal */
  }
}
function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseAddrs(raw: string): string[] {
  return raw.split(/[,;]/).map((v) => v.trim()).filter(Boolean);
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
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [folder, setFolder] = useState<FolderKey>("inbox");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Message | null>(null);
  const [content, setContent] = useState<{ html: boolean; body: string } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Compose / reply state
  const [composing, setComposing] = useState(autoCompose);
  const [composeMode, setComposeMode] = useState<ComposeMode>("new");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [bodyText, setBodyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Server-side scheduled send — delivers even if this device is offline.
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduledMail, setScheduledMail] = useState<ScheduledMail[]>([]);

  // Client-persisted view state (see mailKey note).
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Search, selection, keyboard cursor.
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cursorIndex, setCursorIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

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
      setCursor(live.nextCursor ?? null);
      setTrash(expunged.error ? [] : expunged.messages || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!activeId || !cursor) return;
    setLoadingMore(true);
    try {
      const res = await authFetch(
        `/api/mail/messages?mailbox=${activeId}&cursor=${encodeURIComponent(cursor)}`,
      ).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setMessages((prev) => {
        const seen = new Set(prev.map(idOf));
        const extra = (res.messages || []).filter((m: Message) => !seen.has(idOf(m)));
        return [...prev, ...extra];
      });
      setCursor(res.nextCursor ?? null);
    } catch (e: any) {
      setNotice(`Could not load more — ${e.message}`);
    } finally {
      setLoadingMore(false);
    }
  }, [activeId, cursor]);

  const loadScheduled = useCallback(async () => {
    try {
      const res = await apiRequest<{ data: ScheduledMail[] }>({ url: "/mail/scheduled", method: "GET" });
      setScheduledMail(res.data ?? []);
    } catch {
      // Non-fatal: the Scheduled folder simply shows empty if the list can't load.
    }
  }, []);

  useEffect(() => {
    loadMailboxes();
    loadScheduled();
  }, [loadMailboxes, loadScheduled]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  // Hydrate per-mailbox view state whenever the active mailbox changes.
  useEffect(() => {
    if (!activeId) return;
    setReadIds(loadSet(mailKey(activeId, "read")));
    setUnreadIds(loadSet(mailKey(activeId, "unread")));
    setStarredIds(loadSet(mailKey(activeId, "star")));
    setDrafts(loadDrafts(mailKey(activeId, "drafts")));
  }, [activeId]);

  const isUnread = useCallback(
    (msg: Message) => {
      const id = idOf(msg);
      if (unreadIds.has(id)) return true;
      if (readIds.has(id)) return false;
      return serverUnread(msg);
    },
    [readIds, unreadIds],
  );

  const markRead = useCallback(
    (ids: string[], read: boolean) => {
      if (!activeId || ids.length === 0) return;
      setReadIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (read ? next.add(id) : next.delete(id)));
        saveSet(mailKey(activeId, "read"), next);
        return next;
      });
      setUnreadIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (read ? next.delete(id) : next.add(id)));
        saveSet(mailKey(activeId, "unread"), next);
        return next;
      });
    },
    [activeId],
  );

  const toggleStar = useCallback(
    (ids: string[], value?: boolean) => {
      if (!activeId || ids.length === 0) return;
      setStarredIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => {
          const on = value === undefined ? !next.has(id) : value;
          if (on) next.add(id);
          else next.delete(id);
        });
        saveSet(mailKey(activeId, "star"), next);
        return next;
      });
    },
    [activeId],
  );

  const dropDraft = useCallback(
    (id: string | null) => {
      if (!id || !activeId) return;
      setDrafts((prev) => {
        const next = prev.filter((d) => d.id !== id);
        saveDrafts(mailKey(activeId, "drafts"), next);
        return next;
      });
    },
    [activeId],
  );

  // Autosave the open composer to a draft (debounced) so nothing is lost on close.
  useEffect(() => {
    if (!composing || !activeId) return;
    if (!(to.trim() || cc.trim() || bcc.trim() || subject.trim() || bodyText.trim())) return;
    const handle = setTimeout(() => {
      setDraftId((currentId) => {
        const id = currentId ?? newId();
        setDrafts((prev) => {
          const draft: Draft = { id, to, cc, bcc, subject, body: bodyText, savedAt: Date.now() };
          const next = [draft, ...prev.filter((d) => d.id !== id)];
          saveDrafts(mailKey(activeId, "drafts"), next);
          return next;
        });
        return id;
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [composing, to, cc, bcc, subject, bodyText, activeId]);

  async function openMessage(msg: Message) {
    setComposing(false);
    setSelected(msg);
    setContent(null);
    setAttachments([]);
    setLoadingContent(true);
    markRead([idOf(msg)], true);
    try {
      const res = await authFetch(`/api/mail/message?mailbox=${activeId}&id=${idOf(msg)}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not load the message.");
      setContent({ html: Boolean(json.isHtml), body: json.content });
      setAttachments(Array.isArray(json.attachments) ? json.attachments : []);
    } catch (e: any) {
      setContent({ html: false, body: `Error: ${e.message}` });
    } finally {
      setLoadingContent(false);
    }
  }

  function startCompose() {
    setSelected(null);
    setComposing(true);
    setComposeMode("new");
    setDraftId(null);
    setTo("");
    setCc("");
    setBcc("");
    setShowCc(false);
    setSubject("");
    setBodyText("");
    setScheduledAt("");
    setSendError(null);
  }

  function startReply(msg: Message, mode: ComposeMode) {
    const self = active?.primaryAddress?.toLowerCase() ?? "";
    const fromAddr = addr(msg.from);
    const body = content ? (content.html ? htmlToText(content.body) : content.body) : "";
    setSelected(msg);
    setComposeMode(mode);
    setComposing(true);
    setDraftId(null);
    setScheduledAt("");
    setSendError(null);

    if (mode === "forward") {
      setTo("");
      setCc("");
      setBcc("");
      setShowCc(false);
      setSubject(/^fwd:/i.test(msg.subject || "") ? msg.subject : `Fwd: ${msg.subject || ""}`);
      setBodyText(forwardOriginal(msg, body));
      return;
    }

    const others =
      mode === "replyAll"
        ? [...addrList(msg.to), ...addrList(msg.cc)].filter(
            (a) => a.toLowerCase() !== self && a.toLowerCase() !== fromAddr.toLowerCase(),
          )
        : [];
    setTo(fromAddr);
    setCc([...new Set(others)].join(", "));
    setBcc("");
    setShowCc(mode === "replyAll" && others.length > 0);
    setSubject(/^re:/i.test(msg.subject || "") ? msg.subject : `Re: ${msg.subject || ""}`);
    setBodyText(quoteOriginal(msg, body));
  }

  function openDraft(d: Draft) {
    setSelected(null);
    setComposing(true);
    setComposeMode("new");
    setDraftId(d.id);
    setTo(d.to);
    setCc(d.cc);
    setBcc(d.bcc);
    setShowCc(Boolean(d.cc || d.bcc));
    setSubject(d.subject);
    setBodyText(d.body);
    setScheduledAt("");
    setSendError(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    const toArr = parseAddrs(to);
    if (toArr.length === 0) {
      setSendError("Add at least one recipient.");
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const res = await authFetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailbox: active.id,
          fromAddress: active.primaryAddress,
          to: toArr,
          cc: parseAddrs(cc),
          bcc: parseAddrs(bcc),
          subject: subject.trim(),
          text: bodyText,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not send the message.");
      dropDraft(draftId);
      setComposing(false);
      setNotice("Message sent.");
      loadMessages(active.id, true);
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleSchedule() {
    if (!active) return;
    // Cc/Bcc fold into the recipient list for scheduled sends (the queue stores a
    // single recipient list); interactive send keeps true Cc/Bcc semantics.
    const recipients = [...parseAddrs(to), ...parseAddrs(cc), ...parseAddrs(bcc)];
    if (recipients.length === 0 || !subject.trim() || !bodyText.trim()) {
      setSendError("Add a recipient, subject, and message before scheduling.");
      return;
    }
    const when = new Date(scheduledAt);
    if (!scheduledAt || isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      setSendError("Pick a date and time in the future to schedule this message.");
      return;
    }
    setScheduling(true);
    setSendError(null);
    try {
      // Hits the backend queue (not open.email directly): the row is persisted
      // server-side and a cron delivers it, so it sends even if this device is off.
      await apiRequest({
        url: "/mail/scheduled",
        method: "POST",
        data: {
          to: recipients,
          subject: subject.trim(),
          text: bodyText,
          sendAt: when.toISOString(),
          mailboxId: active.id,
          fromAddress: active.primaryAddress,
        },
      });
      dropDraft(draftId);
      setComposing(false);
      setScheduledAt("");
      setNotice(`Message scheduled for ${when.toLocaleString()}.`);
      await loadScheduled();
      setFolder("scheduled");
    } catch (err: any) {
      setSendError(err?.message || "Could not schedule the message.");
    } finally {
      setScheduling(false);
    }
  }

  async function cancelScheduled(id: string) {
    setNotice(null);
    try {
      await apiRequest({ url: `/mail/scheduled/${id}`, method: "DELETE" });
      setNotice("Scheduled message canceled.");
      await loadScheduled();
    } catch (e: any) {
      setNotice(`Cancel failed — ${e?.message || "unknown error"}`);
    }
  }

  async function requestDelete(msg: Message) {
    const res = await authFetch("/api/mail/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mailbox: active!.id, id: idOf(msg) }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Could not delete the message.");
  }

  async function handleDelete(msg: Message) {
    if (!active) return;
    setNotice(null);
    try {
      await requestDelete(msg);
      if (selected && idOf(selected) === idOf(msg)) setSelected(null);
      setNotice("Message deleted.");
      loadMessages(active.id, true);
    } catch (e: any) {
      setNotice(`Delete failed — ${e.message}`);
    }
  }

  async function bulkDelete() {
    if (!active) return;
    const ids = [...selectedIds];
    const targets = [...messages, ...trash].filter((m) => ids.includes(idOf(m)));
    setNotice(null);
    try {
      for (const m of targets) await requestDelete(m);
      setNotice(`${targets.length} message(s) deleted.`);
    } catch (e: any) {
      setNotice(`Delete failed — ${e.message}`);
    }
    if (selected && ids.includes(idOf(selected))) setSelected(null);
    setSelectedIds(new Set());
    loadMessages(active.id, true);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function switchFolder(key: FolderKey) {
    setFolder(key);
    setSelected(null);
    setComposing(false);
    setSelectedIds(new Set());
    setCursorIndex(0);
  }

  function switchMailbox(id: string) {
    setActiveId(id);
    setMbOpen(false);
    setSelected(null);
    setFolder("inbox");
    setSelectedIds(new Set());
    setQuery("");
    setCursor(null);
  }

  const counts = useMemo(() => {
    const c: Record<FolderKey, number> = {
      all: 0, inbox: 0, starred: 0, sent: 0, drafts: 0, spam: 0,
      scheduled: 0, outbox: 0, archive: 0, trash: 0,
    };
    for (const msg of messages) {
      const names = labelNames(msg);
      if (!isUnread(msg)) continue;
      c.all++;
      let matched = false;
      for (const f of FOLDERS) {
        if (["all", "trash", "starred", "drafts", "scheduled"].includes(f.key)) continue;
        if (f.match.some((m) => names.includes(m))) {
          c[f.key]++;
          matched = true;
        }
      }
      if (!matched && !names.some((n) => KNOWN.has(n))) c.inbox++;
    }
    c.starred = starredIds.size;
    c.drafts = drafts.length;
    c.scheduled = scheduledMail.filter((s) => s.status === "pending").length;
    c.trash = trash.length;
    return c;
  }, [messages, trash, scheduledMail, starredIds, drafts, isUnread]);

  const visible = useMemo(() => {
    let list: Message[];
    if (folder === "trash") list = trash;
    else if (folder === "all") list = messages;
    else if (folder === "starred") list = [...messages, ...trash].filter((m) => starredIds.has(idOf(m)));
    else {
      const def = FOLDERS.find((f) => f.key === folder)!;
      list = messages.filter((msg) => {
        const names = labelNames(msg);
        if (def.match.some((m) => names.includes(m))) return true;
        if (folder === "inbox" && !names.some((n) => KNOWN.has(n))) return true;
        return false;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const hay = [addr(m.from), m.subject, m.snippet || m.preview, addrList(m.to).join(" ")]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [folder, messages, trash, starredIds, query]);

  useEffect(() => {
    setCursorIndex((i) => Math.min(i, Math.max(visible.length - 1, 0)));
  }, [visible.length]);

  // Keyboard shortcuts (Gmail-style). Text fields only see Esc and Cmd/Ctrl+Enter.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      if (e.key === "Escape") {
        if (composing) setComposing(false);
        else if (selected) setSelected(null);
        else if (query) setQuery("");
        else if (selectedIds.size) setSelectedIds(new Set());
        return;
      }
      if (typing) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && composing) {
          document.getElementById("mail-send-btn")?.dispatchEvent(
            new MouseEvent("click", { bubbles: true }),
          );
        }
        return;
      }
      if (composing) return;

      if (e.key === "c") {
        e.preventDefault();
        startCompose();
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (selected) {
        if (e.key === "r") { e.preventDefault(); startReply(selected, "reply"); }
        else if (e.key === "a") { e.preventDefault(); startReply(selected, "replyAll"); }
        else if (e.key === "f") { e.preventDefault(); startReply(selected, "forward"); }
        else if (e.key === "s") { e.preventDefault(); toggleStar([idOf(selected)]); }
        else if (e.key === "#" || e.key === "Delete") { e.preventDefault(); handleDelete(selected); }
        return;
      }
      if (folder === "scheduled" || folder === "drafts") return;

      if (e.key === "j") {
        e.preventDefault();
        setCursorIndex((i) => Math.min(i + 1, Math.max(visible.length - 1, 0)));
      } else if (e.key === "k") {
        e.preventDefault();
        setCursorIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const m = visible[cursorIndex];
        if (m) openMessage(m);
      } else if (e.key === "s") {
        const m = visible[cursorIndex];
        if (m) toggleStar([idOf(m)]);
      } else if (e.key === "x") {
        const m = visible[cursorIndex];
        if (m) toggleSelect(idOf(m));
      } else if (e.key === "#" || e.key === "Delete") {
        const m = visible[cursorIndex];
        if (m && folder !== "trash") handleDelete(m);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composing, selected, query, selectedIds, visible, cursorIndex, folder, content, active, toggleStar]);

  const allSelected = visible.length > 0 && visible.every((m) => selectedIds.has(idOf(m)));
  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (visible.every((m) => prev.has(idOf(m)))) return new Set();
      return new Set(visible.map(idOf));
    });
  }

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

  const composeTitle =
    composeMode === "reply" ? "Reply"
    : composeMode === "replyAll" ? "Reply all"
    : composeMode === "forward" ? "Forward"
    : "New message";

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
              <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-full overflow-y-auto border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
                {mailboxes.map((mb) => (
                  <button key={mb.id} type="button" onClick={() => switchMailbox(mb.id)} className="block w-full truncate px-3 py-2 text-left text-xs transition hover:bg-adm-surface-2" style={{ color: mb.id === activeId ? "var(--adm-blue)" : "var(--adm-text-2)", fontWeight: mb.id === activeId ? 600 : 400 }}>
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
            const showBold = f.key === "inbox" || f.key === "spam" || f.key === "all";
            return (
              <button key={f.key} type="button" onClick={() => switchFolder(f.key)} className="mb-0.5 flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition" style={{ background: isActive ? "var(--adm-blue-light)" : "transparent", color: isActive ? "var(--adm-blue)" : "var(--adm-text-2)", fontWeight: isActive ? 600 : 400 }}>
                <span className="flex items-center gap-2.5"><Icon size={15} />{f.label}</span>
                {counts[f.key] > 0 && (
                  <span className="text-xs" style={{ color: isActive ? "var(--adm-blue)" : "var(--adm-text-3)", fontWeight: showBold ? 700 : 400 }}>{counts[f.key]}</span>
                )}
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
              <h2 className="text-base font-bold" style={{ color: "var(--adm-text)" }}>{composeTitle}</h2>
              <button type="button" onClick={() => setComposing(false)} aria-label="Close" style={{ color: "var(--adm-text-3)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3 border-b p-5" style={{ borderColor: "var(--adm-border)" }}>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>From</span>
                <span style={{ color: "var(--adm-text-2)" }}>{active?.primaryAddress}</span>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>To</span>
                <input type="text" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com, another@example.com" className="flex-1 bg-transparent outline-none" style={{ color: "var(--adm-text)" }} />
                {!showCc && (
                  <button type="button" onClick={() => setShowCc(true)} className="shrink-0 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-blue)" }}>Cc/Bcc</button>
                )}
              </label>
              {showCc && (
                <>
                  <label className="flex items-center gap-3 text-sm">
                    <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>Cc</span>
                    <input type="text" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com" className="flex-1 bg-transparent outline-none" style={{ color: "var(--adm-text)" }} />
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <span className="w-16 font-semibold" style={{ color: "var(--adm-text-3)" }}>Bcc</span>
                    <input type="text" value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="bcc@example.com" className="flex-1 bg-transparent outline-none" style={{ color: "var(--adm-text)" }} />
                  </label>
                </>
              )}
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4" style={{ borderColor: "var(--adm-border)" }}>
              <label className="flex items-center gap-2 text-xs" style={{ color: "var(--adm-text-3)" }} title="Schedule this message to send later — it delivers from the server even if your laptop is off">
                <CalendarClock size={14} />
                <span className="font-semibold uppercase tracking-wider">Schedule</span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={toLocalInputValue(new Date())}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="border bg-transparent px-2 py-1 text-xs outline-none"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                />
                {scheduledAt && (
                  <button type="button" onClick={() => setScheduledAt("")} aria-label="Clear schedule" className="transition hover:opacity-70"><X size={13} /></button>
                )}
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => { dropDraft(draftId); setComposing(false); }} className="border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}>Discard</button>
                {scheduledAt ? (
                  <button type="button" onClick={handleSchedule} disabled={scheduling} className="btn-press flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "var(--adm-blue)" }}>
                    {scheduling ? <Loader2 size={14} className="animate-spin" /> : <CalendarClock size={14} />}{scheduling ? "Scheduling…" : "Schedule send"}
                  </button>
                ) : (
                  <button id="mail-send-btn" type="submit" disabled={sending} className="btn-press flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 disabled:opacity-50" style={{ background: "var(--adm-blue)" }}>
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}{sending ? "Sending…" : "Send"}
                  </button>
                )}
              </div>
            </div>
          </form>
        ) : selected ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--adm-border)" }}>
              <button type="button" onClick={() => setSelected(null)} className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>← Back</button>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => toggleStar([idOf(selected)])} title="Star (s)" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: starredIds.has(idOf(selected)) ? "#f5a623" : "var(--adm-text-2)" }}>
                  <Star size={13} fill={starredIds.has(idOf(selected)) ? "#f5a623" : "none"} /> Star
                </button>
                <button type="button" onClick={() => { markRead([idOf(selected)], false); setSelected(null); }} title="Mark unread" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}><Mail size={13} /> Unread</button>
                <button type="button" onClick={() => startReply(selected, "reply")} title="Reply (r)" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}><Reply size={13} /> Reply</button>
                <button type="button" onClick={() => startReply(selected, "replyAll")} title="Reply all (a)" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}><ReplyAll size={13} /> Reply all</button>
                <button type="button" onClick={() => startReply(selected, "forward")} title="Forward (f)" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}><Forward size={13} /> Forward</button>
                <button type="button" onClick={() => handleDelete(selected)} title="Delete (#)" className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-red-light" style={{ borderColor: "var(--adm-border)", color: "var(--adm-red)" }}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
            <div className="border-b p-5" style={{ borderColor: "var(--adm-border)" }}>
              <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--adm-text)" }}>{selected.subject || "(No subject)"}</h2>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold" style={{ color: "var(--adm-text)" }}>{addr(selected.from)}</p>
                  <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>To: {addrList(selected.to).join(", ") || "—"}</p>
                  {addrList(selected.cc).length > 0 && (
                    <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>Cc: {addrList(selected.cc).join(", ")}</p>
                  )}
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
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t p-4" style={{ borderColor: "var(--adm-border)" }}>
                {attachments.map((att, i) => {
                  const name = att.filename || att.name || `Attachment ${i + 1}`;
                  const size = formatBytes(att.size);
                  const href = typeof att.url === "string" && /^https?:\/\//i.test(att.url) ? att.url : null;
                  const inner = (
                    <>
                      <Paperclip size={13} style={{ color: "var(--adm-text-3)" }} />
                      <span className="max-w-[220px] truncate" style={{ color: "var(--adm-text)" }}>{name}</span>
                      {size && <span style={{ color: "var(--adm-text-3)" }}>· {size}</span>}
                      {href && <Download size={13} style={{ color: "var(--adm-blue)" }} />}
                    </>
                  );
                  return href ? (
                    <a key={i} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 border px-3 py-1.5 text-xs transition hover:bg-adm-surface-2" style={{ borderColor: "var(--adm-border)" }}>{inner}</a>
                  ) : (
                    <div key={i} className="flex items-center gap-1.5 border px-3 py-1.5 text-xs" style={{ borderColor: "var(--adm-border)" }} title="Preview only">{inner}</div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--adm-border)" }}>
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--adm-text)" }}>{FOLDERS.find((f) => f.key === folder)?.label}</h2>
              <div className="flex items-center gap-2">
                {folder !== "scheduled" && folder !== "drafts" && (
                  <div className="relative hidden md:block">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--adm-text-3)" }} />
                    <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search  (press /)" className="w-52 border bg-transparent py-1.5 pl-8 pr-2 text-xs outline-none" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }} />
                    {query && (
                      <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "var(--adm-text-3)" }} /></button>
                    )}
                  </div>
                )}
                <button type="button" onClick={() => (folder === "scheduled" ? loadScheduled() : loadMessages(activeId, true))} aria-label="Refresh" className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-surface-2" style={{ color: "var(--adm-text-3)" }}>
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Bulk-action bar */}
            {folder !== "scheduled" && folder !== "drafts" && selectedIds.size > 0 && (
              <div className="flex items-center gap-3 border-b px-5 py-2 text-xs" style={{ borderColor: "var(--adm-border)", background: "var(--adm-blue-light)" }}>
                <span className="font-semibold" style={{ color: "var(--adm-blue)" }}>{selectedIds.size} selected</span>
                <button type="button" onClick={() => { markRead([...selectedIds], true); setSelectedIds(new Set()); }} className="flex items-center gap-1 font-semibold transition hover:opacity-70" style={{ color: "var(--adm-text-2)" }}><MailOpen size={13} /> Read</button>
                <button type="button" onClick={() => { markRead([...selectedIds], false); setSelectedIds(new Set()); }} className="flex items-center gap-1 font-semibold transition hover:opacity-70" style={{ color: "var(--adm-text-2)" }}><Mail size={13} /> Unread</button>
                <button type="button" onClick={() => { toggleStar([...selectedIds], true); setSelectedIds(new Set()); }} className="flex items-center gap-1 font-semibold transition hover:opacity-70" style={{ color: "var(--adm-text-2)" }}><Star size={13} /> Star</button>
                <button type="button" onClick={bulkDelete} className="flex items-center gap-1 font-semibold transition hover:opacity-70" style={{ color: "var(--adm-red)" }}><Trash2 size={13} /> Delete</button>
                <button type="button" onClick={() => setSelectedIds(new Set())} className="ml-auto font-semibold transition hover:opacity-70" style={{ color: "var(--adm-text-3)" }}>Clear</button>
              </div>
            )}

            {folder === "scheduled" ? (
              <div className="flex-1 divide-y overflow-y-auto" style={{ borderColor: "var(--adm-border)" }}>
                {scheduledMail.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-20" style={{ color: "var(--adm-text-3)" }}>
                    <Clock className="mb-3 h-10 w-10 opacity-30" /><p className="text-sm">No scheduled messages.</p>
                    <p className="mt-1 text-xs">Compose a message and pick a “Schedule” time to queue one.</p>
                  </div>
                ) : (
                  scheduledMail.map((s) => {
                    const when = parseWhen(s.sendAt);
                    const meta =
                      s.status === "pending" ? { Icon: Clock, color: "var(--adm-blue)", label: "Scheduled" }
                      : s.status === "sent" ? { Icon: CheckCircle2, color: "var(--adm-blue)", label: "Sent" }
                      : s.status === "canceled" ? { Icon: Ban, color: "var(--adm-text-3)", label: "Canceled" }
                      : { Icon: XCircle, color: "var(--adm-red)", label: "Failed" };
                    const B = meta.Icon;
                    return (
                      <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="w-48 shrink-0 truncate text-sm font-semibold" style={{ color: "var(--adm-text)" }}>{s.to.join(", ")}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" style={{ color: "var(--adm-text)" }}>{s.subject || "(No subject)"}</p>
                          <p className="flex items-center gap-1.5 truncate text-xs" style={{ color: meta.color }}>
                            <B size={12} />{meta.label}{when ? ` · ${when.toLocaleString()}` : ""}{s.status === "failed" && s.error ? ` — ${s.error}` : ""}
                          </p>
                        </div>
                        {s.status === "pending" && (
                          <button type="button" onClick={() => cancelScheduled(s.id)} className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-red-light" style={{ borderColor: "var(--adm-border)", color: "var(--adm-red)" }}>Cancel</button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : folder === "drafts" ? (
              <div className="flex-1 divide-y overflow-y-auto" style={{ borderColor: "var(--adm-border)" }}>
                {drafts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-20" style={{ color: "var(--adm-text-3)" }}>
                    <FileText className="mb-3 h-10 w-10 opacity-30" /><p className="text-sm">No drafts.</p>
                    <p className="mt-1 text-xs">Anything you start writing is saved here automatically.</p>
                  </div>
                ) : (
                  drafts.map((d) => (
                    <div key={d.id} className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-adm-surface-2" onClick={() => openDraft(d)}>
                      <div className="w-48 shrink-0 truncate text-sm font-semibold" style={{ color: "var(--adm-text)" }}>{d.to || "(No recipient)"}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" style={{ color: "var(--adm-text)" }}>{d.subject || "(No subject)"}</p>
                        <p className="truncate text-xs" style={{ color: "var(--adm-text-3)" }}>{d.body.slice(0, 120) || "Empty draft"}</p>
                      </div>
                      <span className="shrink-0 text-xs" style={{ color: "var(--adm-text-3)" }}>{new Date(d.savedAt).toLocaleDateString()}</span>
                      <button type="button" aria-label="Delete draft" onClick={(e) => { e.stopPropagation(); dropDraft(d.id); }} className="shrink-0 opacity-0 transition group-hover:opacity-100" style={{ color: "var(--adm-text-3)" }}><Trash2 size={15} /></button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-y-auto">
                {visible.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-20" style={{ color: "var(--adm-text-3)" }}>
                    <Mail className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">{query ? `No results for “${query}”.` : `No messages in ${FOLDERS.find((f) => f.key === folder)?.label}.`}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 border-b px-5 py-2" style={{ borderColor: "var(--adm-border)" }}>
                      <button type="button" onClick={toggleSelectAll} aria-label="Select all" style={{ color: allSelected ? "var(--adm-blue)" : "var(--adm-text-3)" }}>
                        {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                      <span className="text-xs" style={{ color: "var(--adm-text-3)" }}>{visible.length} message{visible.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
                      {visible.map((msg, index) => {
                        const id = idOf(msg);
                        const unread = isUnread(msg);
                        const isChecked = selectedIds.has(id);
                        const isCursor = index === cursorIndex;
                        const starred = starredIds.has(id);
                        return (
                          <div
                            key={id || index}
                            className="group flex cursor-pointer items-center gap-3 px-5 py-3.5 transition hover:bg-adm-surface-2"
                            style={{ background: isCursor ? "var(--adm-surface-2)" : unread ? "var(--adm-blue-light)" : "transparent" }}
                            onClick={() => openMessage(msg)}
                          >
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleSelect(id); }} aria-label={isChecked ? "Deselect" : "Select"} style={{ color: isChecked ? "var(--adm-blue)" : "var(--adm-text-3)" }} className={isChecked ? "" : "opacity-0 transition group-hover:opacity-100"}>
                              {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleStar([id]); }} aria-label={starred ? "Unstar" : "Star"} className="shrink-0" style={{ color: starred ? "#f5a623" : "var(--adm-text-3)" }}>
                              <Star size={15} fill={starred ? "#f5a623" : "none"} />
                            </button>
                            {unread && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--adm-blue)" }} />}
                            <div className="w-44 shrink-0 truncate text-sm" style={{ color: "var(--adm-text)", fontWeight: unread ? 700 : 500 }}>{addr(msg.from)}</div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm" style={{ color: "var(--adm-text)", fontWeight: unread ? 700 : 500 }}>{msg.subject || "(No subject)"}</p>
                              <p className="truncate text-xs" style={{ color: "var(--adm-text-3)" }}>{msg.snippet || msg.preview || ""}</p>
                            </div>
                            <span className="shrink-0 text-xs" style={{ color: "var(--adm-text-3)", fontWeight: unread ? 600 : 400 }}>{whenOf(msg)}</span>
                            {folder !== "trash" && (
                              <button type="button" aria-label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(msg); }} className="shrink-0 opacity-0 transition group-hover:opacity-100" style={{ color: "var(--adm-text-3)" }}><Trash2 size={15} /></button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {folder !== "trash" && folder !== "starred" && cursor && !query && (
                      <div className="flex justify-center p-4">
                        <button type="button" onClick={loadMore} disabled={loadingMore} className="flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wider transition hover:bg-adm-surface-2 disabled:opacity-50" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}>
                          {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}{loadingMore ? "Loading…" : "Load more"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
