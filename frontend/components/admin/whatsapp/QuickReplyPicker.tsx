"use client";

import { useEffect, useState } from "react";
import { Sparkles, MessageSquare, Briefcase, Clock, ChevronRight } from "lucide-react";

export type QuickReplyItem = {
  command: string;
  title: string;
  category: "sales" | "support" | "general";
  text: string;
};

export const QUICK_REPLIES: QuickReplyItem[] = [
  {
    command: "/quote",
    title: "Project Scope & Quote Inquiry",
    category: "sales",
    text: "Thank you for reaching out to Tauqeer Inc. Could you please share your project requirements, target timeline, and estimated budget so our solutions team can prepare an accurate proposal?",
  },
  {
    command: "/pricing",
    title: "Standard Enterprise Pricing",
    category: "sales",
    text: "Our enterprise engineering packages start from tailored milestones or dedicated team arrangements. Let's schedule a 15-minute consultation to walk through options for your stack: https://tauqeer.inc/consultation",
  },
  {
    command: "/meeting",
    title: "Executive Desk Calendar",
    category: "general",
    text: "You can book a direct strategy call with our executive desk at: https://tauqeer.inc/consultation",
  },
  {
    command: "/support-hours",
    title: "Support Desk SLA Hours",
    category: "support",
    text: "Our technical support team is available 24/7 for enterprise SLA clients. Standard helpdesk hours are Monday through Saturday, 9:00 AM – 7:00 PM PKT.",
  },
  {
    command: "/bank",
    title: "Company Bank Remittance",
    category: "general",
    text: "Tauqeer Inc Official Remittance:\nBank: Bank Alfalah Islamic\nAccount Name: Tauqeer Mustafa Inc\nSwift/IBAN available upon contract execution.",
  },
  {
    command: "/services",
    title: "Enterprise Solutions Overview",
    category: "sales",
    text: "Tauqeer Inc delivers Full-Stack Web & Mobile Engineering, AI/LLM Workflow Automation, Cloud DevOps, and Official WhatsApp Business API integrations.",
  },
  {
    command: "/followup",
    title: "Client Follow-up",
    category: "sales",
    text: "Just checking in regarding our earlier conversation. Please let us know if you have any questions or need any adjustments to the proposal!",
  },
];

export function QuickReplyPicker({
  isOpen,
  query = "",
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  query: string;
  onSelect: (text: string) => void;
  onClose: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cleanQuery = query.replace(/^\//, "").toLowerCase().trim();

  const filtered = QUICK_REPLIES.filter(
    (item) =>
      item.command.toLowerCase().includes(cleanQuery) ||
      item.title.toLowerCase().includes(cleanQuery) ||
      item.text.toLowerCase().includes(cleanQuery)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        onSelect(filtered[selectedIndex].text);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-full left-4 mb-2 z-40 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl backdrop-blur-md"
      style={{ maxHeight: "320px" }}
    >
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-emerald-400" />
          <span>Quick Canned Replies</span>
        </div>
        <span className="text-[10px] text-slate-500">↑↓ to navigate • Enter to pick</span>
      </div>

      <div className="max-h-[260px] overflow-y-auto p-1 divide-y divide-slate-800/40">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No matching quick replies found for <span className="font-mono text-emerald-400">/{cleanQuery}</span>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.command}
                type="button"
                onClick={() => onSelect(item.text)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex w-full items-start gap-2.5 rounded px-2.5 py-2 text-left transition ${
                  isSelected ? "bg-emerald-600/20 text-white ring-1 ring-emerald-500/40" : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.category === "sales" ? (
                    <Briefcase size={14} className="text-blue-400" />
                  ) : item.category === "support" ? (
                    <Clock size={14} className="text-emerald-400" />
                  ) : (
                    <MessageSquare size={14} className="text-purple-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{item.command}</span>
                    <span className="truncate text-xs font-medium text-slate-200">{item.title}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{item.text}</p>
                </div>

                <ChevronRight size={14} className="mt-1 shrink-0 opacity-40" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
