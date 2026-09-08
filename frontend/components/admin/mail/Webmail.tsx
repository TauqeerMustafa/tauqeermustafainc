"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CalendarClock,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Forward,
  Inbox as InboxIcon,
  Loader2,
  Mail,
  MailOpen,
  Maximize2,
  Minimize2,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  RefreshCw,
  Reply,
  ReplyAll,
  Search,
  Send,
  Square,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { getStoredToken } from "@/lib/auth-storage";
import { apiRequest } from "@/lib/api-client";

/**
 * Authenticated fetch carrying the portal session token for /api/mail/* routes.
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

type Draft = {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  savedAt: number;
};

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
  | "inbox"
  | "starred"
  | "sent"
  | "drafts"
  | "scheduled"
  | "all"
  | "spam"
  | "archive"
  | "trash";

const FOLDERS: { key: FolderKey; label: string; icon: typeof Mail; match: string[] }[] = [
  { key: "inbox", label: "Inbox", icon: InboxIcon, match: ["inbox"] },
  { key: "starred", label: "Starred", icon: Star, match: [] },
  { key: "sent", label: "Sent", icon: ArrowUpRight, match: ["sent"] },
  { key: "drafts", label: "Drafts", icon: FileText, match: ["draft", "drafts"] },
  { key: "scheduled", label: "Scheduled", icon: Clock, match: ["scheduled", "schedule"] },
  { key: "all", label: "All Mail", icon: Mail, match: [] },
  { key: "spam", label: "Spam", icon: Ban, match: ["spam", "junk"] },
  { key: "archive", label: "Archive", icon: Archive, match: ["archive", "archived"] },
  { key: "trash", label: "Trash", icon: Trash2, match: ["trash", "deleted", "bin"] },
];

function idOf(msg: Message): string {
  return String(msg.id ?? msg.messageId ?? msg.uid ?? "");
}

function addr(a: any): string {
  if (!a) return "Unknown";
  if (Array.isArray(a)) return a[0] ? addr(a[0]) : "Unknown";
  if (typeof a === "object") {
    return a.name || a.address || a.email || "Unknown";
  }
  return typeof a === "string" ? a : "Unknown";
}

function rawEmail(a: any): string {
  if (!a) return "";
  if (Array.isArray(a)) return a[0] ? rawEmail(a[0]) : "";
  if (typeof a === "object") {
    return (a.email || a.address || "").toLowerCase().trim();
  }
  return typeof a === "string" ? a.toLowerCase().trim() : "";
}

function addrList(v: any): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .map((a: any) => {
      if (typeof a === "string") return a;
      return a?.name ? `${a.name} <${a.address || a.email || ""}>` : a?.address || a?.email || "";
    })
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
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  if (sameYear) {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString([], { month: "numeric", day: "numeric", year: "2-digit" });
}

function fullDateTime(msg: Message): string {
  const d = parseWhen(whenRaw(msg));
  if (!d) return "";
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function serverUnread(msg: Message): boolean {
  if (msg.seen === false || msg.read === false || msg.isRead === false) return true;
  if (msg.unread === true || msg.isUnread === true) return true;
  return labelNames(msg).includes("unread");
}

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
    `Date: ${fullDateTime(msg) || whenOf(msg)}`,
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

function avatarColor(name: string): string {
  const colors = [
    "#0066cc", "#2563eb", "#7c3aed", "#db2777", "#ea580c",
    "#059669", "#0891b2", "#4f46e5", "#d97706", "#0d9488",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

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
    /* storage full or blocked */
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

// Robust Folder Classifiers
function isTrashMsg(msg: Message): boolean {
  if (msg.state === "expunged") return true;
  const f = String(msg.folder || msg.box || msg.folderName || "").toLowerCase();
  if (["trash", "deleted", "bin"].includes(f)) return true;
  return labelNames(msg).some((l) => ["trash", "deleted", "bin"].includes(l));
}

function isSpamMsg(msg: Message): boolean {
  const f = String(msg.folder || msg.box || msg.folderName || "").toLowerCase();
  if (["spam", "junk"].includes(f)) return true;
  return labelNames(msg).some((l) => ["spam", "junk"].includes(l));
}

function isArchiveMsg(msg: Message): boolean {
  const f = String(msg.folder || msg.box || msg.folderName || "").toLowerCase();
  if (["archive", "archived"].includes(f)) return true;
  return labelNames(msg).some((l) => ["archive", "archived"].includes(l));
}

function isSentMsg(msg: Message, currentEmail: string): boolean {
  if (msg.direction === "outbound" || msg.direction === "outgoing") return true;
  if (msg.is_sent === true || msg.sent === true || msg.isSent === true) return true;
  const f = String(msg.folder || msg.box || msg.folderName || "").toLowerCase();
  if (["sent", "outbox"].includes(f)) return true;
  if (labelNames(msg).some((l) => ["sent", "outbox"].includes(l))) return true;
  if (currentEmail) {
    const sender = rawEmail(msg.from);
    if (sender && sender === currentEmail.toLowerCase()) return true;
  }
  return false;
}

function isInboxMsg(msg: Message, currentEmail: string): boolean {
  if (isTrashMsg(msg)) return false;
  if (isSpamMsg(msg)) return false;
  if (isArchiveMsg(msg)) return false;
  if (isSentMsg(msg, currentEmail)) {
    // If sent to oneself (test emails, reminders), also show in Inbox
    const recipientList = addrList(msg.to).map((t) => t.toLowerCase());
    const toSelf = recipientList.some((r) => r.includes(currentEmail.toLowerCase()));
    if (!toSelf) return false;
  }
  return true;
}

