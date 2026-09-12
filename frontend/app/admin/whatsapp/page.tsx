"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Send,
  Check,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Trash2,
  Bot,
  GitBranch,
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
  SmilePlus,
  CornerUpLeft,
  Mic,
  X,
  Briefcase,
  LifeBuoy,
  Plus,
  List,
  ArrowRight,
  MapPin,
  ExternalLink,
  Shield,
  Copy,
  Info,
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
import CommunicationsBanner from "@/components/portal/CommunicationsBanner";
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
  useWhatsAppNumbers,
  useWhatsAppFlow,
  useSaveWhatsAppFlow,
  useResetWhatsAppFlow,
  describeNumber,
} from "@/hooks/useWhatsApp";
import type {
  WAMessage,
  AutoReplyRule,
  WATemplate,
  MetaTemplate,
  MediaKind,
  ConvMeta,
  WANumberInfo,
  FlowStep,
} from "@/hooks/useWhatsApp";
import { useVoiceRecorder, formatDuration } from "@/hooks/useVoiceRecorder";
import { EmojiPicker, QUICK_REACTIONS } from "@/components/admin/whatsapp/EmojiPicker";
import { MessageMedia, mediaKindOf } from "@/components/admin/whatsapp/MessageMedia";
import { BUTTON_TEMPLATES } from "@/lib/button-templates";
import { countVariables } from "@/lib/meta-templates";

type MessageType = "text" | "media" | "buttons" | "list" | "template";
type TabKey = "inbox" | "pipeline" | "send" | "templates" | "rules" | "flow" | "stats" | "numbers";
type DealStatus = "new" | "contacted" | "negotiating" | "won" | "lost";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "inbox", label: "Inbox", icon: <MessageSquare size={16} /> },
  { key: "pipeline", label: "Pipeline", icon: <BarChart3 size={16} /> },
  { key: "send", label: "Send Message", icon: <Send size={16} /> },
  { key: "templates", label: "Start Chat", icon: <Sparkles size={16} /> },
  { key: "rules", label: "Auto-Reply", icon: <Bot size={16} /> },
  { key: "flow", label: "Bot Flow", icon: <GitBranch size={16} /> },
  { key: "stats", label: "Stats", icon: <BarChart3 size={16} /> },
  { key: "numbers", label: "Phone Lines", icon: <Phone size={16} /> },
];

const GENERAL_DEAL_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Lead", color: "var(--adm-blue)", bgColor: "var(--adm-blue-light)" },
  { value: "contacted", label: "Contacted", color: "var(--adm-text-2)", bgColor: "var(--adm-surface-2)" },
  { value: "negotiating", label: "Negotiating", color: "var(--adm-amber)", bgColor: "var(--adm-amber-light)" },
  { value: "won", label: "Deal Won", color: "var(--adm-green)", bgColor: "var(--adm-green-light)" },
  { value: "lost", label: "Lost", color: "var(--adm-red)", bgColor: "var(--adm-red-light)" },
];

const SUPPORT_TICKET_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Ticket", color: "#059669", bgColor: "rgba(5, 150, 105, 0.12)" },
  { value: "contacted", label: "Investigating", color: "var(--adm-blue)", bgColor: "var(--adm-blue-light)" },
  { value: "negotiating", label: "In Progress", color: "var(--adm-amber)", bgColor: "var(--adm-amber-light)" },
  { value: "won", label: "Resolved", color: "var(--adm-green)", bgColor: "var(--adm-green-light)" },
  { value: "lost", label: "Closed", color: "var(--adm-text-3)", bgColor: "var(--adm-surface-2)" },
];

const DEAL_STATUSES = GENERAL_DEAL_STATUSES;

// ─── Helpers ────────────────────────────────────────────────────────────

type Conversation = {
  key: string;
  number: string;
  name: string;
  messages: WAMessage[];
  channel?: string;
  department: "general" | "support";
  dealStatus?: DealStatus;
  notes?: string;
  tags?: string[];
};

function numberOf(m: WAMessage): string {
  if (m.jid) return m.jid.split("@")[0].split(":")[0];
  const raw = m.direction === "inbound" ? m.from : m.to;
  return (raw || "unknown").replace(/[^0-9]/g, "") || "unknown";
}

/** Our own number on a message — stored explicitly, or the opposite side of it. */
function channelOf(m: WAMessage): string {
  return (m.channel || (m.direction === "inbound" ? m.to : m.from) || "").trim();
}

function cleanDigits(s?: string | null): string {
  return (s || "").replace(/[^0-9]/g, "");
}

/**
 * Does this message belong to `numberInfo` because it names it exactly?
 *
 * The webhook stamps every message with the Meta Phone Number ID it arrived on
 * (`m.channel`), and the numbers route lists those same ids. A Phone Number ID
 * is exact — so this is an equality test on the id (tolerant only of "+" and
 * spaces, via digit-cleaning) plus the human display number, and nothing
 * heuristic. Fuzzy suffix matching is exactly what used to bleed Line-2 traffic
 * onto Line 1, so there is intentionally none of it here.
 */
function messageDirectlyMatchesNumber(m: WAMessage, numberInfo: WANumberInfo): boolean {
  const ch = channelOf(m);
  if (!ch) return false;
  if (ch === numberInfo.id) return true;

  const chDigits = cleanDigits(ch);
  const idDigits = cleanDigits(numberInfo.id);
  if (chDigits && idDigits && chDigits === idDigits) return true;

  const displayDigits = cleanDigits(numberInfo.displayNumber);
  if (chDigits && displayDigits && chDigits === displayDigits) return true;
  if (numberInfo.displayNumber && ch === numberInfo.displayNumber) return true;

  return false;
}

function messageBelongsToChannel(
  m: WAMessage,
  numberInfo: WANumberInfo | undefined,
  allNumbers: WANumberInfo[]
): boolean {
  if (!numberInfo) return true;

  // 1. Check if directly matches target line
  if (messageDirectlyMatchesNumber(m, numberInfo)) return true;

  // 2. If it directly matches ANY OTHER configured line, it does not belong here
  const matchesAnotherLine = allNumbers.some((other) => {
    if (other.id === numberInfo.id) return false;
    return messageDirectlyMatchesNumber(m, other);
  });

  if (matchesAnotherLine) return false;

  // 3. Fallback: unlabelled or legacy messages belong to the primary line
  return !!numberInfo.primary;
}

/** Get the canonical sender number ID for a message or conversation */
function getLineForMessage(m: WAMessage, allNumbers: WANumberInfo[]): WANumberInfo | undefined {
  for (const n of allNumbers) {
    if (messageBelongsToChannel(m, n, allNumbers)) return n;
  }
  return allNumbers.find((n) => n.primary) || allNumbers[0];
}

/**
 * The lines to show in the inbox: the ones Meta confirmed (from the numbers
 * route) plus any Phone Number ID that appears on a stored message but is
 * missing from that list.
 *
 * The second half is the safety net for the bug this screen kept fighting: if
 * discovery ever misses a number — a stale token, a number on a WABA we don't
 * enumerate, a wrong id hard-coded as the fallback — its RECEIVED messages used
 * to vanish or leak onto Line 1. Now the id they actually arrived on becomes a
 * line of its own, so nothing an inbound message carries can be hidden. When
 * Meta later confirms that id, the two collapse into one (same id) and the
 * synthesized entry disappears.
 */
function withSeenChannels(
  apiNumbers: WANumberInfo[],
  messages: WAMessage[]
): WANumberInfo[] {
  const covers = (ch: string) => {
    const chDigits = cleanDigits(ch);
    return apiNumbers.some(
      (n) =>
        n.id === ch ||
        (chDigits && cleanDigits(n.id) === chDigits) ||
        (n.displayNumber ? cleanDigits(n.displayNumber) === chDigits : false)
    );
  };

  const extras: WANumberInfo[] = [];
  for (const m of messages) {
    // Only the explicit channel stamp is trustworthy as OUR line — the
    // to/from fallback is the customer's number on legacy rows.
    const ch = (m.channel || "").trim();
    if (!ch || covers(ch)) continue;
    if (extras.some((e) => e.id === ch || cleanDigits(e.id) === cleanDigits(ch))) continue;
    // An explicit channel stamp that Meta's discovered list does not include is
    // one of OUR lines that discovery missed — most often the second number,
    // whose real Phone Number ID differs from any hard-coded fallback. General
    // is the primary line alone, so any line that is not the primary is Support.
    // (We reach here only because `ch` matched no api number, primary included.)
    // Fall back to the old id/label heuristic only when no primary is known yet.
    const primaryKnown = apiNumbers.some((n) => n.primary);
    const isSupport =
      primaryKnown ||
      ch.toLowerCase().includes("support") ||
      ch === "1318810581311680";
    extras.push({
      id: ch,
      label: isSupport ? "Technical & Client Support" : `Line ${apiNumbers.length + extras.length + 1}`,
      primary: false,
      slot: 1,
      canSend: false,
      department: isSupport ? "support" : "general",
      displayNumber: null,
      error: "Received messages arrived on this number, but Meta has not confirmed it — replies may not send until it is configured.",
    });
  }
  return extras.length ? [...apiNumbers, ...extras] : apiNumbers;
}

/** Determine which department a message belongs to: "general" (Inquiries/Sales) or "support" (Client Support Desk) */
function getMessageDepartment(m: WAMessage, allNumbers: WANumberInfo[] = []): "general" | "support" {
  const line = getLineForMessage(m, allNumbers);
  if (line?.department) return line.department;
  if (line && (!line.primary || line.label.toLowerCase().includes("support"))) return "support";
  const ch = channelOf(m);
  if (
    ch.toLowerCase().includes("support") ||
    ch === "1318810581311680"
  ) {
    return "support";
  }
  return "general";
}

/**
 * Group messages into conversations, newest activity first.
 * Conversations are strictly partitioned by department (${dept}_${number}),
 * ensuring General Inquiries and Client Support never bleed messages, notes, or deal stages.
 */
function groupConversations(
  messages: WAMessage[],
  allNumbers: WANumberInfo[] = [],
  filterDepartment?: "general" | "support"
): Conversation[] {
  const byKey = new Map<string, Conversation>();
  for (const m of messages) {
    const dept = getMessageDepartment(m, allNumbers);
    if (filterDepartment && dept !== filterDepartment) continue;
    const number = numberOf(m);
    const key = `${dept}_${number}`;
    let conv = byKey.get(key);
    if (!conv) {
      conv = {
        key,
        number,
        name: number,
        messages: [],
        department: dept,
        dealStatus: "new",
        notes: "",
        tags: [],
      };
      byKey.set(key, conv);
    }
    if (m.direction === "inbound" && m.name && m.name !== number) conv.name = m.name;
    conv.messages.push(m);
  }
  const convos = [...byKey.values()];
  for (const c of convos) {
    c.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const last = c.messages.at(-1);
    const line = last ? getLineForMessage(last, allNumbers) : undefined;
    c.channel = line?.id || channelOf(last!) || undefined;
  }
  convos.sort((a, b) => {
    const at = a.messages.at(-1) ? new Date(a.messages.at(-1)!.timestamp).getTime() : 0;
    const bt = b.messages.at(-1) ? new Date(b.messages.at(-1)!.timestamp).getTime() : 0;
    return bt - at;
  });
  return convos;
}

// ─── Page ───────────────────────────────────────────────────────────────

/**
 * Which of the business's numbers a message goes out as.
 *
 * Rendered only when there is more than one — a picker with a single option is
 * noise, and until the account had a second number there was nothing to choose.
 */
