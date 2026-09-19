"use client";

import { useState } from "react";
import {
  X,
  User,
  Phone,
  Copy,
  Check,
  Tag,
  Plus,
  FileText,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  ExternalLink,
  ShieldCheck,
  LifeBuoy,
  Briefcase,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import type { ConvMeta } from "@/hooks/useWhatsApp";

type DealStatus = "new" | "contacted" | "negotiating" | "won" | "lost";

const GENERAL_DEAL_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Lead", color: "var(--adm-blue, #2563eb)", bgColor: "var(--adm-blue-light, rgba(37, 99, 235, 0.1))" },
  { value: "contacted", label: "Contacted", color: "var(--adm-text-2, #64748b)", bgColor: "var(--adm-surface-2, rgba(100, 116, 139, 0.1))" },
  { value: "negotiating", label: "Negotiating", color: "#d97706", bgColor: "rgba(217, 119, 6, 0.1)" },
  { value: "won", label: "Deal Won", color: "#16a34a", bgColor: "rgba(22, 163, 74, 0.1)" },
  { value: "lost", label: "Lost", color: "#dc2626", bgColor: "rgba(220, 38, 38, 0.1)" },
];

const SUPPORT_TICKET_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Ticket", color: "#059669", bgColor: "rgba(5, 150, 105, 0.12)" },
  { value: "contacted", label: "Investigating", color: "var(--adm-blue, #2563eb)", bgColor: "var(--adm-blue-light, rgba(37, 99, 235, 0.1))" },
  { value: "negotiating", label: "In Progress", color: "#d97706", bgColor: "rgba(217, 119, 6, 0.1)" },
  { value: "won", label: "Resolved", color: "#16a34a", bgColor: "rgba(22, 163, 74, 0.1)" },
  { value: "lost", label: "Closed", color: "var(--adm-text-3, #64748b)", bgColor: "var(--adm-surface-2, rgba(100, 116, 139, 0.1))" },
];