const PAGE_SIZE = 25;

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [trash, setTrash] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [folder, setFolder] = useState<FolderKey>("inbox");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active message detail view
  const [selected, setSelected] = useState<Message | null>(null);
  const [content, setContent] = useState<{ html: boolean; body: string } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Floating / Docked Compose popup state ("poplus")
  const [composing, setComposing] = useState(autoCompose);
  const [composeMinimized, setComposeMinimized] = useState(false);
  const [composeMaximized, setComposeMaximized] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode>("new");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [bodyText, setBodyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Inline quick reply inside reading pane
  const [inlineReplyOpen, setInlineReplyOpen] = useState(false);
  const [inlineReplyText, setInlineReplyText] = useState("");
  const [inlineSending, setInlineSending] = useState(false);

  // Server scheduled send
  const [scheduledAt, setScheduledAt] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledMail, setScheduledMail] = useState<ScheduledMail[]>([]);

  // Client view state
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Search & selection
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cursorIndex, setCursorIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const mbDropdownRef = useRef<HTMLDivElement>(null);

  const active = mailboxes.find((m) => m.id === activeId) ?? null;
  const selfEmail = active?.primaryAddress?.toLowerCase() ?? "";

  // Close mailbox dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mbDropdownRef.current && !mbDropdownRef.current.contains(e.target as Node)) {
        setMbOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      let allLive: Message[] = [];
      let nextCur: string | null = null;
      let pageCount = 0;

      while (pageCount < 10) {
        pageCount++;
        const fetchUrl: string = `/api/mail/messages?mailbox=${mailboxId}&limit=100${
          nextCur ? `&cursor=${encodeURIComponent(nextCur)}` : ""
        }`;
        const fetchRes = await authFetch(fetchUrl);
        const json = await fetchRes.json();
        if (json.error) throw new Error(json.error);
        const batch: Message[] = json.messages || [];
        allLive = [...allLive, ...batch];
        if (!json.nextCursor || batch.length === 0) break;
        nextCur = json.nextCursor;
      }

      const expunged = await authFetch(
        `/api/mail/messages?mailbox=${mailboxId}&state=expunged&limit=100`,
      )
        .then((r) => r.json())
        .catch(() => ({ messages: [] }));

      setMessages(allLive);
      setTrash(expunged.error ? [] : expunged.messages || []);
      setCursor(nextCur);
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
        `/api/mail/messages?mailbox=${activeId}&cursor=${encodeURIComponent(cursor)}&limit=100`,
      ).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setMessages((prev) => {
        const seen = new Set(prev.map(idOf));
        const extra = (res.messages || []).filter((m: Message) => !seen.has(idOf(m)));
        return [...prev, ...extra];
      });
      setCursor(res.nextCursor ?? null);
    } catch (e: any) {
      setNotice(`Could not load more: ${e.message}`);
    } finally {
      setLoadingMore(false);
    }
  }, [activeId, cursor]);

  const loadScheduled = useCallback(async () => {
    try {
      const res = await apiRequest<{ data: ScheduledMail[] }>({ url: "/mail/scheduled", method: "GET" });
      setScheduledMail(res.data ?? []);
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    loadMailboxes();
    loadScheduled();
  }, [loadMailboxes, loadScheduled]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!activeId) return;
    setReadIds(loadSet(mailKey(activeId, "read")));
    setUnreadIds(loadSet(mailKey(activeId, "unread")));
    setStarredIds(loadSet(mailKey(activeId, "star")));
    setArchivedIds(loadSet(mailKey(activeId, "archive")));
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

  const toggleArchive = useCallback(
    (ids: string[], value?: boolean) => {
      if (!activeId || ids.length === 0) return;
      setArchivedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => {
          const on = value === undefined ? !next.has(id) : value;
          if (on) next.add(id);
          else next.delete(id);
        });
        saveSet(mailKey(activeId, "archive"), next);
        return next;
      });
      setNotice(ids.length === 1 ? "Conversation archived" : `${ids.length} conversations archived`);
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

  // Autosave open composer to drafts (debounced)
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
        setDraftNotice("Draft saved");
        setTimeout(() => setDraftNotice(null), 2500);
        return id;
      });
    }, 1000);
    return () => clearTimeout(handle);
  }, [composing, to, cc, bcc, subject, bodyText, activeId]);

  async function openMessage(msg: Message) {
    setSelected(msg);
    setContent(null);
    setAttachments([]);
    setLoadingContent(true);
    setInlineReplyOpen(false);
    setInlineReplyText("");
    markRead([idOf(msg)], true);
    try {
      const res = await authFetch(`/api/mail/message?mailbox=${activeId}&id=${idOf(msg)}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not load the message.");
      setContent({ html: Boolean(json.isHtml), body: json.content });
      setAttachments(Array.isArray(json.attachments) ? json.attachments : []);
    } catch (e: any) {
      setContent({ html: false, body: `Error loading message: ${e.message}` });
    } finally {
      setLoadingContent(false);
    }
  }

  function startCompose() {
    setComposing(true);
    setComposeMinimized(false);
    setComposeMode("new");
    setDraftId(null);
    setTo("");
    setCc("");
    setBcc("");
    setShowCc(false);
    setShowBcc(false);
    setSubject("");
    setBodyText("");
    setScheduledAt("");
    setShowSchedule(false);
    setSendError(null);
  }

  function startReply(msg: Message, mode: ComposeMode) {
    const fromAddr = rawEmail(msg.from) || addr(msg.from);
    const body = content ? (content.html ? htmlToText(content.body) : content.body) : "";

    setComposeMode(mode);
    setComposing(true);
    setComposeMinimized(false);
    setDraftId(null);
    setScheduledAt("");
    setShowSchedule(false);
    setSendError(null);

    if (mode === "forward") {
      setTo("");
      setCc("");
      setBcc("");
      setShowCc(false);
      setShowBcc(false);
      setSubject(/^fwd:/i.test(msg.subject || "") ? msg.subject : `Fwd: ${msg.subject || ""}`);
      setBodyText(forwardOriginal(msg, body));
      return;
    }

    const others =
      mode === "replyAll"
        ? [...addrList(msg.to), ...addrList(msg.cc)]
            .map((a) => rawEmail(a) || a)
            .filter((a) => a.toLowerCase() !== selfEmail && a.toLowerCase() !== fromAddr.toLowerCase())
        : [];
    setTo(fromAddr);
    setCc([...new Set(others)].join(", "));
    setBcc("");
    setShowCc(mode === "replyAll" && others.length > 0);
    setShowBcc(false);
    setSubject(/^re:/i.test(msg.subject || "") ? msg.subject : `Re: ${msg.subject || ""}`);
    setBodyText(quoteOriginal(msg, body));
  }

  function openDraft(d: Draft) {
    setComposing(true);
    setComposeMinimized(false);
    setComposeMode("new");
    setDraftId(d.id);
    setTo(d.to);
    setCc(d.cc);
    setBcc(d.bcc);
    setShowCc(Boolean(d.cc));
    setShowBcc(Boolean(d.bcc));
    setSubject(d.subject);
    setBodyText(d.body);
    setScheduledAt("");
    setShowSchedule(false);
    setSendError(null);
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!active) return;
    const toArr = parseAddrs(to);
    if (toArr.length === 0) {
      setSendError("Please add at least one recipient.");
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
          subject: subject.trim() || "(No subject)",
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

  async function handleInlineReply() {
    if (!active || !selected || !inlineReplyText.trim()) return;
    const recipient = rawEmail(selected.from) || addr(selected.from);
    if (!recipient) return;

    setInlineSending(true);
    try {
      const res = await authFetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailbox: active.id,
          fromAddress: active.primaryAddress,
          to: [recipient],
          subject: /^re:/i.test(selected.subject || "") ? selected.subject : `Re: ${selected.subject || ""}`,
          text: inlineReplyText,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not send reply.");
      setInlineReplyText("");
      setInlineReplyOpen(false);
      setNotice("Reply sent.");
      loadMessages(active.id, true);
    } catch (err: any) {
      setNotice(`Reply failed: ${err.message}`);
    } finally {
      setInlineSending(false);
    }
  }

  async function handleSchedule() {
    if (!active) return;
    const recipients = [...parseAddrs(to), ...parseAddrs(cc), ...parseAddrs(bcc)];
    if (recipients.length === 0 || !subject.trim() || !bodyText.trim()) {
      setSendError("Please add recipients, a subject, and body text before scheduling.");
      return;
    }
    const when = new Date(scheduledAt);
    if (!scheduledAt || isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      setSendError("Pick a valid date and time in the future to schedule this message.");
      return;
    }
    setScheduling(true);
    setSendError(null);
    try {
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
      setShowSchedule(false);
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
      setNotice(`Cancel failed: ${e?.message || "unknown error"}`);
    }
  }

  async function requestDelete(msg: Message) {
    const res = await authFetch("/api/mail/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mailbox: active!.id, id: idOf(msg) }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Could not delete message.");
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
      setNotice(`Delete failed: ${e.message}`);
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
      setNotice(`Delete failed: ${e.message}`);
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
    setSelectedIds(new Set());
    setPage(1);
    setCursorIndex(0);
  }

  function switchMailbox(id: string) {
    setActiveId(id);
    setMbOpen(false);
    setSelected(null);
    setFolder("inbox");
    setSelectedIds(new Set());
    setPage(1);
    setQuery("");
    setCursor(null);
  }

  // Calculate unread & item counts
  const counts = useMemo(() => {
    const c: Record<FolderKey, number> = {
      inbox: 0,
      starred: 0,
      sent: 0,
      drafts: 0,
      scheduled: 0,
      all: 0,
      spam: 0,
      archive: 0,
      trash: 0,
    };

    for (const msg of messages) {
      const unread = isUnread(msg);
      const isArchived = archivedIds.has(idOf(msg)) || isArchiveMsg(msg);
      const isTr = isTrashMsg(msg);
      const isSp = isSpamMsg(msg);

      if (isTr) continue;

      if (unread) {
        c.all++;
        if (isInboxMsg(msg, selfEmail) && !isArchived) {
          c.inbox++;
        }
        if (isSp) c.spam++;
      }
    }

    c.starred = starredIds.size;
    c.drafts = drafts.length;
    c.scheduled = scheduledMail.filter((s) => s.status === "pending").length;
    c.trash = trash.length;

    return c;
  }, [messages, trash, scheduledMail, starredIds, drafts, isUnread, selfEmail, archivedIds]);

  // Master Visible Filter: Correctly categorizes and orders every email
  const visible = useMemo(() => {
    let list: Message[] = [];

    if (folder === "trash") {
      const seen = new Set<string>();
      list = [...trash, ...messages.filter(isTrashMsg)].filter((m) => {
        const id = idOf(m);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    } else if (folder === "all") {
      list = messages.filter((m) => !isTrashMsg(m));
    } else if (folder === "starred") {
      list = [...messages, ...trash].filter(
        (m) => starredIds.has(idOf(m)) || m.starred === true || m.isStarred === true,
      );
    } else if (folder === "sent") {
      list = messages.filter((m) => !isTrashMsg(m) && isSentMsg(m, selfEmail));
    } else if (folder === "inbox") {
      list = messages.filter(
        (m) => isInboxMsg(m, selfEmail) && !archivedIds.has(idOf(m)),
      );
    } else if (folder === "spam") {
      list = messages.filter((m) => !isTrashMsg(m) && isSpamMsg(m));
    } else if (folder === "archive") {
      list = messages.filter((m) => !isTrashMsg(m) && (isArchiveMsg(m) || archivedIds.has(idOf(m))));
    } else {
      const def = FOLDERS.find((f) => f.key === folder);
      list = messages.filter((m) => {
        if (isTrashMsg(m)) return false;
        const names = labelNames(m);
        return def?.match.some((matchKey) => names.includes(matchKey));
      });
    }

    // Filter by query
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const hay = [
          addr(m.from),
          rawEmail(m.from),
          m.subject,
          m.snippet || m.preview || "",
          addrList(m.to).join(" "),
          addrList(m.cc).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // Sort newest first
    list.sort((a, b) => {
      const timeA = parseWhen(whenRaw(a))?.getTime() || 0;
      const timeB = parseWhen(whenRaw(b))?.getTime() || 0;
      return timeB - timeA;
    });

    return list;
  }, [folder, messages, trash, starredIds, archivedIds, query, selfEmail]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visible.slice(start, start + PAGE_SIZE);
  }, [visible, page]);

  useEffect(() => {
    setPage(1);
  }, [folder, query, activeId]);

  const allOnPageSelected =
    currentPageItems.length > 0 && currentPageItems.every((m) => selectedIds.has(idOf(m)));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const allCurrentSelected = currentPageItems.every((m) => prev.has(idOf(m)));
      const next = new Set(prev);
      if (allCurrentSelected) {
        currentPageItems.forEach((m) => next.delete(idOf(m)));
      } else {
        currentPageItems.forEach((m) => next.add(idOf(m)));
      }
      return next;
    });
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const isTyping =
        !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      if (e.key === "Escape") {
        if (composing && !composeMinimized) {
          setComposeMinimized(true);
        } else if (selected) {
          setSelected(null);
        } else if (query) {
          setQuery("");
        } else if (selectedIds.size > 0) {
          setSelectedIds(new Set());
        }
        return;
      }

      if (isTyping) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && composing) {
          handleSend();
        }
        return;
      }

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
        if (e.key === "u" || e.key === "Escape") {
          e.preventDefault();
          setSelected(null);
        } else if (e.key === "r") {
          e.preventDefault();
          startReply(selected, "reply");
        } else if (e.key === "a") {
          e.preventDefault();
          startReply(selected, "replyAll");
        } else if (e.key === "f") {
          e.preventDefault();
          startReply(selected, "forward");
        } else if (e.key === "s") {
          e.preventDefault();
          toggleStar([idOf(selected)]);
        } else if (e.key === "e") {
          e.preventDefault();
          toggleArchive([idOf(selected)]);
          setSelected(null);
        } else if (e.key === "#" || e.key === "Delete") {
          e.preventDefault();
          handleDelete(selected);
        }
        return;
      }

      if (e.key === "j") {
        e.preventDefault();
        setCursorIndex((i) => Math.min(i + 1, Math.max(currentPageItems.length - 1, 0)));
      } else if (e.key === "k") {
        e.preventDefault();
        setCursorIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "o") {
        const m = currentPageItems[cursorIndex];
        if (m) openMessage(m);
      } else if (e.key === "s") {
        const m = currentPageItems[cursorIndex];
        if (m) toggleStar([idOf(m)]);
      } else if (e.key === "x") {
        const m = currentPageItems[cursorIndex];
        if (m) toggleSelect(idOf(m));
      } else if (e.key === "e") {
        const m = currentPageItems[cursorIndex];
        if (m) toggleArchive([idOf(m)]);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composing, composeMinimized, selected, query, selectedIds, currentPageItems, cursorIndex]);

  if (loading) {
    return (
      <div
        className="flex h-[740px] items-center justify-center rounded-2xl border"
        style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--adm-blue)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--adm-text-3)" }}>
            Loading Webmail…
          </span>
        </div>
      </div>
    );
  }

  if (error && mailboxes.length === 0) {
    return (
      <div
        className="flex h-[740px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center"
        style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)" }}
      >
        <Mail className="mb-4 h-12 w-12" style={{ color: "var(--adm-red)" }} />
        <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--adm-text)" }}>
          Could not load your mailbox
        </h3>
        <p className="mb-4 max-w-md text-sm" style={{ color: "var(--adm-text-2)" }}>
          {error}
        </p>
        <p className="text-xs" style={{ color: "var(--adm-text-3)" }}>
          Confirm OPENEMAIL_API_KEY is configured on the server.
        </p>
      </div>
    );
  }

  const composeTitle =
    composeMode === "reply"
      ? `Reply: ${subject || "(No subject)"}`
      : composeMode === "replyAll"
      ? `Reply all: ${subject || "(No subject)"}`
      : composeMode === "forward"
      ? `Forward: ${subject || "(No subject)"}`
      : "New message";

  return (
    <div
      className="relative flex h-[calc(100vh-175px)] min-h-[480px] lg:min-h-[540px] max-h-[960px] overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
    >
      {/* ── LEFT SIDEBAR (Gmail style) ─────────────────────────────────── */}
      <aside
        className={`${
          sidebarCollapsed ? "hidden" : "flex"
        } w-56 lg:w-60 shrink-0 flex-col border-r transition-all`}
        style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
      >
        {/* Mailbox Switcher Header */}
        <div className="border-b p-3" style={{ borderColor: "var(--adm-border)" }} ref={mbDropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMbOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition hover:border-adm-blue/40"
              style={{
                borderColor: "var(--adm-border)",
                background: "var(--adm-surface)",
                color: "var(--adm-text)",
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: avatarColor(active?.primaryAddress || "M") }}
                >
                  {(active?.primaryAddress || "M")[0].toUpperCase()}
                </span>
                <span className="truncate">{active?.primaryAddress ?? "Select mailbox"}</span>
              </div>
              <ChevronDown size={13} style={{ color: "var(--adm-text-3)" }} />
            </button>

            {mbOpen && mailboxes.length > 0 && (
              <div
                className="absolute left-0 top-full z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border shadow-xl"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
              >
                <div className="p-1">
                  {mailboxes.map((mb) => {
                    const isCur = mb.id === activeId;
                    return (
                      <button
                        key={mb.id}
                        type="button"
                        onClick={() => switchMailbox(mb.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-adm-surface-2"
                        style={{
                          color: isCur ? "var(--adm-blue)" : "var(--adm-text)",
                          fontWeight: isCur ? 600 : 400,
                        }}
                      >
                        <span className="truncate">{mb.primaryAddress}</span>
                        {isCur && <Check size={13} style={{ color: "var(--adm-blue)" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Big Gmail-Style Compose Pill */}
          <button
            type="button"
            onClick={startCompose}
            className="btn-press mt-3 flex w-full items-center justify-center gap-2.5 rounded-2xl border py-2.5 text-xs font-bold tracking-wide shadow-sm transition hover:shadow"
            style={{
              borderColor: "var(--adm-border)",
              background: "var(--adm-surface)",
              color: "var(--adm-text)",
            }}
          >
            <Edit3 size={15} style={{ color: "var(--adm-blue)" }} />
            <span>Compose</span>
          </button>
        </div>

        {/* Folder Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const isActive = folder === f.key;
            const count = counts[f.key] ?? 0;
            const isUnreadCategory = f.key === "inbox" || f.key === "spam";

            return (
              <button
                key={f.key}
                type="button"
                onClick={() => switchFolder(f.key)}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition"
                style={{
                  background: isActive ? "var(--adm-blue-light)" : "transparent",
                  color: isActive ? "var(--adm-blue)" : "var(--adm-text-2)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    style={{
                      color: isActive ? "var(--adm-blue)" : "var(--adm-text-3)",
                    }}
                    className={f.key === "starred" && isActive ? "fill-amber-500 text-amber-500" : ""}
                  />
                  <span>{f.label}</span>
                </div>
                {count > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px]"
                    style={{
                      background: isActive ? "var(--adm-blue)" : "var(--adm-surface)",
                      color: isActive ? "#ffffff" : "var(--adm-text-3)",
                      fontWeight: isUnreadCategory ? 700 : 500,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Universal Top Bar (Search + Pagination + Actions) */}
        <header
          className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
        >
          {/* Left: Sidebar Toggle + Title / Back */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-adm-surface-2"
              style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-3)" }}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>

            {selected ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition hover:bg-adm-surface-2"
                style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
                title="Back to list (u)"
              >
                <ArrowLeft size={14} /> Back to {FOLDERS.find((f) => f.key === folder)?.label}
              </button>
            ) : (
              <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--adm-text)" }}>
                {FOLDERS.find((f) => f.key === folder)?.label}
              </h2>
            )}
          </div>

          {/* Center: Gmail-style Search Bar */}
          {!selected && folder !== "scheduled" && folder !== "drafts" && (
            <div className="relative mx-auto flex max-w-md flex-1 items-center">
              <Search
                size={14}
                className="pointer-events-none absolute left-3"
                style={{ color: "var(--adm-text-3)" }}
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mail (press / to focus)"
                className="h-9 w-full rounded-full border bg-transparent pl-9 pr-8 text-xs outline-none transition focus:border-adm-blue focus:ring-1 focus:ring-adm-blue/20"
                style={{
                  borderColor: "var(--adm-border)",
                  background: "var(--adm-surface-2)",
                  color: "var(--adm-text)",
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 transition hover:opacity-70"
                  aria-label="Clear search"
                >
                  <X size={13} style={{ color: "var(--adm-text-3)" }} />
                </button>
              )}
            </div>
          )}

          {/* Right: Controls & Pagination */}
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--adm-text-3)" }}>
            {!selected && visible.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}
                </span>
                <div className="ml-1 flex items-center">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-adm-surface-2 disabled:opacity-30"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                    className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-adm-surface-2 disabled:opacity-30"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => (folder === "scheduled" ? loadScheduled() : loadMessages(activeId, true))}
              aria-label="Refresh mail"
              title="Refresh"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-surface-2"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Notice Banner */}
        {notice && (
          <div
            className="flex items-center justify-between gap-3 border-b px-4 py-2 text-xs transition"
            style={{
              borderColor: "var(--adm-border)",
              background: "var(--adm-surface-2)",
              color: "var(--adm-text)",
            }}
          >
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notice"
              onClick={() => setNotice(null)}
              className="hover:opacity-70"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* ── SUB-VIEW: SELECTED MESSAGE READING PANE ─────────────────── */}
        {selected ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Sticky Action Bar Above Message */}
            <div
              className="sticky top-0 z-20 flex items-center justify-between border-b px-5 py-2.5 shadow-xs"
              style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
            >
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  title="Back to inbox (u / Esc)"
                  className="btn-press mr-1 flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-xs transition hover:bg-adm-surface-2"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <div className="mr-1 h-4 w-px" style={{ background: "var(--adm-border)" }} />
                <button
                  type="button"
                  onClick={() => {
                    toggleArchive([idOf(selected)]);
                    setSelected(null);
                  }}
                  title="Archive (e)"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-surface-2"
                  style={{ color: "var(--adm-text-2)" }}
                >
                  <Archive size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selected)}
                  title="Delete (#)"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-red-light"
                  style={{ color: "var(--adm-red)" }}
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markRead([idOf(selected)], false);
                    setSelected(null);
                  }}
                  title="Mark as unread"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-surface-2"
                  style={{ color: "var(--adm-text-2)" }}
                >
                  <Mail size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleStar([idOf(selected)])}
                  title="Star (s)"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-surface-2"
                  style={{ color: starredIds.has(idOf(selected)) ? "#f59e0b" : "var(--adm-text-2)" }}
                >
                  <Star
                    size={15}
                    fill={starredIds.has(idOf(selected)) ? "#f59e0b" : "none"}
                    color={starredIds.has(idOf(selected)) ? "#f59e0b" : "currentColor"}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startReply(selected, "reply")}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                  title="Reply in popup (r)"
                >
                  <Reply size={13} /> Reply
                </button>
                <button
                  type="button"
                  onClick={() => startReply(selected, "forward")}
                  className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-surface-2"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                  title="Forward in popup (f)"
                >
                  <Forward size={13} /> Forward
                </button>
              </div>
            </div>

            {/* Email Header */}
            <div className="border-b p-6" style={{ borderColor: "var(--adm-border)" }}>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--adm-text)" }}>
                  {selected.subject || "(No subject)"}
                </h1>
                {isSentMsg(selected, selfEmail) && (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: "var(--adm-surface-2)", color: "var(--adm-text-3)" }}
                  >
                    Sent
                  </span>
                )}
              </div>

              {/* Sender & Recipient Details */}
              <div className="mt-4 flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm"
                  style={{ background: avatarColor(addr(selected.from)) }}
                >
                  {addr(selected.from)[0]?.toUpperCase() || "M"}
                </div>

                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm" style={{ color: "var(--adm-text)" }}>
                        {addr(selected.from)}
                      </span>
                      {rawEmail(selected.from) && (
                        <span style={{ color: "var(--adm-text-3)" }}>
                          &lt;{rawEmail(selected.from)}&gt;
                        </span>
                      )}
                    </div>
                    <span style={{ color: "var(--adm-text-3)" }}>
                      {fullDateTime(selected) || whenOf(selected)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                    <span>to {addrList(selected.to)[0] || "me"}</span>
                    <button
                      type="button"
                      onClick={() => setDetailsExpanded((v) => !v)}
                      className="ml-1 inline-flex items-center rounded px-1 transition hover:bg-adm-surface-2"
                    >
                      <ChevronDown size={11} className={detailsExpanded ? "rotate-180 transition-transform" : ""} />
                    </button>
                  </div>

                  {detailsExpanded && (
                    <div
                      className="mt-2 space-y-1 rounded-xl border p-3 text-[11px]"
                      style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
                    >
                      <p>
                        <strong style={{ color: "var(--adm-text)" }}>From:</strong> {addrList(selected.from).join(", ")}
                      </p>
                      <p>
                        <strong style={{ color: "var(--adm-text)" }}>To:</strong> {addrList(selected.to).join(", ") || "—"}
                      </p>
                      {addrList(selected.cc).length > 0 && (
                        <p>
                          <strong style={{ color: "var(--adm-text)" }}>Cc:</strong> {addrList(selected.cc).join(", ")}
                        </p>
                      )}
                      <p>
                        <strong style={{ color: "var(--adm-text)" }}>Date:</strong> {fullDateTime(selected)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email Body Content - with auto overflow and responsive table wrapping */}
            <div className="flex-1 min-w-0 max-w-full overflow-x-auto p-6">
              {loadingContent ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--adm-blue)" }} />
                </div>
              ) : content?.html ? (
                <div className="min-w-0 max-w-full">
                  <style>{`
                    .webmail-html-body table {
                      max-width: 100% !important;
                      width: auto !important;
                      display: block !important;
                      overflow-x: auto !important;
                    }
                    .webmail-html-body img {
                      max-width: 100% !important;
                      height: auto !important;
                    }
                    .webmail-html-body pre {
                      white-space: pre-wrap !important;
                      word-break: break-word !important;
                      overflow-wrap: break-word !important;
                    }
                    .webmail-html-body {
                      word-break: break-word;
                      overflow-wrap: break-word;
                    }
                  `}</style>
                  <div
                    className="webmail-html-body prose prose-sm max-w-none text-sm leading-relaxed"
                    style={{ color: "var(--adm-text)" }}
                    dangerouslySetInnerHTML={{ __html: content.body }}
                  />
                </div>
              ) : (
                <pre
                  className="min-w-0 max-w-full overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed"
                  style={{ color: "var(--adm-text)" }}
                >
                  {content?.body || "(Empty message)"}
                </pre>
              )}
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="border-t p-5" style={{ borderColor: "var(--adm-border)" }}>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--adm-text-3)" }}>
                  {attachments.length} Attachment{attachments.length === 1 ? "" : "s"}
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {attachments.map((att, i) => {
                    const name = att.filename || att.name || `Attachment-${i + 1}`;
                    const size = formatBytes(att.size);
                    const href = typeof att.url === "string" && /^https?:\/\//i.test(att.url) ? att.url : null;

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-xl border p-3 transition hover:shadow-sm"
                        style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Paperclip size={15} style={{ color: "var(--adm-blue)" }} />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold" style={{ color: "var(--adm-text)" }}>
                              {name}
                            </p>
                            {size && (
                              <p className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>
                                {size}
                              </p>
                            )}
                          </div>
                        </div>
                        {href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition hover:bg-adm-surface"
                            style={{ borderColor: "var(--adm-border)", color: "var(--adm-blue)" }}
                            title="Download attachment"
                          >
                            <Download size={13} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Quick Reply Card */}
            <div className="border-t p-5" style={{ borderColor: "var(--adm-border)" }}>
              {inlineReplyOpen ? (
                <div
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
                >
                  <div className="mb-2 flex items-center justify-between text-xs" style={{ color: "var(--adm-text-3)" }}>
                    <span>Replying to <strong>{addr(selected.from)}</strong></span>
                    <button
                      type="button"
                      onClick={() => startReply(selected, "reply")}
                      title="Pop out to floating compose window"
                      className="flex items-center gap-1 font-semibold transition hover:text-adm-blue"
                    >
                      <ExternalLink size={12} /> Pop out
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={inlineReplyText}
                    onChange={(e) => setInlineReplyText(e.target.value)}
                    placeholder="Write your quick reply…"
                    className="w-full resize-none bg-transparent text-sm outline-none"
                    style={{ color: "var(--adm-text)" }}
                  />
                  <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--adm-border)" }}>
                    <button
                      type="button"
                      onClick={() => setInlineReplyOpen(false)}
                      className="text-xs font-semibold"
                      style={{ color: "var(--adm-text-3)" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleInlineReply}
                      disabled={inlineSending || !inlineReplyText.trim()}
                      className="btn-press flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                      style={{ background: "var(--adm-blue)" }}
                    >
                      {inlineSending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>{inlineSending ? "Sending…" : "Send"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setInlineReplyOpen(true)}
                    className="btn-press flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold transition hover:bg-adm-surface-2"
                    style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                  >
                    <Reply size={14} style={{ color: "var(--adm-blue)" }} />
                    <span>Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startReply(selected, "forward")}
                    className="btn-press flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold transition hover:bg-adm-surface-2"
                    style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                  >
                    <Forward size={14} style={{ color: "var(--adm-text-3)" }} />
                    <span>Forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── SUB-VIEW: MESSAGE LIST & FOLDERS ───────────────────────── */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top List Action / Selection Toolbar */}
            {folder !== "scheduled" && folder !== "drafts" && (
              <div
                className="flex h-11 shrink-0 items-center justify-between border-b px-4 text-xs"
                style={{
                  borderColor: "var(--adm-border)",
                  background: selectedIds.size > 0 ? "var(--adm-blue-light)" : "var(--adm-surface)",
                }}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    aria-label={allOnPageSelected ? "Deselect page" : "Select page"}
                    style={{ color: allOnPageSelected ? "var(--adm-blue)" : "var(--adm-text-3)" }}
                    className="transition hover:opacity-80"
                  >
                    {allOnPageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>

                  {selectedIds.size > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: "var(--adm-blue)" }}>
                        {selectedIds.size} selected
                      </span>
                      <div className="h-3 w-px bg-adm-border" />
                      <button
                        type="button"
                        onClick={() => {
                          markRead([...selectedIds], true);
                          setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition hover:bg-white/40"
                        style={{ color: "var(--adm-text-2)" }}
                        title="Mark as read"
                      >
                        <MailOpen size={13} /> Read
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          markRead([...selectedIds], false);
                          setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition hover:bg-white/40"
                        style={{ color: "var(--adm-text-2)" }}
                        title="Mark as unread"
                      >
                        <Mail size={13} /> Unread
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleStar([...selectedIds], true);
                          setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition hover:bg-white/40"
                        style={{ color: "var(--adm-text-2)" }}
                        title="Add star"
                      >
                        <Star size={13} /> Star
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleArchive([...selectedIds], true);
                          setSelectedIds(new Set());
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition hover:bg-white/40"
                        style={{ color: "var(--adm-text-2)" }}
                        title="Archive"
                      >
                        <Archive size={13} /> Archive
                      </button>
                      <button
                        type="button"
                        onClick={bulkDelete}
                        className="flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition hover:bg-red-50"
                        style={{ color: "var(--adm-red)" }}
                        title="Delete"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--adm-text-3)" }}>
                      {visible.length} conversation{visible.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="font-semibold transition hover:opacity-70"
                    style={{ color: "var(--adm-text-3)" }}
                  >
                    Clear selection
                  </button>
                )}
              </div>
            )}

            {/* List Body according to Folder */}
            {folder === "scheduled" ? (
              <div className="flex-1 divide-y overflow-y-auto" style={{ borderColor: "var(--adm-border)" }}>
                {scheduledMail.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-24 text-center" style={{ color: "var(--adm-text-3)" }}>
                    <Clock className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm font-semibold">No scheduled messages</p>
                    <p className="mt-1 text-xs">Compose an email and pick “Schedule” to queue future delivery.</p>
                  </div>
                ) : (
                  scheduledMail.map((s) => {
                    const when = parseWhen(s.sendAt);
                    const meta =
                      s.status === "pending"
                        ? { Icon: Clock, color: "var(--adm-blue)", label: "Scheduled" }
                        : s.status === "sent"
                        ? { Icon: CheckCircle2, color: "var(--adm-blue)", label: "Sent" }
                        : s.status === "canceled"
                        ? { Icon: Ban, color: "var(--adm-text-3)", label: "Canceled" }
                        : { Icon: XCircle, color: "var(--adm-red)", label: "Failed" };
                    const B = meta.Icon;

                    return (
                      <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-adm-surface-2">
                        <div className="w-48 shrink-0 truncate text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
                          {s.to.join(", ")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" style={{ color: "var(--adm-text)" }}>
                            {s.subject || "(No subject)"}
                          </p>
                          <p className="flex items-center gap-1.5 truncate text-xs" style={{ color: meta.color }}>
                            <B size={12} />
                            {meta.label}
                            {when ? ` · ${when.toLocaleString()}` : ""}
                            {s.status === "failed" && s.error ? ` — ${s.error}` : ""}
                          </p>
                        </div>
                        {s.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => cancelScheduled(s.id)}
                            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-adm-red-light"
                            style={{ borderColor: "var(--adm-border)", color: "var(--adm-red)" }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : folder === "drafts" ? (
              <div className="flex-1 divide-y overflow-y-auto" style={{ borderColor: "var(--adm-border)" }}>
                {drafts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-24 text-center" style={{ color: "var(--adm-text-3)" }}>
                    <FileText className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm font-semibold">No drafts saved</p>
                    <p className="mt-1 text-xs">Unsent emails will automatically be kept here.</p>
                  </div>
                ) : (
                  drafts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => openDraft(d)}
                      className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-adm-surface-2"
                    >
                      <div className="w-48 shrink-0 truncate text-sm font-semibold text-adm-red">
                        Draft to: {d.to || "(No recipient)"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" style={{ color: "var(--adm-text)" }}>
                          {d.subject || "(No subject)"}
                        </p>
                        <p className="truncate text-xs" style={{ color: "var(--adm-text-3)" }}>
                          {d.body.slice(0, 100) || "Empty draft"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs" style={{ color: "var(--adm-text-3)" }}>
                        {new Date(d.savedAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        aria-label="Delete draft"
                        onClick={(e) => {
                          e.stopPropagation();
                          dropDraft(d.id);
                        }}
                        className="opacity-0 transition group-hover:opacity-100 hover:text-adm-red"
                        style={{ color: "var(--adm-text-3)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Standard Email Rows (Inbox, Sent, Starred, Archive, Trash) */
              <div className="flex-1 divide-y overflow-y-auto" style={{ borderColor: "var(--adm-border)" }}>
                {currentPageItems.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-24 text-center" style={{ color: "var(--adm-text-3)" }}>
                    <Mail className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm font-semibold">
                      {query ? `No messages found matching “${query}”` : `No messages in ${FOLDERS.find((f) => f.key === folder)?.label}`}
                    </p>
                  </div>
                ) : (
                  currentPageItems.map((msg, idx) => {
                    const id = idOf(msg);
                    const unread = isUnread(msg);
                    const isChecked = selectedIds.has(id);
                    const starred = starredIds.has(id);
                    const hasAttachment = Boolean(msg.attachments?.length || msg.hasAttachments || msg.attachmentCount);
                    const isSent = isSentMsg(msg, selfEmail);
                    const displayName = isSent ? `To: ${addrList(msg.to)[0] || addr(msg.to)}` : addr(msg.from);

                    return (
                      <div
                        key={id || idx}
                        onClick={() => openMessage(msg)}
                        className="group relative flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-adm-surface-2"
                        style={{
                          background: unread ? "var(--adm-blue-light)" : "transparent",
                        }}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(id);
                          }}
                          aria-label={isChecked ? "Deselect" : "Select"}
                          style={{ color: isChecked ? "var(--adm-blue)" : "var(--adm-text-3)" }}
                          className={`shrink-0 ${isChecked ? "" : "opacity-0 group-hover:opacity-100 transition"}`}
                        >
                          {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>

                        {/* Star Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar([id]);
                          }}
                          aria-label={starred ? "Unstar" : "Star"}
                          className="shrink-0 transition"
                          style={{ color: starred ? "#f59e0b" : "var(--adm-text-3)" }}
                        >
                          <Star
                            size={16}
                            fill={starred ? "#f59e0b" : "none"}
                            color={starred ? "#f59e0b" : "currentColor"}
                          />
                        </button>

                        {/* Unread Accent Dot */}
                        {unread && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: "var(--adm-blue)" }}
                          />
                        )}

                        {/* Sender Avatar / Initial */}
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                          style={{ background: avatarColor(displayName) }}
                        >
                          {displayName[0]?.toUpperCase() || "M"}
                        </div>

                        {/* Sender Name */}
                        <div
                          className="w-40 shrink-0 truncate text-xs"
                          style={{
                            color: "var(--adm-text)",
                            fontWeight: unread ? 700 : 500,
                          }}
                        >
                          {displayName}
                        </div>

                        {/* Subject + Snippet */}
                        <div className="min-w-0 flex-1 truncate text-xs">
                          <span
                            style={{
                              color: "var(--adm-text)",
                              fontWeight: unread ? 700 : 500,
                            }}
                          >
                            {msg.subject || "(No subject)"}
                          </span>
                          <span className="mx-1.5 opacity-40">—</span>
                          <span style={{ color: "var(--adm-text-3)" }}>
                            {msg.snippet || msg.preview || ""}
                          </span>
                        </div>

                        {/* Attachment indicator */}
                        {hasAttachment && (
                          <Paperclip size={13} className="shrink-0" style={{ color: "var(--adm-text-3)" }} />
                        )}

                        {/* Timestamp (hidden when hover action pill is shown) */}
                        <span
                          className="shrink-0 text-[11px] group-hover:hidden"
                          style={{
                            color: "var(--adm-text-3)",
                            fontWeight: unread ? 600 : 400,
                          }}
                        >
                          {whenOf(msg)}
                        </span>

                        {/* ── GMAIL HOVER ACTION PILL ─────────────────────── */}
                        <div
                          className="hidden shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 shadow-sm group-hover:flex"
                          style={{
                            borderColor: "var(--adm-border)",
                            background: "var(--adm-surface)",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => toggleArchive([id])}
                            title="Archive"
                            className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-adm-surface-2"
                            style={{ color: "var(--adm-text-2)" }}
                          >
                            <Archive size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(msg)}
                            title="Delete"
                            className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-adm-red-light"
                            style={{ color: "var(--adm-red)" }}
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => markRead([id], !unread)}
                            title={unread ? "Mark as read" : "Mark as unread"}
                            className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-adm-surface-2"
                            style={{ color: "var(--adm-text-2)" }}
                          >
                            {unread ? <MailOpen size={13} /> : <Mail size={13} />}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Optional load more from server cursor */}
                {cursor && !query && folder !== "trash" && folder !== "starred" && (
                  <div className="flex justify-center p-4">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold transition hover:bg-adm-surface-2 disabled:opacity-50"
                      style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
                    >
                      {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                      <span>{loadingMore ? "Loading more messages…" : "Load older messages"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── GMAIL FLOATING / DOCKED COMPOSE POPUP ("poplus") ───────────── */}
      {composing && (
        <div
          className={`fixed z-50 transition-all ${
            composeMinimized
              ? "bottom-0 right-6 h-11 w-72 rounded-t-2xl border shadow-2xl"
              : composeMaximized
              ? "inset-4 sm:inset-10 md:inset-16 rounded-2xl border shadow-2xl flex flex-col"
              : "bottom-0 right-4 sm:right-8 h-[540px] max-h-[calc(100vh-4rem)] w-full sm:w-[540px] max-w-[calc(100vw-2rem)] rounded-t-2xl border shadow-2xl flex flex-col"
          }`}
          style={{
            borderColor: "var(--adm-border)",
            background: "var(--adm-surface)",
          }}
        >
          {/* Header Bar */}
          <div
            className="flex h-11 shrink-0 items-center justify-between border-b px-4 select-none cursor-pointer rounded-t-2xl"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
            onClick={() => composeMinimized && setComposeMinimized(false)}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xs font-bold" style={{ color: "var(--adm-text)" }}>
                {composeTitle}
              </span>
              {draftNotice && (
                <span className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>
                  · {draftNotice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setComposeMinimized((v) => !v)}
                aria-label={composeMinimized ? "Expand" : "Minimize"}
                title={composeMinimized ? "Expand" : "Minimize"}
                className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-adm-surface"
                style={{ color: "var(--adm-text-3)" }}
              >
                <Minus size={14} />
              </button>
              {!composeMinimized && (
                <button
                  type="button"
                  onClick={() => setComposeMaximized((v) => !v)}
                  aria-label={composeMaximized ? "Restore size" : "Maximize"}
                  title={composeMaximized ? "Restore size" : "Maximize"}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-adm-surface"
                  style={{ color: "var(--adm-text-3)" }}
                >
                  {composeMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setComposing(false);
                  setDraftNotice(null);
                }}
                aria-label="Save and close"
                title="Save draft and close"
                className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-adm-red-light hover:text-adm-red"
                style={{ color: "var(--adm-text-3)" }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Composer Body (rendered only when not minimized) */}
          {!composeMinimized && (
            <form onSubmit={handleSend} className="flex min-h-0 flex-1 flex-col">
              {/* Top Fields */}
              <div className="space-y-1.5 border-b p-4 text-xs" style={{ borderColor: "var(--adm-border)" }}>
                {/* From Field */}
                <div className="flex items-center gap-2 py-0.5 text-xs">
                  <span className="w-12 font-semibold" style={{ color: "var(--adm-text-3)" }}>
                    From
                  </span>
                  <span className="truncate font-medium" style={{ color: "var(--adm-text)" }}>
                    {active?.primaryAddress}
                  </span>
                </div>

                {/* To Field */}
                <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: "var(--adm-border)" }}>
                  <span className="w-12 font-semibold" style={{ color: "var(--adm-text-3)" }}>
                    To
                  </span>
                  <input
                    type="text"
                    required
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Recipients (comma-separated)"
                    className="flex-1 bg-transparent text-xs outline-none"
                    style={{ color: "var(--adm-text)" }}
                  />
                  <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--adm-blue)" }}>
                    {!showCc && (
                      <button type="button" onClick={() => setShowCc(true)} className="hover:underline">
                        Cc
                      </button>
                    )}
                    {!showBcc && (
                      <button type="button" onClick={() => setShowBcc(true)} className="hover:underline">
                        Bcc
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Cc Field */}
                {showCc && (
                  <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: "var(--adm-border)" }}>
                    <span className="w-12 font-semibold" style={{ color: "var(--adm-text-3)" }}>
                      Cc
                    </span>
                    <input
                      type="text"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="Carbon copy recipients"
                      className="flex-1 bg-transparent text-xs outline-none"
                      style={{ color: "var(--adm-text)" }}
                    />
                  </div>
                )}

                {/* Optional Bcc Field */}
                {showBcc && (
                  <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: "var(--adm-border)" }}>
                    <span className="w-12 font-semibold" style={{ color: "var(--adm-text-3)" }}>
                      Bcc
                    </span>
                    <input
                      type="text"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="Blind carbon copy recipients"
                      className="flex-1 bg-transparent text-xs outline-none"
                      style={{ color: "var(--adm-text)" }}
                    />
                  </div>
                )}

                {/* Subject Field */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="w-12 font-semibold" style={{ color: "var(--adm-text-3)" }}>
                    Subject
                  </span>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="flex-1 bg-transparent font-medium outline-none"
                    style={{ color: "var(--adm-text)" }}
                  />
                </div>
              </div>

              {/* Error Alert */}
              {sendError && (
                <div
                  className="mx-4 mt-2 flex items-center gap-2 rounded-xl border p-2.5 text-xs"
                  style={{
                    borderColor: "var(--adm-red)",
                    background: "var(--adm-red-light)",
                    color: "var(--adm-red)",
                  }}
                >
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Message Textarea */}
              <textarea
                required
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Write your email here…"
                className="flex-1 resize-none bg-transparent p-4 text-xs leading-relaxed outline-none"
                style={{ color: "var(--adm-text)" }}
              />

              {/* Schedule Send Sub-bar if toggled */}
              {showSchedule && (
                <div
                  className="flex items-center gap-2 border-t px-4 py-2 text-xs"
                  style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
                >
                  <CalendarClock size={14} style={{ color: "var(--adm-blue)" }} />
                  <span className="font-semibold" style={{ color: "var(--adm-text)" }}>
                    Send Later:
                  </span>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={toLocalInputValue(new Date())}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="rounded-lg border bg-transparent px-2 py-1 text-xs outline-none"
                    style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                  />
                  <button
                    type="button"
                    onClick={handleSchedule}
                    disabled={scheduling || !scheduledAt}
                    className="btn-press ml-auto rounded-full px-3 py-1 text-xs font-bold text-white transition disabled:opacity-50"
                    style={{ background: "var(--adm-blue)" }}
                  >
                    {scheduling ? <Loader2 size={12} className="animate-spin" /> : "Schedule"}
                  </button>
                </div>
              )}

              {/* Compose Bottom Toolbar */}
              <div
                className="flex shrink-0 items-center justify-between border-t px-4 py-3"
                style={{ borderColor: "var(--adm-border)" }}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-press flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold tracking-wide text-white transition hover:opacity-95 disabled:opacity-50"
                    style={{ background: "var(--adm-blue)" }}
                  >
                    {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>{sending ? "Sending…" : "Send"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSchedule((v) => !v)}
                    title="Schedule send for later"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition hover:bg-adm-surface-2 ${
                      showSchedule ? "border-adm-blue text-adm-blue" : ""
                    }`}
                    style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-3)" }}
                  >
                    <CalendarClock size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      dropDraft(draftId);
                      setComposing(false);
                      setNotice("Draft discarded.");
                    }}
                    title="Discard draft"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-adm-red-light hover:text-adm-red"
                    style={{ color: "var(--adm-text-3)" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