function SenderPicker({
  numbers,
  value,
  onChange,
  id = "waSender",
  label = "Send from",
}: {
  numbers: WANumberInfo[];
  value: string;
  onChange: (id: string) => void;
  id?: string;
  label?: string;
}) {
  if (numbers.length < 2) return null;
  const chosen = numbers.find((n) => n.id === value);

  return (
    <AdminField label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={adminInputClass}
        style={adminInputStyle}
      >
        {numbers.map((n) => (
          <option key={n.id} value={n.id}>
            {describeNumber(n)}
            {n.canSend ? "" : " — not sending"}
          </option>
        ))}
      </select>
      {chosen && !chosen.canSend && (
        <p className="mt-2 text-xs" style={{ color: "var(--adm-red, #dc2626)" }}>
          {chosen.error || "Meta will not accept a message from this number."}
        </p>
      )}
    </AdminField>
  );
}

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("inbox");
  const [department, setDepartment] = useState<"general" | "support">("general");
  const [prefillRecipient, setPrefillRecipient] = useState<string | null>(null);
  const [prefillSender, setPrefillSender] = useState<string | null>(null);
  const [selectedChatRecipient, setSelectedChatRecipient] = useState<string | null>(null);

  const { data: numbersData } = useWhatsAppNumbers();
  const { data: messagesData } = useWhatsAppMessages();
  const { data: metaData } = useConversationMeta();

  const apiNumbers = numbersData?.data ?? [];
  const allMessages = messagesData?.data ?? [];
  const metaMap = metaData?.data ?? {};

  const numbers = withSeenChannels(apiNumbers, allMessages);

  const generalLine = numbers.find((n) => n.department === "general" || n.primary) || numbers[0];
  const supportLine = numbers.find((n) => n.department === "support" || (!n.primary && numbers.length > 1));

  const activeLine = department === "general" ? generalLine : (supportLine || generalLine);

  const generalConvs = groupConversations(allMessages, numbers, "general");
  const supportConvs = groupConversations(allMessages, numbers, "support");

  const generalUnreads = generalConvs.reduce((acc, c) => acc + (unreadCount(c, metaMap[c.key] || metaMap[c.number]) > 0 ? 1 : 0), 0);
  const supportUnreads = supportConvs.reduce((acc, c) => acc + (unreadCount(c, metaMap[c.key] || metaMap[c.number]) > 0 ? 1 : 0), 0);

  const goReply = (number: string) => {
    setPrefillRecipient(number);
    setPrefillSender(activeLine?.id);
    setActiveTab("send");
  };

  const goSendFrom = (senderId: string) => {
    const matchedNumber = numbers.find((n) => n.id === senderId);
    if (matchedNumber?.department) {
      setDepartment(matchedNumber.department);
    }
    setPrefillSender(senderId);
    setActiveTab("send");
  };

  const openChatInInbox = (recipient: string, channelId?: string) => {
    if (channelId) {
      const line = numbers.find((n) => n.id === channelId);
      if (line?.department) {
        setDepartment(line.department);
      }
    }
    setSelectedChatRecipient(recipient);
    setActiveTab("inbox");
  };

  return (
    <div className="flex flex-col gap-6">
      <CommunicationsBanner active="whatsapp" />
      <AdminPageHeader
        title="WhatsApp Business Manager"
        description="Isolated multi-channel operations: General Inquiries & Corporate Sales vs Technical Support Desk"
      />

      {/* Department Isolation Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {/* General Inquiries & Sales */}
        <button
          type="button"
          onClick={() => {
            setDepartment("general");
            setSelectedChatRecipient(null);
          }}
          className={`relative p-4 rounded-none border text-left transition flex items-start justify-between ${
            department === "general"
              ? "bg-adm-surface border-adm-blue ring-2 ring-adm-blue/30 shadow-sm"
              : "bg-adm-surface-2 border-adm-border hover:border-adm-text-3 opacity-75 hover:opacity-100"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none font-bold ${
                department === "general"
                  ? "bg-adm-blue text-white"
                  : "bg-adm-surface text-adm-text-2 border border-adm-border"
              }`}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-adm-text">General Inquiries & Sales</h3>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-adm-blue-light text-adm-blue">
                  <span className="h-1.5 w-1.5 rounded-full bg-adm-blue" />
                  Line 1
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-adm-text-2 mt-0.5">
                {generalLine?.displayNumber || "+92 333 56701199"}
              </p>
              <p className="text-xs text-adm-text-3 mt-1">
                Corporate inquiries, sales proposals, partnerships & business quotes
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none ${
                department === "general"
                  ? "bg-adm-blue text-white"
                  : "text-adm-text-3"
              }`}
            >
              {department === "general" ? "Active Department" : "Switch to General"}
            </span>
            <span className="text-xs text-adm-text-3">
              {generalConvs.length} conversations {generalUnreads > 0 && `• ${generalUnreads} unread`}
            </span>
          </div>
        </button>

        {/* Technical & Client Support */}
        <button
          type="button"
          onClick={() => {
            setDepartment("support");
            setSelectedChatRecipient(null);
          }}
          className={`relative p-4 rounded-none border text-left transition flex items-start justify-between ${
            department === "support"
              ? "bg-adm-surface border-emerald-600 ring-2 ring-emerald-600/30 shadow-sm"
              : "bg-adm-surface-2 border-adm-border hover:border-adm-text-3 opacity-75 hover:opacity-100"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none font-bold ${
                department === "support"
                  ? "bg-emerald-600 text-white"
                  : "bg-adm-surface text-adm-text-2 border border-adm-border"
              }`}
            >
              <LifeBuoy size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-adm-text">Technical & Client Support</h3>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Line 2
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-adm-text-2 mt-0.5">
                {supportLine?.displayNumber || "Online Desk"}
              </p>
              <p className="text-xs text-adm-text-3 mt-1">
                24/7 client helpdesk, SLA incident handling & technical issue reports
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none ${
                department === "support"
                  ? "bg-emerald-600 text-white"
                  : "text-adm-text-3"
              }`}
            >
              {department === "support" ? "Active Department" : "Switch to Support"}
            </span>
            <span className="text-xs text-adm-text-3">
              {supportConvs.length} conversations {supportUnreads > 0 && `• ${supportUnreads} unread`}
            </span>
          </div>
        </button>
      </div>

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
              borderColor: activeTab === tab.key ? (department === "support" ? "#059669" : "var(--adm-blue)") : "transparent",
              color: activeTab === tab.key ? (department === "support" ? "#059669" : "var(--adm-blue)") : "var(--adm-text-2)",
              marginBottom: "-1px",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "inbox" && (
        <InboxTab
          department={department}
          activeLine={activeLine}
          onReply={goReply}
          selectedRecipient={selectedChatRecipient}
          onClearSelectedRecipient={() => setSelectedChatRecipient(null)}
        />
      )}
      {activeTab === "pipeline" && (
        <PipelineTab
          department={department}
          onOpenChat={openChatInInbox}
        />
      )}
      {activeTab === "send" && (
        <SendTab
          key={`${department}_${prefillRecipient ?? "blank"}_${prefillSender ?? "default"}`}
          department={department}
          defaultRecipient={prefillRecipient ?? ""}
          defaultSender={prefillSender ?? activeLine?.id}
          onSent={(recipient, senderId) => {
            setPrefillRecipient(null);
            setPrefillSender(null);
            if (recipient) {
              openChatInInbox(recipient, senderId);
            }
          }}
        />
      )}
      {activeTab === "templates" && (
        <MetaTemplatesTab key={department} department={department} defaultRecipient={prefillRecipient ?? ""} />
      )}
      {activeTab === "rules" && <RulesTab key={department} department={department} />}
      {activeTab === "flow" && <FlowTab key={department} department={department} onDepartmentChange={setDepartment} />}
      {activeTab === "stats" && <StatsTab department={department} />}
      {activeTab === "numbers" && <NumbersTab department={department} onSendFrom={goSendFrom} />}
    </div>
  );
}

// ─── Inbox ──────────────────────────────────────────────────────────────

// Inbox palette — reskinned onto the admin BMW token system (blue accent,
// square structure, hairline depth). No WhatsApp green; themes via --adm-*.
const WA = {
  panel: "var(--adm-surface-2)", // header bars, composer, app chrome
  panelBorder: "var(--adm-border)",
  listBg: "var(--adm-surface)", // chat-list background
  chatBg: "var(--adm-bg)", // conversation canvas (flat, no wallpaper)
  out: "var(--adm-blue-light)", // outgoing bubble
  outTail: "var(--adm-blue-light)",
  in: "var(--adm-surface)", // incoming bubble
  green: "var(--adm-blue)", // primary accent / send
  headerGreen: "var(--adm-blue-mid)",
  badge: "var(--adm-blue)", // unread count badge
  tick: "var(--adm-blue)", // read ✓✓
  tickGrey: "var(--adm-text-3)", // sent/delivered ✓
  text: "var(--adm-text)", // primary text
  sub: "var(--adm-text-3)", // secondary text / timestamps
  icon: "var(--adm-text-2)", // header icons
  divider: "var(--adm-border)",
  datePill: "var(--adm-surface-2)",
  dateText: "var(--adm-text-3)",
  e2e: "var(--adm-amber-light)", // encryption notice pill
  e2eText: "var(--adm-text-3)",
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
  contacts: "👤 Contact Card",
  reaction: "💬 Reaction",
  interactive: "🔘 Interactive Button",
  nfm_reply: "📋 Form Response",
  order: "🛒 Catalog Order",
  system: "⚙️ System Notice",
  unsupported: "⚠️ Unsupported Message",
  otp: "🔐 Verification Code",
};

/**
 * Readable text for a message. Media, stickers, contacts, and other non-text types are
 * mapped to informative descriptions instead of rendering blank or cryptic labels.
 */