function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ContactDossierPane({
  convNumber,
  convKey,
  displayName,
  department = "general",
  channelId,
  meta,
  onSaveMeta,
  onClose,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onTemplate,
}: {
  convNumber: string;
  convKey: string;
  displayName: string;
  department?: "general" | "support" | "direct";
  channelId?: string;
  meta?: ConvMeta;
  onSaveMeta: (p: Partial<ConvMeta>) => void;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onTemplate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [nameVal, setNameVal] = useState(meta?.name || displayName);
  const [notesVal, setNotesVal] = useState(meta?.notes || "");

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(`+${convNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statuses = department === "support" ? SUPPORT_TICKET_STATUSES : GENERAL_DEAL_STATUSES;
  const currentStatus = statuses.find((s) => s.value === (meta?.dealStatus || "new")) || statuses[0];
  const tags = meta?.tags || [];

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onSaveMeta({ tags: [...tags, trimmed] });
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onSaveMeta({ tags: tags.filter((t) => t !== tagToRemove) });
  };

  const isLine4 = channelId === "1291624014041103";
  const isLine3 =
    channelId === "1034864159583818" ||
    channelId === "1083562997861778" ||
    department === "direct";
  const isLine2 =
    channelId === "1318810581311680" ||
    (department === "support" && !isLine4 && !isLine3);

  const themeColor = isLine4
    ? "#d97706"
    : isLine3
    ? "#7c3aed"
    : isLine2
    ? "#059669"
    : "var(--adm-blue)";

  return (
    <aside
      className="flex h-full w-80 shrink-0 flex-col border-l overflow-y-auto"
      style={{
        minWidth: "300px",
        borderColor: "var(--adm-border)",
        background: "var(--adm-surface)",
      }}
    >
      {/* Header */}
      <div
        className="flex h-14 items-center justify-between border-b px-4 shrink-0"
        style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}
      >
        <div className="flex items-center gap-2">
          <User size={16} className="text-adm-text-3" />
          <h2 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>
            Contact Dossier
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-adm-text-3 hover:text-adm-text hover:bg-adm-surface-2 transition"
          aria-label="Close dossier"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <div
          className="flex flex-col items-center text-center p-4 rounded-xl border shadow-sm"
          style={{
            borderColor: "var(--adm-border)",
            background: "var(--adm-surface-2)",
          }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-sm"
            style={{ background: themeColor }}
          >
            {initials(nameVal || convNumber)}
          </div>

          <div className="mt-3 w-full">
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={() => onSaveMeta({ name: nameVal })}
              placeholder={`+${convNumber}`}
              className="w-full text-center font-bold text-base bg-transparent border-b border-transparent hover:border-adm-border focus:border-adm-blue focus:outline-none px-2 py-0.5 transition"
              style={{ color: "var(--adm-text)" }}
              title="Click to edit contact name"
            />
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-adm-text-3">
              <span className="font-mono">+{convNumber}</span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="rounded p-1 text-adm-text-3 hover:text-adm-text transition"
                title="Copy phone number"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
              <a
                href={`https://wa.me/${convNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded p-1 text-adm-text-3 hover:text-emerald-500 transition"
                title="Open in WhatsApp Web directly"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Department Line Pill */}
          <div className="mt-3">
            {isLine4 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <SlidersHorizontal size={12} />
                Line 4
              </span>
            ) : isLine3 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <ShieldCheck size={12} />
                Line 3
              </span>
            ) : isLine2 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <LifeBuoy size={12} />
                Line 2
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Briefcase size={12} />
                Line 1
              </span>
            )}
          </div>
        </div>

        {/* Pipeline & Deal Stage */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-adm-text-3">
            {department === "support" ? "Support Ticket Status" : "Deal / Lead Stage"}
          </label>
          <select
            value={meta?.dealStatus || "new"}
            onChange={(e) => onSaveMeta({ dealStatus: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-xs font-semibold outline-none transition focus:border-adm-blue cursor-pointer"
            style={{
              borderColor: "var(--adm-border)",
              background: "var(--adm-surface)",
              color: "var(--adm-text)",
            }}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-adm-text-3">
              Contact Tags
            </span>
            {!isAddingTag && (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="flex items-center gap-1 text-xs font-medium text-adm-blue hover:underline"
              >
                <Plus size={13} />
                <span>Add Tag</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && !isAddingTag && (
              <p className="text-xs text-adm-text-3 italic">No tags assigned yet.</p>
            )}

            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border"
                style={{
                  background: "var(--adm-surface-2)",
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-text)",
                }}
              >
                <Tag size={10} className="text-adm-text-3" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 text-adm-text-3 hover:text-red-500 transition"
                >
                  <X size={11} />
                </button>
              </span>
            ))}

            {isAddingTag && (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag();
                    if (e.key === "Escape") setIsAddingTag(false);
                  }}
                  placeholder="e.g. VIP, Enterprise"
                  className="rounded-md border px-2 py-0.5 text-xs outline-none w-32 focus:border-adm-blue"
                  style={{
                    borderColor: "var(--adm-border)",
                    background: "var(--adm-surface)",
                    color: "var(--adm-text)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-md bg-adm-blue px-2 py-0.5 text-xs font-bold text-white hover:bg-adm-blue-mid"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="p-1 text-adm-text-3 hover:text-adm-text"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Internal Team Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-adm-text-3">
              Internal Notes
            </label>
            <span className="text-[10px] text-adm-text-3 font-medium">Private to staff</span>
          </div>
          <textarea
            rows={4}
            value={notesVal}
            onChange={(e) => setNotesVal(e.target.value)}
            onBlur={() => onSaveMeta({ notes: notesVal })}
            placeholder="Add confidential notes, client requirements, or context for team members…"
            className="w-full rounded-md border p-2.5 text-xs outline-none transition focus:border-adm-blue"
            style={{
              borderColor: "var(--adm-border)",
              background: "var(--adm-surface-2)",
              color: "var(--adm-text)",
            }}
          />
        </div>

        {/* Quick Actions */}
        <div
          className="space-y-2 pt-3 border-t"
          style={{ borderColor: "var(--adm-border)" }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-adm-text-3">
            Quick Actions
          </span>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onTemplate}
              className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium hover:bg-adm-surface-2 transition"
              style={{
                borderColor: "var(--adm-border)",
                background: "var(--adm-surface)",
                color: "var(--adm-text)",
              }}
            >
              <Sparkles size={14} className="text-adm-blue" />
              <span>Send Meta Template</span>
            </button>

            <button
              type="button"
              onClick={onTogglePin}
              className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium hover:bg-adm-surface-2 transition"
              style={{
                borderColor: "var(--adm-border)",
                background: "var(--adm-surface)",
                color: "var(--adm-text)",
              }}
            >
              {meta?.pinned ? (
                <>
                  <PinOff size={14} className="text-amber-500" />
                  <span>Unpin Conversation</span>
                </>
              ) : (
                <>
                  <Pin size={14} className="text-adm-text-3" />
                  <span>Pin Conversation to Top</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleArchive}
              className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium hover:bg-adm-surface-2 transition"
              style={{
                borderColor: "var(--adm-border)",
                background: "var(--adm-surface)",
                color: "var(--adm-text)",
              }}
            >
              {meta?.archived ? (
                <>
                  <ArchiveRestore size={14} className="text-blue-500" />
                  <span>Unarchive Conversation</span>
                </>
              ) : (
                <>
                  <Archive size={14} className="text-adm-text-3" />
                  <span>Archive Conversation</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
              style={{
                borderColor: "rgba(239, 68, 68, 0.2)",
                background: "rgba(239, 68, 68, 0.05)",
              }}
            >
              <Trash2 size={14} />
              <span>Delete Conversation</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
