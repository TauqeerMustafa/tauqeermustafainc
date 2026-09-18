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
} from "lucide-react";
import type { ConvMeta, WANumberInfo } from "@/hooks/useWhatsApp";

type DealStatus = "new" | "contacted" | "negotiating" | "won" | "lost";

const GENERAL_DEAL_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Lead", color: "var(--adm-blue, #2563eb)", bgColor: "var(--adm-blue-light, rgba(37, 99, 235, 0.1))" },
  { value: "contacted", label: "Contacted", color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)" },
  { value: "negotiating", label: "Negotiating", color: "#d97706", bgColor: "rgba(217, 119, 6, 0.1)" },
  { value: "won", label: "Deal Won", color: "#16a34a", bgColor: "rgba(22, 163, 74, 0.1)" },
  { value: "lost", label: "Lost", color: "#dc2626", bgColor: "rgba(220, 38, 38, 0.1)" },
];

const SUPPORT_TICKET_STATUSES: { value: DealStatus; label: string; color: string; bgColor: string }[] = [
  { value: "new", label: "New Ticket", color: "#059669", bgColor: "rgba(5, 150, 105, 0.12)" },
  { value: "contacted", label: "Investigating", color: "#2563eb", bgColor: "rgba(37, 99, 235, 0.1)" },
  { value: "negotiating", label: "In Progress", color: "#d97706", bgColor: "rgba(217, 119, 6, 0.1)" },
  { value: "won", label: "Resolved", color: "#16a34a", bgColor: "rgba(22, 163, 74, 0.1)" },
  { value: "lost", label: "Closed", color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)" },
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

  return (
    <aside
      className="flex h-full w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900/95 overflow-y-auto"
      style={{ minWidth: "300px" }}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-slate-400" />
          <h2 className="text-sm font-bold text-slate-200">Contact & Deal Dossier</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          aria-label="Close dossier"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg ring-4 ring-slate-800"
            style={{
              background:
                department === "direct"
                  ? "#7c3aed"
                  : department === "support"
                  ? "#059669"
                  : "#2563eb",
            }}
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
              className="w-full text-center font-bold text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-2 py-0.5 text-base transition"
              title="Click to edit contact name"
            />
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <span className="font-mono">+{convNumber}</span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="rounded p-1 text-slate-400 hover:text-white transition"
                title="Copy phone number"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              <a
                href={`https://wa.me/${convNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded p-1 text-slate-400 hover:text-emerald-400 transition"
                title="Open in WhatsApp Web directly"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Department Line Pill */}
          <div className="mt-3">
            {department === "direct" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck size={12} />
                Executive Desk (Line 3)
              </span>
            ) : department === "support" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <LifeBuoy size={12} />
                Client Support Desk (Line 2)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Briefcase size={12} />
                General Inquiries & Sales (Line 1)
              </span>
            )}
          </div>
        </div>

        {/* Pipeline & Deal Stage */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {department === "support" ? "Support Ticket Status" : "Deal / Lead Stage"}
          </label>
          <select
            value={meta?.dealStatus || "new"}
            onChange={(e) => onSaveMeta({ dealStatus: e.target.value })}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 outline-none transition focus:border-emerald-500"
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Tags</span>
            {!isAddingTag && (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                <Plus size={13} />
                <span>Add Tag</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && !isAddingTag && (
              <p className="text-xs text-slate-500 italic">No tags assigned yet.</p>
            )}

            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 border border-slate-700"
              >
                <Tag size={10} className="text-slate-400" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 text-slate-500 hover:text-red-400 transition"
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
                  className="rounded border border-emerald-500/60 bg-slate-950 px-2 py-0.5 text-xs text-slate-200 outline-none w-32"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="p-1 text-slate-400 hover:text-white"
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Internal Team Notes
            </label>
            <span className="text-[10px] text-slate-500">Private to staff</span>
          </div>
          <textarea
            rows={4}
            value={notesVal}
            onChange={(e) => setNotesVal(e.target.value)}
            onBlur={() => onSaveMeta({ notes: notesVal })}
            placeholder="Add confidential notes, client requirements, or context for team members…"
            className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition focus:border-emerald-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick CRM Actions</span>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onTemplate}
              className="flex w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>Send Meta Template</span>
            </button>

            <button
              type="button"
              onClick={onTogglePin}
              className="flex w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              {meta?.pinned ? (
                <>
                  <PinOff size={14} className="text-amber-400" />
                  <span>Unpin Conversation</span>
                </>
              ) : (
                <>
                  <Pin size={14} className="text-slate-400" />
                  <span>Pin Conversation to Top</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleArchive}
              className="flex w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              {meta?.archived ? (
                <>
                  <ArchiveRestore size={14} className="text-blue-400" />
                  <span>Unarchive Conversation</span>
                </>
              ) : (
                <>
                  <Archive size={14} className="text-slate-400" />
                  <span>Archive Conversation</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="flex w-full items-center gap-2 rounded-md border border-red-950/40 bg-red-950/20 px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
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