function describeMessage(m: WAMessage) {
  if (m.unsupportedReason) return `⚠️ ${m.unsupportedReason}`;
  const body = (m.body || "").trim();
  if (m.type === "unsupported" || body.toLowerCase().includes("unsupported message")) {
    if (m.errorDetails) return `⚠️ Unsupported format (${m.errorDetails})`;
    if (m.errorCode) return `⚠️ Unsupported format (Code ${m.errorCode})`;
    return "⚠️ Unsupported format (Call / External OTP)";
  }
  if (body) return body;
  if (m.contactsData && m.contactsData.length > 0) {
    const c = m.contactsData[0];
    return `👤 Contact: ${c.name}${c.phones?.length ? ` (${c.phones[0]})` : ""}`;
  }
  if (m.locationData) {
    return `📍 Location: ${[m.locationData.name, m.locationData.address].filter(Boolean).join(", ") || "Shared location"}`;
  }
  if (m.systemData) {
    return `⚙️ System: ${m.systemData.body || m.systemData.type || "System notice"}`;
  }
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
            className="shrink-0 rounded-nonep-2"
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

function InboxTab({
  department = "general",
  activeLine,
  onReply,
  selectedRecipient,
  onClearSelectedRecipient,
}: {
  department?: "general" | "support";
  activeLine?: WANumberInfo;
  onReply: (number: string) => void;
  selectedRecipient?: string | null;
  onClearSelectedRecipient?: () => void;
}) {
  const { data, isLoading, isError, refetch } = useWhatsAppMessages();
  const { data: metaData } = useConversationMeta();
  const { data: numbersData } = useWhatsAppNumbers();
  const updateMeta = useUpdateConversationMeta();
  const deleteConv = useDeleteConversation();

  const metaMap = metaData?.data ?? {};
  const apiNumbers = numbersData?.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<string | null>(selectedRecipient || null);

  useEffect(() => {
    if (selectedRecipient) {
      setSelected(selectedRecipient);
      if (onClearSelectedRecipient) onClearSelectedRecipient();
    }
  }, [selectedRecipient, onClearSelectedRecipient]);

  if (isLoading) return <AdminLoadingState label="Loading conversations…" />;
  if (isError)
    return <AdminErrorState message="Could not load messages. Check your WhatsApp configuration." />;

  const allMessages = data?.data ?? [];
  const numbers = withSeenChannels(apiNumbers, allMessages);

  // Group and strictly isolate conversations by department
  const conversations = groupConversations(allMessages, numbers, department);

  const withMeta = conversations.map((conv) => {
    const meta = metaMap[conv.key] || (conv.department === "general" ? metaMap[conv.number] : undefined);
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
    .filter((x) => {
      if (x.meta?.snoozedUntil && new Date(x.meta.snoozedUntil) > new Date()) return false;
      return true;
    })
    .filter((x) => (filter === "unread" ? x.unread > 0 : true))
    .sort((a, b) => Number(!!b.meta?.pinned) - Number(!!a.meta?.pinned));
  const list = showArchived ? archivedList : activeList;

  const selectedConv = selected
    ? withMeta.find((x) => x.conv.key === selected || x.conv.number === selected) || null
    : null;

  const patch = (key: string, p: Partial<ConvMeta>) =>
    updateMeta.mutate({ key, patch: p });

  const handleDelete = (number: string, key: string) => {
    if (!confirm("Delete this entire conversation? This removes its messages from your inbox.")) return;
    deleteConv.mutate({ number, key });
    if (selected === key || selected === number) setSelected(null);
  };

  const totalUnread = activeList.reduce((n, x) => n + (x.unread > 0 ? 1 : 0), 0);

  const lineName = (n: WANumberInfo): string => {
    if (n.primary) return "Line 1 (General)";
    return "Line 2 (Support)";
  };

  type ChannelTagInfo = { label: string; isPrimary: boolean; displayNumber?: string };
  const channelTag = (conv: Conversation): ChannelTagInfo | undefined => {
    if (conv.department === "support") {
      return {
        label: "Line 2 (Support)",
        isPrimary: false,
        displayNumber: "Support Desk",
      };
    }
    return {
      label: "Line 1 (General)",
      isPrimary: true,
      displayNumber: "+92 333 56701199",
    };
  };

  return (
    <div
      className="flex overflow-hidden rounded-none border"
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
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[15px] font-bold truncate" style={{ color: WA.text }}>
              {department === "general" ? "General Inquiries" : "Client Support Desk"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                department === "general"
                  ? "bg-adm-blue-light text-adm-blue"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              }`}
            >
              {department === "general" ? "+92 333 56701199" : "Support Desk"}
            </span>
          </div>
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
              placeholder="Search conversations..."
              className="w-full rounded-none border-0 py-[7px] pl-12 pr-3 text-[14px] outline-none"
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
                    background: on ? (department === "support" ? "rgba(5, 150, 105, 0.15)" : "var(--adm-blue-light)") : WA.panel,
                    color: on ? (department === "support" ? "#059669" : "var(--adm-blue-mid)") : WA.sub,
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
          <Archive size={18} style={{ color: department === "support" ? "#059669" : WA.green }} />
          <span className="font-normal">{showArchived ? "Back to chats" : "Archived"}</span>
          {!showArchived && archivedList.length > 0 && (
            <span className="ml-auto text-[13px] font-medium" style={{ color: department === "support" ? "#059669" : WA.green }}>
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
                    : department === "general"
                      ? "No General Inquiries yet. When customers message the corporate number, they appear here."
                      : "No Support Tickets yet. When clients reach out to the support desk, they appear here."}
            </div>
          ) : (
            list.map(({ conv, meta, unread }) => (
              <ChatListItem
                key={conv.key}
                conv={conv}
                meta={meta}
                unread={unread}
                channel={channelTag(conv)}
                active={selected === conv.key || selected === conv.number}
                onClick={() => setSelected(conv.key)}
              />
            ))
          )}
        </div>
      </aside>

      {/* RIGHT: conversation */}
      <section className={`${selected ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedConv ? (
          <ChatView
            key={`${selectedConv.conv.key}_${department}`}
            conv={selectedConv.conv}
            meta={selectedConv.meta}
            department={department}
            channelId={activeLine?.id}
            onBack={() => setSelected(null)}
            onMarkRead={() => patch(selectedConv.conv.key, { lastReadAt: new Date().toISOString() })}
            onMarkUnread={() => {
              patch(selectedConv.conv.key, { lastReadAt: new Date(0).toISOString() });
              setSelected(null);
            }}
            onTogglePin={() => patch(selectedConv.conv.key, { pinned: !selectedConv.meta?.pinned })}
            onToggleArchive={() => {
              patch(selectedConv.conv.key, { archived: !selectedConv.meta?.archived });
              setSelected(null);
            }}
            onDelete={() => handleDelete(selectedConv.conv.number, selectedConv.conv.key)}
            onSaveMeta={(p) => patch(selectedConv.conv.key, p)}
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
      <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full" style={{ background: "var(--adm-surface-2)" }}>
        <MessageSquare size={96} strokeWidth={1} style={{ color: "var(--adm-text-3)" }} />
      </div>
      <p className="text-[32px] font-light" style={{ color: "var(--adm-text-2)" }}>
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
  channel,
  active,
  onClick,
}: {
  conv: Conversation;
  meta?: ConvMeta;
  unread: number;
  /** Label of the number this thread is on; only set when the business has two. */
  channel?: { label: string; isPrimary: boolean; displayNumber?: string } | string;
  active: boolean;
  onClick: () => void;
}) {
  const name = meta?.name || (conv.name !== conv.number ? conv.name : `+${conv.number}`);
  const last = conv.messages.at(-1);
  const statuses = conv.department === "support" ? SUPPORT_TICKET_STATUSES : GENERAL_DEAL_STATUSES;
  const dealCfg = statuses.find((s) => s.value === meta?.dealStatus);
  const preview = lastPreview(conv);
  const outbound = last?.direction === "outbound";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 pl-3 pr-4 text-left transition hover:bg-black/[0.03]"
      style={{ background: active ? "var(--adm-surface-2)" : "transparent" }}
    >
      <div
        className="flex h-[49px] w-[49px] shrink-0 items-center justify-center self-center rounded-full text-[17px] font-medium text-white"
        style={{ background: conv.department === "support" ? "#059669" : "var(--adm-blue)" }}
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
            {channel && (
              <span
                className={`rounded-nonepx-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                  typeof channel === "object" && channel.isPrimary
                    ? "bg-adm-blue-light text-adm-blue border border-adm-blue"
                    : typeof channel === "object"
                    ? "bg-adm-surface-2 text-adm-text-2 border border-adm-border-2"
                    : "bg-adm-surface-2 text-adm-text-2 border border-adm-border"
                }`}
                title={
                  typeof channel === "object"
                    ? `WhatsApp ${channel.label}${channel.displayNumber ? ` (${channel.displayNumber})` : ""}`
                    : `Received on ${channel}`
                }
              >
                {typeof channel === "object" ? channel.label : channel}
              </span>
            )}
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
  channelId,
  department = "general",
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
  channelId?: string;
  department?: "general" | "support";
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
  const { data: numbersData } = useWhatsAppNumbers();
  const numbers = numbersData?.data ?? [];

  // Determine sender line ID strictly scoped to this conversation's department
  const defaultSenderId = useMemo(() => {
    if (channelId && numbers.some((n) => n.id === channelId)) return channelId;
    const currentDept = conv.department || department;
    const deptLine = numbers.find((n) => n.department === currentDept);
    if (deptLine) return deptLine.id;
    if (currentDept === "support") {
      const s = numbers.find((n) => !n.primary) || numbers[0];
      return s?.id || "";
    }
    return numbers.find((n) => n.primary)?.id || numbers[0]?.id || "";
  }, [channelId, conv.department, department, numbers]);

  const [activeSenderId, setActiveSenderId] = useState<string>(defaultSenderId);

  useEffect(() => {
    setActiveSenderId(defaultSenderId);
  }, [defaultSenderId]);

  const sender = activeSenderId || defaultSenderId;
  const senderInfo = numbers.find((n) => n.id === sender);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  /** The message the next send will quote, set by a bubble's Reply action. */
  const [replyTo, setReplyTo] = useState<WAMessage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voice = useVoiceRecorder();

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

  /** Newest inbound message, so a send can double as a read receipt. */
  const lastInboundId = conv.messages.filter((m) => m.direction === "inbound").at(-1)?.id;

  const handleReply = async () => {
    if (!reply.trim()) return;
    setError("");
    try {
      await sendMessage.mutateAsync({
        type: "text",
        to: conv.number,
        from: sender,
        message: reply,
        replyTo: replyTo?.id,
        markReadMessageId: lastInboundId,
      });
      setReply("");
      setReplyTo(null);
    } catch (e: any) {
      setError(e.message || "Failed to send");
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const up = await uploadWhatsAppMedia(file, sender);
      await sendMessage.mutateAsync({
        type: "media",
        to: conv.number,
        from: up.from ?? sender,
        mediaType: up.mediaType,
        mediaId: up.id,
        caption: reply.trim() || undefined,
        filename: up.mediaType === "document" ? up.filename : undefined,
        replyTo: replyTo?.id,
        markReadMessageId: lastInboundId,
      });
      setReply("");
      setReplyTo(null);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /** Finish a recording and send it as a WhatsApp voice note. */
  const handleVoiceSend = async () => {
    setError("");
    let recording;
    try {
      recording = await voice.stop();
    } catch {
      setError("Could not finish the recording");
      return;
    }
    if (!recording) {
      setError("Nothing was recorded — hold on a moment longer.");
      return;
    }
    setUploading(true);
    try {
      const up = await uploadWhatsAppMedia(recording.file, sender);
      await sendMessage.mutateAsync({
        type: "media",
        to: conv.number,
        from: up.from ?? sender,
        mediaType: "audio",
        mediaId: up.id,
        // `voice: true` is what makes WhatsApp show a waveform instead of a file.
        voice: true,
        replyTo: replyTo?.id,
        markReadMessageId: lastInboundId,
      });
      setReplyTo(null);
    } catch (e: any) {
      setError(e.message || "Could not send the voice note");
    } finally {
      setUploading(false);
    }
  };

  const handleMicPress = async () => {
    if (voice.recording) {
      await handleVoiceSend();
      return;
    }
    const ok = await voice.start();
    if (!ok && voice.error) setError(voice.error);
  };

  /** Emoji reactions are their own message type on the Cloud API. */
  const handleReact = async (target: WAMessage, emoji: string) => {
    setError("");
    try {
      await sendMessage.mutateAsync({
        type: "reaction",
        to: conv.number,
        from: sender,
        reactionTo: target.id,
        emoji,
      });
    } catch (e: any) {
      setError(e.message || "Could not send the reaction");
    }
  };

  const insertEmoji = (emoji: string) => {
    setReply((current) => current + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  // Reactions are messages too; they belong on the bubble they point at rather
  // than in the flow. An empty emoji is WhatsApp's "reaction removed".
  const reactionsByTarget = new Map<string, string[]>();
  for (const m of conv.messages) {
    if (m.type !== "reaction" || !m.reactionTo) continue;
    const emoji = (m.body || "").trim();
    const current = reactionsByTarget.get(m.reactionTo) ?? [];
    reactionsByTarget.set(m.reactionTo, emoji ? [...current, emoji] : current);
  }
  const byId = new Map(conv.messages.map((m) => [m.id, m]));
  const visible = conv.messages.filter((m) => {
    if (m.type === "reaction") return false;
    if (showOnlyBookmarked && !meta?.bookmarkedMessages?.includes(m.id)) return false;
    if (searchQuery) {
      return (m.body || "").toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

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
            style={{ background: (conv.department || department) === "support" ? "#059669" : "var(--adm-blue)" }}
          >
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-medium" style={{ color: WA.text }}>
              {name}
            </p>
            <p className="truncate text-[13px]" style={{ color: WA.sub }}>
              {(conv.department || department) === "support" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  Technical Support Line • Support Desk
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-adm-blue">
                  <span className="h-1.5 w-1.5 rounded-full bg-adm-blue inline-block" />
                  General Inquiries Line • +92 333 56701199
                </span>
              )}
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
                  className="absolute right-0 z-20 mt-1 w-60 overflow-hidden rounded-none border border-adm-border bg-adm-surface py-2"
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

      {/* In-chat search bar */}
      {isSearching && (
        <div className="flex items-center gap-2 border-b px-4 py-2" style={{ background: "#fff", borderColor: WA.divider }}>
          <Search size={15} style={{ color: WA.sub }} />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this chat..."
            className="flex-1 border-none bg-transparent text-sm outline-none"
            style={{ color: WA.text }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} style={{ color: WA.sub }}>
              <X size={15} />
            </button>
          )}
        </div>
      )}

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
              <label className="mb-1 block text-xs font-semibold" style={{ color: "var(--adm-text-2)" }}>
                {(conv.department || department) === "support" ? "Support Ticket Status" : "Deal / Lead Status"}
              </label>
              <SelectWithCustom
                value={meta?.dealStatus || "new"}
                onChange={(v) => onSaveMeta({ dealStatus: v })}
                options={((conv.department || department) === "support" ? SUPPORT_TICKET_STATUSES : GENERAL_DEAL_STATUSES).map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
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
      <div className="flex-1 overflow-y-auto px-[5%] py-3 lg:px-[8%]">
        {/* End-to-end encryption notice */}
        <div className="mb-3 flex justify-center">
          <span
            className="flex max-w-lg items-center gap-1.5 rounded-none px-3 py-1.5 text-center text-[12.5px] leading-[18px]"
            style={{ background: WA.e2e, color: WA.e2eText }}
          >
            <Lock size={12} className="shrink-0" />
            Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
          </span>
        </div>

        {visible.map((msg, i) => {
          const prev = visible[i - 1];
          const showDate = !prev || dayKey(prev.timestamp) !== dayKey(msg.timestamp);
          // A "tail" (bubble beak) shows only on the first message of a run from
          // the same side, exactly like WhatsApp.
          const tail = showDate || !prev || prev.direction !== msg.direction;
          const msgLine = numbers.length > 1 ? getLineForMessage(msg, numbers) : undefined;
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="my-3 flex justify-center">
                  <span
                    className="rounded-none px-3 py-1 text-[12.5px] font-medium uppercase"
                    style={{ background: WA.datePill, color: WA.dateText }}
                  >
                    {formatDateDivider(msg.timestamp)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={msg}
                tail={tail}
                quoted={msg.replyTo ? byId.get(msg.replyTo) : undefined}
                reactions={reactionsByTarget.get(msg.id)}
                onReply={setReplyTo}
                onReact={handleReact}
                lineBadge={msgLine ? (msgLine.primary ? "Line 1" : "Line 2") : undefined}
                isPrimaryLine={msgLine?.primary}
              />
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

      {/* Reply target — what the next message will quote */}
      {replyTo && (
        <div
          className="flex items-start gap-2 border-t px-4 pt-2"
          style={{ background: WA.panel, borderColor: WA.divider }}
        >
          <div className="min-w-0 flex-1">
            <QuotedPreview quoted={replyTo} outbound={false} />
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: WA.icon }}
            aria-label="Cancel reply"
            title="Cancel reply"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Active Department Sending Line Indicator */}
      <div
        className="flex items-center justify-between border-t px-4 py-1.5 text-xs"
        style={{ background: WA.panel, borderColor: WA.divider }}
      >
        <div className="flex items-center gap-2">
          <span className="text-adm-text-3 font-medium">Replying via:</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              (conv.department || department) === "support"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-adm-blue-light text-adm-blue"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                (conv.department || department) === "support" ? "bg-emerald-500" : "bg-adm-blue"
              }`}
            />
            {(conv.department || department) === "support"
              ? "Support Desk"
              : "General Inquiries (+92 333 56701199)"}
          </span>
        </div>
      </div>

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

        {voice.recording ? (
          /* Recording: the composer becomes cancel · level · timer · send. */
          <>
            <button
              type="button"
              onClick={voice.cancel}
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
              style={{ color: "var(--adm-red)" }}
              aria-label="Discard recording"
              title="Discard recording"
            >
              <Trash2 size={20} />
            </button>
            <div className="mb-1 flex h-10 flex-1 items-center gap-3 rounded-none px-3" style={{ background: "#fff" }}>
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full" style={{ background: "var(--adm-red)" }} />
              <span className="text-[15px] tabular-nums" style={{ color: WA.text }}>
                {formatDuration(voice.seconds)}
              </span>
              {/* Live input level, so it's obvious the mic is picking sound up. */}
              <span className="flex h-6 flex-1 items-center gap-[3px]" aria-hidden>
                {Array.from({ length: 22 }).map((_, i) => {
                  const reach = Math.max(0.12, voice.level * (0.55 + 0.45 * Math.sin(i * 1.7)));
                  return (
                    <span
                      key={i}
                      className="w-[3px] rounded-full transition-[height] duration-100"
                      style={{ height: `${Math.round(4 + reach * 18)}px`, background: WA.green, opacity: 0.85 }}
                    />
                  );
                })}
              </span>
              <span className="shrink-0 text-[11.5px]" style={{ color: WA.sub }}>
                {voice.seconds >= voice.maxSeconds ? "max length" : "recording…"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleVoiceSend}
              disabled={uploading || sendMessage.isPending}
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
              style={{ background: WA.green, color: "#fff" }}
              aria-label="Send voice message"
              title="Send voice message"
            >
              <Send size={20} />
            </button>
          </>
        ) : (
          <>
            <div className="relative mb-1.5 flex h-6 shrink-0 items-center">
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                style={{ color: showEmoji ? WA.green : WA.icon }}
                aria-label="Emoji"
                aria-expanded={showEmoji}
                title="Emoji"
              >
                <Smile size={25} />
              </button>
              {showEmoji && <EmojiPicker onPick={insertEmoji} onClose={() => setShowEmoji(false)} />}
            </div>
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
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
                if (e.key === "Escape" && replyTo) setReplyTo(null);
              }}
              rows={1}
              placeholder={uploading ? "Uploading…" : replyTo ? "Reply…" : "Type a message"}
              className="max-h-28 flex-1 resize-none rounded-none border-0 px-4 py-2.5 text-[15px] outline-none"
              style={{ background: "#fff", color: WA.text }}
            />
            <button
              type="button"
              onClick={canSend ? handleReply : handleMicPress}
              disabled={sendMessage.isPending || uploading}
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
              style={{ color: WA.icon }}
              aria-label={canSend ? "Send" : "Record a voice message"}
              title={canSend ? "Send" : "Record a voice message"}
            >
              {canSend ? <Send size={22} style={{ color: WA.green }} /> : <Mic size={24} />}
            </button>
          </>
        )}
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
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-adm-surface-2"
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
  if (s === "failed") return <AlertCircle size={small ? 12 : 13} style={{ color: "var(--adm-red)" }} />;
  if (s === "read") return <CheckCheck size={sz} style={{ color: WA.tick }} />;
  if (s === "delivered") return <CheckCheck size={sz} style={{ color: WA.tickGrey }} />;
  if (s === "sent") return <Check size={sz} style={{ color: WA.tickGrey }} />;
  return <Clock size={small ? 11 : 12} style={{ color: WA.tickGrey }} />;
}

/** The quoted original shown above a reply, WhatsApp-style. */
function QuotedPreview({ quoted, outbound }: { quoted: WAMessage; outbound: boolean }) {
  const label = quoted.direction === "outbound" ? "You" : quoted.name || `+${numberOf(quoted)}`;
  const accent = quoted.direction === "outbound" ? WA.green : "var(--adm-blue)";
  return (
    <div
      className="mb-1 overflow-hidden rounded-none px-2 py-1"
      style={{
        background: outbound ? "var(--adm-blue-light)" : "var(--adm-surface-2)",
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <p className="truncate text-[12.5px] font-medium" style={{ color: accent }}>
        {label}
      </p>
      <p className="line-clamp-2 text-[12.5px]" style={{ color: WA.sub }}>
        {describeMessage(quoted) || "Message"}
      </p>
    </div>
  );
}

/** Reply + react affordances, revealed on hover over a bubble. */
function BubbleActions({
  message,
  onReply,
  onReact,
  align,
}: {
  message: WAMessage;
  onReply?: (m: WAMessage) => void;
  onReact?: (m: WAMessage, emoji: string) => void;
  align: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  if (!onReply && !onReact) return null;
  return (
    <span
      className={`relative flex shrink-0 items-center gap-0.5 transition-opacity ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      style={{ color: WA.icon }}
    >
      {onReply && (
        <button
          type="button"
          onClick={() => onReply(message)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-adm-surface-2 transition hover:bg-adm-surface"
          aria-label="Reply to this message"
          title="Reply"
        >
          <CornerUpLeft size={14} />
        </button>
      )}
      {onReact && (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-adm-surface-2 transition hover:bg-adm-surface"
            aria-label="React to this message"
            title="React"
          >
            <SmilePlus size={14} />
          </button>
          {open && (
            <>
              <span className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <span
                className={`absolute bottom-full z-40 mb-1 flex gap-0.5 rounded-full bg-adm-surface px-1.5 py-1 ${align === "right" ? "right-0" : "left-0"}`}
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(message, emoji);
                      setOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[19px] transition hover:bg-black/5"
                  >
                    {emoji}
                  </button>
                ))}
              </span>
            </>
          )}
        </>
      )}
    </span>
  );
}

function UnsupportedCard({
  message,
  onReply,
}: {
  message: WAMessage;
  onReply?: (m: WAMessage) => void;
}) {
  const reason =
    message.unsupportedReason ||
    (message.errorDetails ? `Unsupported format: ${message.errorDetails}` : "Unsupported WhatsApp Message Event");
  return (
    <div className="space-y-2 py-1 max-w-[340px]">
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-[13px] text-amber-900 dark:text-amber-200 shadow-xs">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1 min-w-0">
          <p className="font-semibold leading-tight text-amber-800 dark:text-amber-300">{reason}</p>
          <p className="text-[12px] leading-relaxed text-amber-700/90 dark:text-amber-200/80">
            Received in a format not directly supported by WhatsApp Cloud API (such as an incoming voice/video call, disappearing message toggle, poll vote, or external verification OTP).
          </p>
          {message.errorDetails && message.errorDetails !== reason && (
            <p className="font-mono text-[11px] text-amber-800/80 dark:text-amber-300/80">
              Details: {message.errorDetails} {message.errorCode ? `(Code ${message.errorCode})` : ""}
            </p>
          )}
        </div>
      </div>
      {onReply && message.direction === "inbound" && (
        <button
          type="button"
          onClick={() => onReply(message)}
          className="inline-flex items-center gap-1.5 rounded-md bg-adm-surface-2 px-2.5 py-1 text-[12px] font-medium text-adm-text-2 transition hover:bg-adm-border"
        >
          <CornerUpLeft size={13} />
          Reply to customer
        </button>
      )}
    </div>
  );
}

function ContactCard({
  contacts,
}: {
  contacts: Array<{ name?: string; phones?: string[]; emails?: string[]; org?: string }>;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copyText = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-2 py-1">
      {contacts.map((c, i) => (
        <div key={i} className="min-w-[240px] rounded-lg border border-adm-border/60 bg-adm-surface p-3 shadow-xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-adm-border/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-adm-blue/10 text-adm-blue font-bold">
              {initials(c.name || "C")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[14px] text-adm-text">{c.name || "Unnamed Contact"}</p>
              {c.org && <p className="truncate text-[12px] text-adm-text-3">{c.org}</p>}
            </div>
          </div>
          <div className="pt-2 space-y-1.5">
            {c.phones?.map((p, pi) => (
              <div key={pi} className="flex items-center justify-between gap-2 text-[12px]">
                <a
                  href={`tel:${p}`}
                  className="flex items-center gap-1.5 font-mono text-adm-blue hover:underline"
                >
                  <Phone size={12} />
                  <span>{p}</span>
                </a>
                <button
                  type="button"
                  onClick={() => copyText(p)}
                  className="p-1 text-adm-text-3 hover:text-adm-text transition"
                  title="Copy number"
                >
                  {copied === p ? <Check size={12} className="text-adm-green" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
            {c.emails?.map((e, ei) => (
              <div key={ei} className="flex items-center justify-between gap-2 text-[12px]">
                <a
                  href={`mailto:${e}`}
                  className="truncate text-adm-blue hover:underline"
                >
                  {e}
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationCard({
  location,
}: {
  location: { name?: string; address?: string; latitude?: number; longitude?: number; url?: string };
}) {
  const mapUrl =
    location.url ||
    (location.latitude && location.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : undefined);

  return (
    <div className="min-w-[220px] rounded-lg border border-adm-border/60 bg-adm-surface p-3 space-y-2">
      <div className="flex items-start gap-2">
        <MapPin size={18} className="mt-0.5 shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          {location.name && <p className="font-semibold text-[13.5px] text-adm-text">{location.name}</p>}
          {location.address && <p className="text-[12px] text-adm-text-2">{location.address}</p>}
          {location.latitude && location.longitude && (
            <p className="font-mono text-[11px] text-adm-text-3">
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </p>
          )}
        </div>
      </div>
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-adm-blue hover:underline"
        >
          <span>View on Google Maps</span>
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}

function OtpSnippet({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const match = text.match(/\b([0-9]{4,8})\b/);
  if (!match) return null;
  const code = match[1];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 flex items-center gap-2 rounded-md bg-adm-surface-2 p-1.5 border border-adm-border/50">
      <span className="font-mono text-[13px] font-bold tracking-wider text-adm-text px-1">
        {code}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="ml-auto inline-flex items-center gap-1 rounded bg-adm-blue/10 px-2 py-0.5 text-[11px] font-semibold text-adm-blue hover:bg-adm-blue/20 transition"
      >
        {copied ? <Check size={12} className="text-adm-green" /> : <Copy size={12} />}
        <span>{copied ? "Copied" : "Copy Code"}</span>
      </button>
    </div>
  );
}

function MessageBubble({
  message,
  tail,
  quoted,
  reactions,
  onReply,
  onReact,
  lineBadge,
  isPrimaryLine,
}: {
  message: WAMessage;
  tail?: boolean;
  /** The message this one replies to, resolved from `replyTo`. */
  quoted?: WAMessage;
  /** Emoji other people applied to this message. */
  reactions?: string[];
  onReply?: (m: WAMessage) => void;
  onReact?: (m: WAMessage, emoji: string) => void;
  lineBadge?: string;
  isPrimaryLine?: boolean;
}) {
  const isOutbound = message.direction === "outbound";
  const text = describeMessage(message);
  const mediaKind = mediaKindOf(message);
  const isSticker = mediaKind === "sticker";
  const framed = mediaKind === "image" || mediaKind === "video";
  const isUnsupported =
    message.type === "unsupported" ||
    !!message.unsupportedReason ||
    (!mediaKind && !message.body && !message.contactsData?.length && !message.locationData && message.type === "unsupported") ||
    (typeof message.body === "string" && message.body.toLowerCase().includes("unsupported message"));
  const isContact = (message.type === "contacts" || !!message.contactsData?.length) && !!message.contactsData?.length;
  const isLocation = (message.type === "location" || !!message.locationData) && !!message.locationData;
  // Stored media bodies read "[image] caption" — strip the label to get the caption.
  const captionText = (message.body || "").trim().replace(/^\[[a-z]+\]\s*/i, "");
  const hasCaption = !!mediaKind && !!captionText && captionText !== MEDIA_LABELS[message.type];
  const isPlaceholder = !mediaKind && !isUnsupported && !isContact && !isLocation && !(message.body || "").trim() && !MEDIA_LABELS[message.type];
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const baseSpacerLen = isOutbound ? 11 : 7;
  const spacerLen = lineBadge ? baseSpacerLen + 8 : baseSpacerLen;
  const spacer = "\u00A0".repeat(spacerLen);
  // Photos and videos float the timestamp over the media when there's no caption.
  const overMedia = framed && !hasCaption;
  
  return (
    <div
      className={`group flex items-center gap-1 ${isOutbound ? "justify-end" : "justify-start"} ${tail ? "mt-2.5" : "mt-0.5"} ${reactions?.length ? "mb-3" : ""}`}
    >
      {/* Hover actions sit outside the bubble so they never cover its text. */}
      {isOutbound && <BubbleActions message={message} onReply={onReply} onReact={onReact} align="right" />}
      <div
        className={`relative max-w-[65%] text-[14.2px] leading-[19px] ${framed ? "p-1" : isSticker ? "" : "px-[9px] pb-[8px] pt-[6px]"}`}
        style={{
          background: isSticker ? "transparent" : isOutbound ? WA.out : WA.in,
          color: WA.text,
          borderRadius: 7.5,
          boxShadow: isSticker ? "none" : "0 1px 0.5px rgba(11,20,26,0.13)",
          borderTopRightRadius: tail && isOutbound && !isSticker ? 0 : 7.5,
          borderTopLeftRadius: tail && !isOutbound && !isSticker ? 0 : 7.5,
        }}
      >
        {/* Little bubble beak */}
        {tail && !isSticker && (
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

        {quoted && <QuotedPreview quoted={quoted} outbound={isOutbound} />}

        {isUnsupported ? (
          <UnsupportedCard message={message} onReply={onReply} />
        ) : isContact ? (
          <ContactCard contacts={message.contactsData!} />
        ) : isLocation ? (
          <LocationCard location={message.locationData!} />
        ) : mediaKind ? (
          <MessageMedia
            message={message}
            outbound={isOutbound}
            caption={
              hasCaption ? (
                <div className="whitespace-pre-wrap break-words px-1 pb-0.5 pt-1">
                  {captionText}
                  <span aria-hidden style={{ display: "inline-block" }}>{spacer}</span>
                </div>
              ) : undefined
            }
          />
        ) : (
          <div>
            <span
              className="whitespace-pre-wrap break-words"
              style={isPlaceholder ? { fontStyle: "italic", color: WA.sub } : undefined}
            >
              {text || "—"}
              <span aria-hidden style={{ display: "inline-block" }}>
                {spacer}
              </span>
            </span>
            {message.body && /\b(otp|code|verification|passcode)\b/i.test(message.body) && (
              <OtpSnippet text={message.body} />
            )}
          </div>
        )}

        {/* Floated inline timestamp + ticks */}
        {!isSticker && (
          <span
            className={`pointer-events-none absolute bottom-[3px] right-[7px] flex items-center gap-1 ${overMedia ? "rounded-full bg-black/40 px-1.5 py-0.5 text-white" : ""}`}
            style={{ height: 15, bottom: overMedia ? 7 : 3, right: overMedia ? 9 : 7 }}
          >
            {lineBadge && (
              <span
                className={`rounded-nonepx-1 text-[9px] font-extrabold uppercase leading-tight tracking-wider ${
                  overMedia
                    ? "bg-adm-surface/20 text-white"
                    : isPrimaryLine
                    ? "bg-adm-blue-light text-adm-blue"
                    : "bg-adm-surface-2 text-adm-text-2"
                }`}
                title={isPrimaryLine ? "Line 1 (Primary)" : "Line 2 (Secondary)"}
              >
                {lineBadge === "Line 1" ? "L1" : lineBadge === "Line 2" ? "L2" : lineBadge}
              </span>
            )}
            <span
              className="text-[11px] leading-none"
              style={overMedia ? { color: "white" } : { color: WA.sub }}
            >
              {time}
            </span>
            {isOutbound && <Ticks status={message.status} small={true} />}
          </span>
        )}

        {/* Reactions ride the bubble's lower edge, as in WhatsApp. */}
        {!!reactions?.length && (
          <span
            className="absolute -bottom-3 flex items-center gap-0.5 rounded-full bg-adm-surface px-1.5 py-0.5 text-[12px]"
            style={{ [isOutbound ? "right" : "left"]: 6 } as React.CSSProperties}
          >
            {[...new Set(reactions)].slice(0, 3).map((emoji) => (
              <span key={emoji}>{emoji}</span>
            ))}
            {reactions.length > 1 && (
              <span className="text-[11px]" style={{ color: WA.sub }}>
                {reactions.length}
              </span>
            )}
          </span>
        )}
      </div>
      {!isOutbound && <BubbleActions message={message} onReply={onReply} onReact={onReact} align="left" />}
    </div>
  );
}

// ─── Send ───────────────────────────────────────────────────────────────

function SendTab({
  department = "general",
  defaultRecipient,
  defaultSender,
  onSent,
}: {
  department?: "general" | "support";
  defaultRecipient: string;
  defaultSender?: string;
  onSent?: (recipient?: string, senderId?: string) => void;
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
  const [lastSentInfo, setLastSentInfo] = useState<{ to: string; sender: string } | null>(null);

  // Media (task 3)
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const [mediaLink, setMediaLink] = useState("");
  const [mediaId, setMediaId] = useState("");
  /** The number an uploaded media id belongs to — Meta scopes ids per number. */
  const [mediaFrom, setMediaFrom] = useState("");
  const [mediaFileName, setMediaFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const sendMessage = useSendWhatsAppMessage();
  const { data: templatesData } = useWhatsAppTemplates();
  const templates: WATemplate[] = templatesData?.data ?? [];

  const { data: numbersData } = useWhatsAppNumbers();
  const numbers = numbersData?.data ?? [];
  const [senderChoice, setSenderChoice] = useState(defaultSender || "");
  
  const deptLine = numbers.find((n) => n.department === department);
  const fallbackSender = deptLine?.id || (department === "support" ? numbers.find((n) => !n.primary)?.id : numbers.find((n) => n.primary)?.id) || numbers[0]?.id || "";
  const sender = senderChoice || defaultSender || fallbackSender;

  const resetMedia = () => {
    setMediaLink("");
    setMediaId("");
    setMediaFrom("");
    setMediaFileName("");
    setCaption("");
  };

  const handleFileUpload = async (file: File) => {
    setSendError("");
    setUploading(true);
    try {
      const up = await uploadWhatsAppMedia(file, sender);
      setMediaId(up.id);
      setMediaFrom(up.from ?? sender);
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
      if (sender) payload.from = sender;

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
        // A media id only exists for the number it was uploaded against; sending
        // it from the other number fails inside Meta as "media id not found".
        if (mediaId && mediaFrom && sender && mediaFrom !== sender) {
          const label = describeNumber(numbers.find((n) => n.id === sender)) || sender;
          setSendError(`That file was uploaded for a different number. Upload it again for ${label}.`);
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
      setLastSentInfo({ to, sender });
      if (onSent) {
        onSent(to, sender);
      }

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
      }, 3000);
    } catch (error: any) {
      setSendError(error.message || "Failed to send message");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-6 border p-6" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
        {/* Department Banner */}
        <div
          className={`flex items-center justify-between rounded-none p-3.5 border text-xs ${
            department === "support"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
              : "bg-adm-blue-light border-adm-blue/30 text-adm-blue"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {department === "support" ? <LifeBuoy size={18} className="text-emerald-600" /> : <Briefcase size={18} className="text-adm-blue" />}
            <div>
              <p className="font-bold text-[13px]">
                {department === "support" ? "Technical & Client Support Desk" : "General Inquiries & Sales Line"}
              </p>
              <p className="text-[11px] opacity-80">
                {department === "support"
                  ? "Outbound messages will send from client support line"
                  : "Outbound messages will send from corporate general line +92 333 56701199"}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              department === "support"
                ? "bg-emerald-600 text-white"
                : "bg-adm-blue text-white"
            }`}
          >
            {department === "support" ? "Line 2" : "Line 1"}
          </span>
        </div>

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
                className={`border px-4 py-3 text-sm font-semibold capitalize transition`}
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

        {/* Send from — only when the business has more than one number */}
        <SenderPicker numbers={numbers} value={sender} onChange={setSenderChoice} id="sendFrom" />

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

            </AdminField>

            {/* Header */}
            <AdminField label="Header (optional)" htmlFor="headerText">
              <input
                type="text"
                id="headerText"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Welcome to Tauqeer Mustafa Inc"
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
            <AdminField label="Footer (optional)" htmlFor="footerText">
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
                Interactive Buttons <span className="text-xs font-normal text-adm-text-3">(max 3)</span>
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
            className="flex items-center gap-2 border p-4 text-sm"
            style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}
          >
            <AlertCircle size={16} className="shrink-0" />
            {sendError}
          </div>
        )}
        {sendSuccess && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 border p-4 text-sm"
            style={{ borderColor: "var(--adm-green)", background: "var(--adm-green-light)", color: "var(--adm-green)" }}
          >
            <div className="flex items-center gap-2">
              <CheckCheck size={16} className="shrink-0" />
              <span>Message sent successfully!</span>
            </div>
            {lastSentInfo && onSent && (
              <button
                type="button"
                onClick={() => onSent(lastSentInfo.to, lastSentInfo.sender)}
                className="inline-flex items-center gap-1.5 rounded-nonepx-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
                style={{ background: WA.green }}
              >
                View Chat in Inbox &rarr;
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={sendMessage.isPending}
          className="flex w-full items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
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
        className="overflow-hidden border p-4"
        style={{
          borderColor: "var(--adm-border)",
          background:
            "#e5ddd5 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1.2' fill='%23000' opacity='0.04'/%3E%3C/svg%3E\")",
        }}
      >
        {!hasContent ? (
          <p className="py-6 text-center text-xs" style={{ color: "var(--adm-text-3)" }}>
            Fill in the fields above to preview your message
          </p>
        ) : (
          <div className="mx-auto max-w-xs">
            {/* Message bubble */}
            <div
              className="relative rounded-none rounded-tl-none bg-adm-surface px-3 py-2"
              style={{ color: "var(--adm-text)" }}
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
                <p className="mt-1.5 text-[12px]" style={{ color: "var(--adm-text-3)" }}>
                  {footer}
                </p>
              )}
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className="text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                  12:00 PM
                </span>
                <CheckCheck size={13} style={{ color: "var(--adm-blue)" }} />
              </div>
            </div>

            {/* Reply buttons */}
            {buttons.length > 0 && (
              <div className="mt-1 space-y-1">
                {buttons.slice(0, 3).map((btn, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-1.5 rounded-none bg-adm-surface px-3 py-2.5 text-[14px] font-medium"
                    style={{ color: "var(--adm-blue)" }}
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
  if (s === "APPROVED") return { label: "Approved", color: "var(--adm-green)", bg: "var(--adm-green-light)" };
  if (s === "REJECTED" || s === "DISABLED" || s === "PAUSED")
    return { label: s.charAt(0) + s.slice(1).toLowerCase(), color: "var(--adm-red)", bg: "var(--adm-red-light)" };
  if (s === "NOT_SUBMITTED") return { label: "Not submitted", color: "var(--adm-text-3)", bg: "var(--adm-surface-2)" };
  return { label: "Pending review", color: "var(--adm-amber)", bg: "var(--adm-amber-light)" };
}

function MetaTemplatesTab({ defaultRecipient, department }: { defaultRecipient: string; department?: "general" | "support" }) {
  const { data, isLoading, refetch } = useMetaTemplates(department);
  const submitTemplate = useSubmitMetaTemplate();
  const { data: numbersData } = useWhatsAppNumbers();
  const [banner, setBanner] = useState("");
  const [senderChoice, setSenderChoice] = useState("");

  const numbers = numbersData?.data ?? [];
  // A template is the only way to open a conversation with someone who has never
  // written to us, so it decides which of our numbers the customer first sees.
  // Derived, not seeded in an effect: the list arrives after first render.
  const sender = senderChoice || numbers.find((n) => n.primary)?.id || "";

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
          style={{ borderColor: "var(--adm-amber)", background: "var(--adm-amber-light)", color: "var(--adm-amber)" }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{notice || "Set WHATSAPP_BUSINESS_ACCOUNT_ID to submit templates."}</span>
        </div>
      )}

      {/* Which number the first contact comes from — only when there are two */}
      {numbers.length > 1 && (
        <div
          className="border p-4"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
        >
          <SenderPicker
            numbers={numbers}
            value={sender}
            onChange={setSenderChoice}
            id="templateFrom"
            label="Send templates from"
          />

        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--adm-text-2)" }}>
          <strong>{templates.length}</strong> templates ·{" "}
          <span style={{ color: "var(--adm-green)" }}>
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
          <MetaTemplateCard key={tpl.name} template={tpl} defaultRecipient={defaultRecipient} from={sender} />
        ))}
      </div>
    </div>
  );
}

function MetaTemplateCard({
  template,
  defaultRecipient,
  from,
}: {
  template: MetaTemplate;
  defaultRecipient: string;
  /** Number to send as, chosen once for the whole tab. Omit for the primary. */
  from?: string;
}) {
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
      // The route distinguishes created / updated / already-current, and says so
      // in `note`. Showing "Submitted" for an edit would be wrong twice over: the
      // template was not submitted, and the old wording keeps sending until Meta
      // approves the new one.
      setMsg(r?.error ? `Error: ${r.error}` : r?.note || "Submitted to Meta — awaiting approval.");
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
        ...(from ? { from } : {}),
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
    <div className="border" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs" style={{ color: "var(--adm-text-3)" }}>
              {template.name}
            </span>
            <span
              className="px-2 py-0.5 text-[11px] font-semibold"
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.label}
            </span>
            <span
              className="px-2 py-0.5 text-[11px] font-medium"
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
                  className="border px-2 py-1 text-xs font-medium"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-blue)" }}
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
            <div key={t.name} className="flex items-start justify-between gap-3 border p-2" style={{ borderColor: "var(--adm-border)" }}>
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

// ─── Programmatic Lead Flow Editor ──────────────────────────────────────────

const FLOW_STEP_LABELS: Record<string, { label: string; icon: string }> = {
  start: { label: "1. Category (List)", icon: "📋" },
  scope_security: { label: "2a. Cybersecurity Scope (List)", icon: "🛡️" },
  scope_compliance: { label: "2b. Compliance Scope (List)", icon: "⚖️" },
  scope_seo: { label: "2c. SEO Scope (List)", icon: "📈" },
  scope_client: { label: "2d. Client Scope (List)", icon: "💼" },
  scope_general: { label: "2e. Careers Scope (List)", icon: "👥" },
  step3_scale: { label: "3. Scale & Timeline (List)", icon: "🏢" },
  step4_format: { label: "4. Consultation Mode (Buttons)", icon: "🔘" },
  step5_action: { label: "5. Action Confirmation (Buttons)", icon: "✅" },
  details: { label: "6a. Lead Intake (Text)", icon: "📝" },
  briefing: { label: "6b. Briefing Request (Text)", icon: "📄" },
  human: { label: "6c. Human Advisor (Text)", icon: "👤" },
  urgent: { label: "6d. Urgent Escalation (Text)", icon: "🚨" },
  apply: { label: "6e. Job Application (Text)", icon: "💼" },
  supp_scope: { label: "2. Support Scope (List)", icon: "🔧" },
  supp_impact: { label: "3. Severity & Impact (List)", icon: "⚠️" },
  supp_channel: { label: "4. Dispatch Channel (Buttons)", icon: "📡" },
  supp_confirm: { label: "5. Dispatch Confirmation (Buttons)", icon: "⚡" },
  supp_ticket_intake: { label: "6. Ticket Registration (Text)", icon: "🎫" },
  check_ticket: { label: "Ticket Tracker (Text)", icon: "🔍" },
  speak_lead: { label: "Duty Lead (Text)", icon: "🧑‍💻" },
  hotline_info: { label: "24/7 Hotline (Text)", icon: "📞" },
  status_hub: { label: "System Status (Text)", icon: "📊" },
  sla_info: { label: "SLA Response (Text)", icon: "⏱️" },
};

function getStepMeta(step: FlowStep, idx: number) {
  if (FLOW_STEP_LABELS[step.id]) return FLOW_STEP_LABELS[step.id];
  const icon = step.kind === "list" ? "📋" : step.kind === "buttons" ? "🔘" : "💬";
  return { label: `${idx + 1}. ${step.id}`, icon };
}

function FlowTab({
  department,
  onDepartmentChange,
}: {
  department?: "general" | "support";
  onDepartmentChange?: (dept: "general" | "support") => void;
}) {
  const { data, isLoading, isError, refetch } = useWhatsAppFlow(department);
  const saveFlow = useSaveWhatsAppFlow(department);
  const resetFlow = useResetWhatsAppFlow(department);

  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string>("start");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setSteps(JSON.parse(JSON.stringify(data.data)));
    }
  }, [data]);

  if (isLoading) return <AdminLoadingState label="Loading programmatic bot flow..." />;
  if (isError) return <AdminErrorState message="Could not load bot flow." />;

  const currentStep = steps.find((s) => s.id === selectedStepId) || steps[0];

  const updateStepField = (field: string, value: any) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId) return s;
        return { ...s, [field]: value };
      })
    );
  };

  const changeStepKind = (newKind: "list" | "buttons" | "text") => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId) return s;
        if (s.kind === newKind) return s;
        const targetFallback = prev.find((other) => other.id !== s.id)?.id || "details";
        if (newKind === "list") {
          const existingRows =
            s.kind === "buttons"
              ? s.buttons.map((b) => ({
                  id: b.id,
                  title: b.title || "Option",
                  description: "",
                  next: b.next || targetFallback,
                }))
              : [];
          return {
            kind: "list",
            id: s.id,
            header: (s as any).header || "Tauqeer Mustafa Inc",
            body: s.body || "Please select an option below:",
            footer: (s as any).footer || "Mon to Sat, 09:00 to 18:00 PKT",
            button: (s as any).button || "Choose an option",
            sections: [
              {
                title: "Options",
                rows:
                  existingRows.length > 0
                    ? existingRows
                    : [
                        {
                          id: `${s.id}_r1`,
                          title: "Option 1",
                          description: "First option description",
                          next: targetFallback,
                        },
                      ],
              },
            ],
          };
        } else if (newKind === "buttons") {
          const existingButtons =
            s.kind === "list"
              ? s.sections
                  .flatMap((sec) => sec.rows)
                  .slice(0, 3)
                  .map((r) => ({
                    id: r.id,
                    title: (r.title || "Option").slice(0, 20),
                    next: r.next || targetFallback,
                  }))
              : [];
          return {
            kind: "buttons",
            id: s.id,
            header: (s as any).header || "Tauqeer Mustafa Inc",
            body: s.body || "Please select an option below:",
            footer: (s as any).footer || "Select an option below",
            buttons:
              existingButtons.length > 0
                ? existingButtons
                : [
                    {
                      id: `${s.id}_btn1`,
                      title: "Option 1",
                      next: targetFallback,
                    },
                  ],
          };
        } else {
          return {
            kind: "text",
            id: s.id,
            body: s.body,
          };
        }
      })
    );
  };

  // Buttons helpers
  const addButton = () => {
    if (currentStep.kind !== "buttons") return;
    if (currentStep.buttons.length >= 3) {
      alert("WhatsApp Cloud API strictly caps interactive reply buttons at 3 per message.");
      return;
    }
    const targetFallback = steps.find((other) => other.id !== currentStep.id)?.id || "details";
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "buttons") return s;
        return {
          ...s,
          buttons: [
            ...s.buttons,
            {
              id: `${s.id}_btn${Date.now().toString().slice(-4)}`,
              title: `Button ${s.buttons.length + 1}`,
              next: targetFallback,
            },
          ],
        };
      })
    );
  };

  const removeButton = (btnIdx: number) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "buttons") return s;
        return { ...s, buttons: s.buttons.filter((_, i) => i !== btnIdx) };
      })
    );
  };

  const updateButtonField = (btnIndex: number, field: "title" | "next" | "id", value: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "buttons") return s;
        const newButtons = [...s.buttons];
        if (newButtons[btnIndex]) {
          newButtons[btnIndex] = { ...newButtons[btnIndex], [field]: value };
        }
        return { ...s, buttons: newButtons };
      })
    );
  };

  // List helpers
  const addListSection = () => {
    if (currentStep.kind !== "list") return;
    const targetFallback = steps.find((other) => other.id !== currentStep.id)?.id || "details";
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "list") return s;
        return {
          ...s,
          sections: [
            ...s.sections,
            {
              title: `Section ${s.sections.length + 1}`,
              rows: [
                {
                  id: `${s.id}_r${Date.now().toString().slice(-4)}`,
                  title: "New Option",
                  description: "Option description",
                  next: targetFallback,
                },
              ],
            },
          ],
        };
      })
    );
  };

  const removeListSection = (secIdx: number) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "list") return s;
        return { ...s, sections: s.sections.filter((_, i) => i !== secIdx) };
      })
    );
  };

  const updateSectionTitle = (secIdx: number, title: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "list") return s;
        const newSecs = [...s.sections];
        newSecs[secIdx] = { ...newSecs[secIdx], title };
        return { ...s, sections: newSecs };
      })
    );
  };

  const addListRow = (secIdx: number) => {
    if (currentStep.kind !== "list") return;
    const totalRows = currentStep.sections.reduce((acc, sec) => acc + sec.rows.length, 0);
    if (totalRows >= 10) {
      alert("WhatsApp interactive list messages accept at most 10 items in total.");
      return;
    }
    const targetFallback = steps.find((other) => other.id !== currentStep.id)?.id || "details";
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "list") return s;
        const newSecs = [...s.sections];
        const sec = { ...newSecs[secIdx] };
        sec.rows = [
          ...sec.rows,
          {
            id: `${s.id}_r${Date.now().toString().slice(-4)}`,
            title: `Item ${sec.rows.length + 1}`,
            description: "",
            next: targetFallback,
          },
        ];
        newSecs[secIdx] = sec;
        return { ...s, sections: newSecs };
      })
    );
  };

  const removeListRow = (secIdx: number, rowIdx: number) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "list") return s;
        const newSecs = [...s.sections];
        const sec = { ...newSecs[secIdx] };
        sec.rows = sec.rows.filter((_, i) => i !== rowIdx);
        newSecs[secIdx] = sec;
        return { ...s, sections: newSecs };
      })
    );
  };

  const updateListRowField = (secIdx: number, rowIdx: number, field: string, value: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStepId || s.kind !== "list") return s;
        const newSecs = [...s.sections];
        const sec = { ...newSecs[secIdx] };
        const newRows = [...sec.rows];
        newRows[rowIdx] = { ...newRows[rowIdx], [field]: value };
        sec.rows = newRows;
        newSecs[secIdx] = sec;
        return { ...s, sections: newSecs };
      })
    );
  };

  // Add / Delete step
  const createStep = (kind: "list" | "buttons" | "text") => {
    const rawId = prompt(
      `Enter unique ID for new ${kind.toUpperCase()} step (e.g. step_${steps.length + 1}_${kind}):`,
      `step_${steps.length + 1}_${kind}`
    );
    if (!rawId) return;
    const cleanId = rawId.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!cleanId) return;
    if (steps.some((s) => s.id === cleanId)) {
      alert(`A step with ID '${cleanId}' already exists.`);
      return;
    }
    const targetFallback = steps[0]?.id || "details";
    let newStep: FlowStep;

    if (kind === "list") {
      newStep = {
        kind: "list",
        id: cleanId,
        header: "Tauqeer Mustafa Inc",
        body: "Please select an option from the list below:",
        footer: "Professional Advisory",
        button: "Select Option",
        sections: [
          {
            title: "Options",
            rows: [
              {
                id: `${cleanId}_r1`,
                title: "Option 1",
                description: "First option description",
                next: targetFallback,
              },
              {
                id: `${cleanId}_r2`,
                title: "Option 2",
                description: "Second option description",
                next: targetFallback,
              },
            ],
          },
        ],
      };
    } else if (kind === "buttons") {
      newStep = {
        kind: "buttons",
        id: cleanId,
        header: "Tauqeer Mustafa Inc",
        body: "Please confirm your selection below:",
        footer: "Select an option",
        buttons: [
          {
            id: `${cleanId}_btn1`,
            title: "Confirm Option 1",
            next: targetFallback,
          },
          {
            id: `${cleanId}_btn2`,
            title: "Confirm Option 2",
            next: targetFallback,
          },
        ],
      };
    } else {
      newStep = {
        kind: "text",
        id: cleanId,
        body: "Your request has been received. Our team will review your details promptly.",
      };
    }

    setSteps((prev) => [...prev, newStep]);
    setSelectedStepId(cleanId);
  };

  const handleDeleteCurrentStep = () => {
    if (selectedStepId === "start") {
      alert("The initial entry step 'start' cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete step '${selectedStepId}'?`)) return;
    const remaining = steps.filter((s) => s.id !== selectedStepId);
    setSteps(remaining);
    setSelectedStepId(remaining[0]?.id || "start");
  };

  const handleSave = async () => {
    try {
      await saveFlow.mutateAsync(steps);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    if (!confirm(`Reset all programmatic flow messages for ${department || "general"} to built-in defaults?`)) return;
    setResetting(true);
    try {
      await resetFlow.mutateAsync();
      await refetch();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Channel Bot Line Context Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-adm-surface-2 border border-adm-border">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-adm-text-3">Channel Bot Line:</span>
          <div className="flex items-center gap-1 border border-adm-border bg-adm-surface p-0.5">
            <button
              type="button"
              onClick={() => onDepartmentChange?.("general")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                department === "general"
                  ? "bg-adm-blue text-white shadow-sm font-bold"
                  : "text-adm-text-2 hover:bg-adm-surface-2"
              }`}
            >
              <Briefcase size={13} />
              <span>Line 1: General Inquiries & Sales</span>
            </button>
            <button
              type="button"
              onClick={() => onDepartmentChange?.("support")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                department === "support"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-adm-text-2 hover:bg-adm-surface-2"
              }`}
            >
              <LifeBuoy size={13} />
              <span>Line 2: Technical Support Desk</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-adm-text-3">
          <span className="font-semibold text-adm-text-2">{steps.length} steps in sequence</span>
          <span>•</span>
          <span>{steps.filter((s) => s.kind === "list").length} lists</span>
          <span>•</span>
          <span>{steps.filter((s) => s.kind === "buttons").length} buttons</span>
          <span>•</span>
          <span>{steps.filter((s) => s.kind === "text").length} text</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>
              {department === "support" ? "Support Desk Bot Flow" : "General Inquiries Bot Flow"}
            </h2>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-adm-surface-2 text-adm-text-2 border border-adm-border">
              {data?.isCustom ? "Customized KV Flow" : "Built-in Defaults"}
            </span>
          </div>
          <p className="text-xs text-adm-text-3 mt-0.5">
            Configure automated WhatsApp ladder: Message 1-3 Lists ➔ Message 4-5 Buttons ➔ Continue text steps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => createStep("list")}
            className="flex items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold rounded-none hover:bg-adm-surface-2 transition text-adm-blue border-adm-blue/40"
            title="Add a new Interactive List message"
          >
            <List size={13} /> + List Step
          </button>
          <button
            type="button"
            onClick={() => createStep("buttons")}
            className="flex items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold rounded-none hover:bg-adm-surface-2 transition text-adm-blue border-adm-blue/40"
            title="Add a new Reply Buttons message"
          >
            <Circle size={13} /> + Buttons Step
          </button>
          <button
            type="button"
            onClick={() => createStep("text")}
            className="flex items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold rounded-none hover:bg-adm-surface-2 transition text-adm-text-2 border-adm-border"
            title="Add a new Plain Text message"
          >
            <MessageSquare size={13} /> + Text Step
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting || resetFlow.isPending}
            className="border px-2.5 py-1.5 text-xs font-semibold rounded-none hover:bg-adm-surface-2 transition text-adm-text-2 disabled:opacity-50 border-adm-border"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveFlow.isPending}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-none transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--adm-blue)" }}
          >
            <Check size={14} />
            {saveFlow.isPending ? "Saving..." : saveSuccess ? "Saved!" : "Save Flow"}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-none border border-adm-blue bg-adm-blue-light p-3 text-xs font-medium text-adm-blue">
          <CheckCheck size={16} className="shrink-0 text-adm-blue" />
          Programmatic messages for {department === "support" ? "Technical Support" : "General Sales"} saved successfully.
        </div>
      )}

      {/* Step Selector pills */}
      <div className="flex flex-wrap gap-1.5 border-b pb-3" style={{ borderColor: "var(--adm-border)" }}>
        {steps.map((s, idx) => {
          const isSelected = s.id === selectedStepId;
          const meta = getStepMeta(s, idx);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStepId(s.id)}
              className={`flex items-center gap-1.5 rounded-none px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "bg-adm-blue text-white"
                  : "border border-adm-border bg-adm-surface text-adm-text-2 hover:bg-adm-surface-2"
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="text-[10px] opacity-75 uppercase font-mono px-1 bg-black/10 rounded">
                {s.kind}
              </span>
            </button>
          );
        })}
      </div>

      {currentStep && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Editor Form */}
          <div className="space-y-4 lg:col-span-7">
            {/* Step ID & Type Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-adm-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-adm-text-3 block">
                  Step ID
                </span>
                <span className="text-sm font-mono font-bold text-adm-text">{currentStep.id}</span>
              </div>

              {/* Kind Picker */}
              <div>
                <span className="text-[11px] font-semibold text-adm-text-3 block mb-1">
                  Message Type Format:
                </span>
                <div className="flex items-center gap-1 border border-adm-border p-0.5 bg-adm-surface-2">
                  <button
                    type="button"
                    onClick={() => changeStepKind("list")}
                    className={`px-2.5 py-1 text-xs font-medium transition ${
                      currentStep.kind === "list"
                        ? "bg-adm-blue text-white font-bold"
                        : "text-adm-text-2 hover:bg-adm-surface"
                    }`}
                  >
                    📋 Interactive List
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStepKind("buttons")}
                    className={`px-2.5 py-1 text-xs font-medium transition ${
                      currentStep.kind === "buttons"
                        ? "bg-adm-blue text-white font-bold"
                        : "text-adm-text-2 hover:bg-adm-surface"
                    }`}
                  >
                    🔘 Reply Buttons
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStepKind("text")}
                    className={`px-2.5 py-1 text-xs font-medium transition ${
                      currentStep.kind === "text"
                        ? "bg-adm-blue text-white font-bold"
                        : "text-adm-text-2 hover:bg-adm-surface"
                    }`}
                  >
                    💬 Plain Text
                  </button>
                </div>
              </div>

              {selectedStepId !== "start" && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentStep}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={13} /> Delete Step
                </button>
              )}
            </div>

            {/* Header if kind != text */}
            {currentStep.kind !== "text" && (
              <AdminField label="Header (optional, max 60 chars)" htmlFor="flowHeader">
                <input
                  id="flowHeader"
                  type="text"
                  value={currentStep.header || ""}
                  onChange={(e) => updateStepField("header", e.target.value)}
                  maxLength={60}
                  className={adminInputClass}
                  style={adminInputStyle}
                  placeholder="e.g. Tauqeer Mustafa Inc"
                />
                <p className="mt-1 text-right text-[11px] text-adm-text-3">
                  {(currentStep.header || "").length}/60 chars
                </p>
              </AdminField>
            )}

            {/* Body */}
            <AdminField label="Message Text (Body)" htmlFor="flowBody">
              <textarea
                id="flowBody"
                value={currentStep.body}
                onChange={(e) => updateStepField("body", e.target.value)}
                maxLength={currentStep.kind === "text" ? 4096 : 1024}
                rows={5}
                className={adminInputClass}
                style={adminInputStyle}
                placeholder="Message text sent to customer..."
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-adm-text-3">
                <span>Supports WhatsApp *bold*, _italic_</span>
                <span>
                  {currentStep.body.length}/{currentStep.kind === "text" ? 4096 : 1024} chars
                </span>
              </div>
            </AdminField>

            {/* Footer if kind != text */}
            {currentStep.kind !== "text" && (
              <AdminField label="Footer (optional, max 60 chars)" htmlFor="flowFooter">
                <input
                  id="flowFooter"
                  type="text"
                  value={currentStep.footer || ""}
                  onChange={(e) => updateStepField("footer", e.target.value)}
                  maxLength={60}
                  className={adminInputClass}
                  style={adminInputStyle}
                  placeholder="e.g. Mon to Sat, 09:00 to 18:00 PKT"
                />
                <p className="mt-1 text-right text-[11px] text-adm-text-3">
                  {(currentStep.footer || "").length}/60 chars
                </p>
              </AdminField>
            )}

            {/* List Configuration */}
            {currentStep.kind === "list" && (
              <div className="space-y-4 rounded-none border bg-adm-surface-2 p-4 border-adm-border">
                <AdminField label="List Menu Button Label (max 20 chars)" htmlFor="flowListBtn">
                  <input
                    id="flowListBtn"
                    type="text"
                    value={currentStep.button}
                    onChange={(e) => updateStepField("button", e.target.value)}
                    maxLength={20}
                    className={adminInputClass}
                    style={adminInputStyle}
                    placeholder="Choose an option"
                  />
                  <p className="mt-1 text-right text-[11px] text-adm-text-3">
                    {currentStep.button.length}/20 chars
                  </p>
                </AdminField>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-adm-text-2 uppercase tracking-wide">
                      List Sections & Rows ({currentStep.sections.reduce((acc, sec) => acc + sec.rows.length, 0)}/10 items by Meta limit)
                    </span>
                    <button
                      type="button"
                      onClick={addListSection}
                      className="text-xs text-adm-blue font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={13} /> Add Section
                    </button>
                  </div>

                  {currentStep.sections.map((sec, secIdx) => (
                    <div
                      key={secIdx}
                      className="space-y-3 border p-3 bg-adm-surface border-adm-border rounded-none"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateSectionTitle(secIdx, e.target.value)}
                          placeholder="Section Title (max 24)"
                          maxLength={24}
                          className="font-bold text-xs bg-transparent border-b border-adm-border px-1 py-0.5 text-adm-text"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addListRow(secIdx)}
                            className="text-[11px] font-semibold text-adm-blue hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} /> Add Item
                          </button>
                          {currentStep.sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeListSection(secIdx)}
                              className="text-adm-text-3 hover:text-red-500 transition"
                              title="Delete section"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {sec.rows.map((row, rowIdx) => (
                          <div
                            key={row.id || rowIdx}
                            className="border p-2.5 bg-adm-surface-2 border-adm-border space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-adm-text-3 uppercase">
                                ID: {row.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeListRow(secIdx, rowIdx)}
                                className="text-xs text-adm-text-3 hover:text-red-500 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-adm-text-3 block mb-0.5">
                                  Title (max 24 chars)
                                </label>
                                <input
                                  type="text"
                                  value={row.title}
                                  onChange={(e) =>
                                    updateListRowField(secIdx, rowIdx, "title", e.target.value)
                                  }
                                  maxLength={24}
                                  className={adminInputClass}
                                  style={{ ...adminInputStyle, fontSize: "12px", padding: "4px 8px" }}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-adm-text-3 block mb-0.5">
                                  Description (max 72 chars)
                                </label>
                                <input
                                  type="text"
                                  value={row.description || ""}
                                  onChange={(e) =>
                                    updateListRowField(secIdx, rowIdx, "description", e.target.value)
                                  }
                                  maxLength={72}
                                  className={adminInputClass}
                                  style={{ ...adminInputStyle, fontSize: "12px", padding: "4px 8px" }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-adm-text-3 block mb-0.5">
                                Target Next Step on Tap:
                              </label>
                              <select
                                value={row.next}
                                onChange={(e) =>
                                  updateListRowField(secIdx, rowIdx, "next", e.target.value)
                                }
                                className={adminInputClass}
                                style={{ ...adminInputStyle, fontSize: "11px", padding: "3px 6px" }}
                              >
                                {steps.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    ➔ {st.id} ({st.kind})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons Configuration */}
            {currentStep.kind === "buttons" && (
              <div className="space-y-4 rounded-none border bg-adm-surface-2 p-4 border-adm-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-adm-text-2 uppercase tracking-wide">
                    Interactive Reply Buttons ({currentStep.buttons.length}/3 by Meta limit)
                  </span>
                  {currentStep.buttons.length < 3 ? (
                    <button
                      type="button"
                      onClick={addButton}
                      className="text-xs text-adm-blue font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={13} /> Add Button
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => changeStepKind("list")}
                      className="text-[11px] text-adm-blue font-semibold hover:underline"
                    >
                      Need more than 3 options? Switch to List (up to 10) ➔
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {currentStep.buttons.map((btn, btnIdx) => (
                    <div
                      key={btn.id || btnIdx}
                      className="border p-3 bg-adm-surface border-adm-border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-adm-blue">
                          Button {btnIdx + 1}
                        </span>
                        {currentStep.buttons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeButton(btnIdx)}
                            className="text-xs text-adm-text-3 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-adm-text-3 block mb-0.5">
                            Button Title (max 20 chars)
                          </label>
                          <input
                            type="text"
                            value={btn.title}
                            onChange={(e) => updateButtonField(btnIdx, "title", e.target.value)}
                            maxLength={20}
                            className={adminInputClass}
                            style={{ ...adminInputStyle, fontSize: "12px", padding: "5px 8px" }}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-adm-text-3 block mb-0.5">
                            Target Next Step on Tap:
                          </label>
                          <select
                            value={btn.next}
                            onChange={(e) => updateButtonField(btnIdx, "next", e.target.value)}
                            className={adminInputClass}
                            style={{ ...adminInputStyle, fontSize: "11px", padding: "5px 8px" }}
                          >
                            {steps.map((st) => (
                              <option key={st.id} value={st.id}>
                                ➔ {st.id} ({st.kind})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live WhatsApp Simulation Bubble */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-adm-text-3">
                Live Customer WhatsApp Preview
              </span>
              <div
                className="rounded-none p-4"
                style={{
                  backgroundColor: "#E5DDD5",
                  backgroundImage: DOODLE,
                  minHeight: "320px",
                }}
              >
                <div className="max-w-[95%] rounded-none bg-adm-surface p-3 shadow text-[13px] text-adm-text space-y-1.5 border border-adm-border">
                  {currentStep.kind !== "text" && currentStep.header && (
                    <p className="font-bold text-adm-text border-b pb-1 text-sm border-adm-border">
                      {currentStep.header}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-adm-text-2">
                    {currentStep.body}
                  </p>
                  {currentStep.kind !== "text" && currentStep.footer && (
                    <p className="text-[11px] text-adm-text-3 pt-1 border-t border-adm-border mt-1">
                      {currentStep.footer}
                    </p>
                  )}
                  <div className="flex justify-end pt-1">
                    <span className="text-[10px] text-adm-text-3">12:00 PM</span>
                  </div>
                </div>

                {/* List action button below bubble */}
                {currentStep.kind === "list" && (
                  <div className="mt-2 max-w-[95%] space-y-2">
                    <div className="flex items-center justify-center rounded-none bg-adm-surface py-2 text-xs font-bold text-adm-blue shadow border border-adm-border">
                      📋 {currentStep.button || "Choose an option"}
                    </div>
                    {/* Drawer preview */}
                    <div className="bg-adm-surface border border-adm-border p-2.5 shadow space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-adm-text-3 block">
                        Interactive List Options Drawer
                      </span>
                      {currentStep.sections.map((sec, i) => (
                        <div key={i} className="space-y-1 border-t first:border-t-0 pt-1 border-adm-border">
                          <span className="text-[10px] font-bold uppercase text-adm-blue block">
                            {sec.title}
                          </span>
                          {sec.rows.map((r, j) => (
                            <div key={j} className="flex items-center justify-between py-1 border-b last:border-b-0 border-adm-border">
                              <div>
                                <p className="font-bold text-adm-text">{r.title}</p>
                                {r.description && <p className="text-[11px] text-adm-text-3">{r.description}</p>}
                              </div>
                              <span className="text-[10px] font-mono text-adm-blue bg-adm-blue-light px-1.5 py-0.5">
                                ➔ {r.next}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Button actions below bubble */}
                {currentStep.kind === "buttons" && (
                  <div className="mt-2 max-w-[95%] space-y-1.5">
                    {currentStep.buttons.map((b, i) => (
                      <div
                        key={b.id || i}
                        className="flex items-center justify-between rounded-none bg-adm-surface px-3 py-2 text-xs font-semibold text-adm-blue shadow border border-adm-border"
                      >
                        <span>{b.title || "Button"}</span>
                        <span className="text-[10px] font-mono text-adm-text-3">➔ {b.next}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RulesTab({ department }: { department?: "general" | "support" }) {
  const { data, isLoading, isError } = useAutoReplyRules(department);
  const saveRules = useSaveAutoReplyRules(department);
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
              className="border px-4 py-2 text-sm font-semibold transition hover:bg-adm-surface-2"
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
          className="flex items-center gap-2 border p-4 text-sm"
          style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)", color: "var(--adm-red)" }}
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
            className="border px-4 py-2 text-sm font-semibold transition hover:bg-adm-surface-2"
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
              className="flex items-start justify-between gap-3 border p-4"
              style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
            >
              <div className="min-w-0">
                <p className="font-semibold" style={{ color: "var(--adm-text)" }}>
                  Keyword: &quot;{rule.keyword}&quot;{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--adm-text-3)" }}>
                    ({rule.mode})
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm" style={{ color: "var(--adm-text-2)" }}>
                  {rule.reply}
                </p>
              </div>
              <span
                className="shrink-0 px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: rule.enabled ? "var(--adm-green-light)" : "var(--adm-surface-2)",
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
    <div className="border p-4" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
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

function StatsTab({ department = "general" }: { department?: "general" | "support" }) {
  const { data: messagesData } = useWhatsAppMessages();
  const { data: numbersData } = useWhatsAppNumbers();
  const allMessages = messagesData?.data ?? [];
  // Same line list the inbox classifies against, so a second number discovery
  // missed is counted under Support here too — not silently under General.
  const numbers = withSeenChannels(numbersData?.data ?? [], allMessages);

  const deptMessages = allMessages.filter(
    (m) => getMessageDepartment(m, numbers) === department
  );
  const conversations = groupConversations(allMessages, numbers, department);

  const stats = {
    total: deptMessages.length,
    inbound: deptMessages.filter((m) => m.direction === "inbound").length,
    outbound: deptMessages.filter((m) => m.direction === "outbound").length,
    today: deptMessages.filter((m) => new Date(m.timestamp).toDateString() === new Date().toDateString()).length,
    conversations: conversations.length,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>
            {department === "general" ? "General Inquiries & Sales Analytics" : "Technical & Client Support Analytics"}
          </h3>
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            {department === "general"
              ? "Message volume and traffic for Corporate Line (+92 333 56701199)"
              : "Message volume and traffic for Support Desk Line"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            department === "general"
              ? "bg-adm-blue-light text-adm-blue"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          }`}
        >
          {department === "general" ? "Line 1 Active" : "Line 2 Active"}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Messages" value={stats.total} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<MessageSquare size={22} />} />
        <StatCard title="Received" value={stats.inbound} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<MessageSquare size={22} />} />
        <StatCard title="Sent" value={stats.outbound} iconBg="var(--adm-green-light)" iconColor="var(--adm-green)" icon={<Send size={20} />} />
        <StatCard title="Today" value={stats.today} iconBg="var(--adm-blue-light)" iconColor="var(--adm-blue)" icon={<BarChart3 size={22} />} />
        <StatCard title="Active Chats" value={stats.conversations} iconBg={department === "support" ? "rgba(5, 150, 105, 0.15)" : "var(--adm-blue-light)"} iconColor={department === "support" ? "#059669" : "var(--adm-blue)"} icon={department === "support" ? <LifeBuoy size={22} /> : <Briefcase size={22} />} />
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
    <div className="flex items-center justify-between border p-5" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
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



// ─── Phone Numbers / Lines ──────────────────────────────────────────────

function NumbersTab({
  department = "general",
  onSendFrom,
}: {
  department?: "general" | "support";
  onSendFrom?: (numberId: string) => void;
}) {
  const { data: numbersData, isLoading, isError, refetch } = useWhatsAppNumbers();
  const numbers = numbersData?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--adm-text)" }}>
            WhatsApp Departmental Phone Lines
          </h3>
          <p className="text-sm" style={{ color: "var(--adm-text-3)" }}>
            Independent, separated phone numbers connected to Meta WhatsApp Business API
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 border px-3 py-1.5 text-xs font-semibold rounded-none transition hover:bg-black/5"
          style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
        >
          <RefreshCw size={14} /> Refresh Lines
        </button>
      </div>

      {isLoading ? (
        <AdminLoadingState label="Detecting phone lines from Meta..." />
      ) : isError ? (
        <AdminErrorState message="Could not load phone numbers from Meta API." />
      ) : numbers.length === 0 ? (
        <div className="border border-dashed p-8 text-center" style={{ borderColor: "var(--adm-border)" }}>
          <AlertCircle size={32} className="mx-auto mb-2 text-adm-amber" />
          <p className="font-semibold text-adm-text-2">No phone lines detected</p>
          <p className="mt-1 text-xs text-adm-text-3">
            Check that WHATSAPP_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID or WHATSAPP_PHONE_NUMBER_ID are configured in Vercel.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {numbers.map((n, idx) => {
            const isSendable = n.canSend !== false;
            const isSupportLine = n.department === "support" || (!n.primary && idx > 0);
            const isCurrentDept = (isSupportLine ? "support" : "general") === department;
            return (
              <div
                key={n.id}
                className={`flex flex-col justify-between rounded-none border bg-adm-surface p-5 transition ${
                  isCurrentDept ? "ring-2 ring-adm-blue/20" : ""
                }`}
                style={{
                  borderColor: isCurrentDept
                    ? isSupportLine ? "#059669" : "var(--adm-blue)"
                    : isSendable ? "var(--adm-border)" : "var(--adm-red)"
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
                        style={{
                          background: isSupportLine ? "#059669" : "var(--adm-blue)"
                        }}
                      >
                        {isSupportLine ? <LifeBuoy size={19} /> : <Briefcase size={19} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-adm-text text-base">
                            {n.displayNumber || n.label || `Line ${idx + 1}`}
                          </h4>
                        </div>
                        <p className="text-xs font-semibold text-adm-text-2 mt-0.5">
                          {isSupportLine ? "Technical & Client Support Line" : "General Inquiries & Sales Line"}
                        </p>
                        {n.verifiedName && (
                          <p className="text-xs font-medium text-adm-text-3">{n.verifiedName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {isCurrentDept && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isSupportLine
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "bg-adm-blue-light text-adm-blue"
                          }`}
                        >
                          Active Department
                        </span>
                      )}
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: isSendable ? "var(--adm-green-light)" : "var(--adm-red-light)",
                          color: isSendable ? "var(--adm-green)" : "var(--adm-red)",
                        }}
                      >
                        <Circle size={6} fill="currentColor" />
                        {isSendable ? "Active / Ready" : "Sending Error"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t pt-3" style={{ borderColor: "var(--adm-border)" }}>
                    <div className="flex items-center justify-between text-adm-text-2">
                      <span>Phone Number ID:</span>
                      <code className="rounded-nonebg-adm-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-adm-text-2 select-all">
                        {n.id}
                      </code>
                    </div>
                    {n.quality && (
                      <div className="flex items-center justify-between text-adm-text-2">
                        <span>Quality Rating:</span>
                        <span className="font-semibold capitalize" style={{ color: n.quality === "GREEN" ? "var(--adm-green)" : "var(--adm-amber)" }}>
                          {n.quality.toLowerCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-adm-text-2">
                      <span>Credential Slot:</span>
                      <span className="font-semibold text-adm-text-2">Slot {n.slot ?? 1}</span>
                    </div>
                  </div>

                  {n.error && (
                    <div className="mt-3 rounded-noneborder p-2.5 text-xs text-adm-red bg-adm-red-light border-adm-red">
                      <AlertCircle size={13} className="inline mr-1 mb-0.5" />
                      {n.error}
                    </div>
                  )}
                </div>

                {isSendable && onSendFrom && (
                  <div className="mt-4 border-t pt-3 flex justify-end" style={{ borderColor: "var(--adm-border)" }}>
                    <button
                      type="button"
                      onClick={() => onSendFrom(n.id)}
                      className="inline-flex items-center gap-1.5 rounded-nonepx-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ background: "var(--adm-blue)" }}
                    >
                      <Send size={13} /> Send from this line
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}

// ─── Pipeline (Kanban) ──────────────────────────────────────────────────

function PipelineTab({
  department = "general",
  onOpenChat,
}: {
  department?: "general" | "support";
  onOpenChat: (recipient: string, channelId?: string) => void;
}) {
  const { data, isLoading } = useWhatsAppMessages();
  const { data: metaData } = useConversationMeta();
  const { data: numbersData } = useWhatsAppNumbers();
  const updateMeta = useUpdateConversationMeta();

  const [draggedConv, setDraggedConv] = useState<string | null>(null);

  if (isLoading) return <AdminLoadingState label="Loading pipeline..." />;

  const messages = data?.data ?? [];
  const metaMap = metaData?.data ?? {};
  // Match the inbox's line list so a second number discovery missed lands in the
  // Support pipeline rather than silently under General.
  const numbers = withSeenChannels(numbersData?.data ?? [], messages);
  const conversations = groupConversations(messages, numbers, department);

  const statuses = department === "support" ? SUPPORT_TICKET_STATUSES : GENERAL_DEAL_STATUSES;

  const pipeline = statuses.map((status) => {
    return {
      status,
      items: conversations
        .filter((c) => {
          const m = metaMap[c.key] || (c.department === "general" ? metaMap[c.number] : undefined);
          const st = m?.dealStatus || "new";
          return st === status.value && !m?.archived;
        })
        .map((c) => ({ conv: c, meta: metaMap[c.key] || (c.department === "general" ? metaMap[c.number] : undefined) })),
    };
  });

  const handleDrop = (e: React.DragEvent, statusValue: string) => {
    e.preventDefault();
    if (!draggedConv) return;
    const meta = metaMap[draggedConv];
    if (meta?.dealStatus !== statusValue) {
      updateMeta.mutate({ key: draggedConv, patch: { dealStatus: statusValue } });
    }
    setDraggedConv(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h3 className="font-bold text-base text-adm-text">
            {department === "general" ? "General Sales & Inquiries Pipeline" : "Technical & Client Support Pipeline"}
          </h3>
          <p className="text-xs text-adm-text-3">
            {department === "general"
              ? "Track inbound corporate quotes, leads, proposals, and deal stages"
              : "Track client tickets, incident reports, SLA progress, and issue resolutions"}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            department === "general"
              ? "bg-adm-blue-light text-adm-blue"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          }`}
        >
          {department === "general" ? "Line 1: +92 333 56701199" : "Line 2: Support Desk"}
        </span>
      </div>

      <div className="flex h-full gap-4 overflow-x-auto p-4 border rounded-none" style={{ background: "var(--adm-bg)", borderColor: "var(--adm-border)", minHeight: "calc(100vh - 240px)" }}>
        {pipeline.map((col) => (
          <div
            key={col.status.value}
            className="flex w-72 shrink-0 flex-col rounded-none bg-adm-surface-2 p-2 border"
            style={{ borderColor: "var(--adm-border)" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.status.value)}
          >
            <div className="mb-3 px-2 py-1 flex items-center justify-between">
              <h3 className="font-semibold text-adm-text-2 uppercase tracking-wide text-xs">{col.status.label}</h3>
              <span className="rounded-full bg-adm-surface px-2 py-0.5 text-xs font-medium text-adm-text-3">{col.items.length}</span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto min-h-[50px]">
              {col.items.map((item) => {
                const name = item.meta?.name || (item.conv.name !== item.conv.number ? item.conv.name : `+${item.conv.number}`);
                const hasUnread = unreadCount(item.conv, item.meta) > 0;
                return (
                  <div
                    key={item.conv.key}
                    draggable
                    onDragStart={() => setDraggedConv(item.conv.key)}
                    onDragEnd={() => setDraggedConv(null)}
                    className="group cursor-grab rounded-none bg-adm-surface p-3 transition active:cursor-grabbing border-l-4 border"
                    style={{
                      borderColor: "var(--adm-border)",
                      borderLeftColor: hasUnread ? (department === "support" ? "#059669" : WA.green) : "transparent",
                    }}
                    onClick={() => onOpenChat(item.conv.number, item.conv.channel)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-adm-text-2 truncate" title={name}>{name}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-adm-text-3">
                      <p className="truncate w-3/4">{lastPreview(item.conv)}</p>
                      {item.meta?.assignedTo && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-adm-blue-light font-bold text-adm-blue" title={`Assigned to ${item.meta.assignedTo}`}>
                          {item.meta.assignedTo.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {item.meta?.tags && item.meta.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.meta.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-adm-surface-2 px-1.5 py-0.5 text-[10px] text-adm-text-2">
                            {tag}
                          </span>
                        ))}
                        {item.meta.tags.length > 3 && <span className="text-[10px] text-adm-text-3">+{item.meta.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
