"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Building,
  MessageCircle,
  Mail,
  FileCheck,
  Share2,
  Globe,
  MapPin,
  Lock,
} from "lucide-react";
import { clientSources, type ClientSourceItem } from "@/data/company-profile";
import { company } from "@/data/company";

export default function SourcesRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Sources & Credentials" },
    { id: "communication", label: "Direct Channels & WhatsApp" },
    { id: "entity", label: "Offices & Entity Details" },
    { id: "security", label: "Security & Compliance" },
    { id: "legal", label: "Legal & SLA Agreements" },
    { id: "social", label: "Social & Portfolio" },
  ];

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return clientSources.filter((src) => {
      if (selectedCategory !== "all" && src.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        src.title.toLowerCase().includes(q) ||
        src.description.toLowerCase().includes(q) ||
        (src.displayValue && src.displayValue.toLowerCase().includes(q))
      );
    });
  }, [searchTerm, selectedCategory]);

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "communication":
        return <MessageCircle size={18} className="text-green-600" />;
      case "entity":
        return <Building size={18} className="text-adm-blue" />;
      case "security":
        return <ShieldCheck size={18} className="text-purple-600" />;
      case "legal":
        return <FileCheck size={18} className="text-amber-600" />;
      case "social":
        return <Globe size={18} className="text-sky-600" />;
      default:
        return <Lock size={18} className="text-adm-text-3" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-adm-border bg-adm-surface p-5">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-adm-text">
            Verified Company Sources & Channels
          </h2>
          <p className="mt-0.5 text-xs text-adm-text-3">
            Official links, registered entity data, direct communication channels, and compliance documents for client dispatch.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute start-3 top-2.5 text-adm-text-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels, links, emails..."
            className="w-full border border-adm-border bg-adm-surface-2 py-1.5 pe-3 ps-9 text-xs text-adm-text outline-none focus:border-adm-blue"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? "border-adm-blue bg-adm-blue text-white"
                : "border-adm-border bg-adm-surface text-adm-text-2 hover:bg-adm-surface-2 hover:text-adm-text"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between border border-adm-border bg-adm-surface p-4 transition hover:border-adm-blue hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center border border-adm-border bg-adm-surface-2">
                  {getCategoryIcon(item.category)}
                </div>

                {item.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 border border-green-200">
                    <Check size={11} /> Verified
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-adm-text leading-snug">
                {item.title}
              </h3>

              <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                {item.description}
              </p>

              {item.displayValue && (
                <div className="mt-3 rounded border border-adm-border/80 bg-adm-surface-2 p-2 font-mono text-[11px] text-adm-text-2 break-all select-all">
                  {item.displayValue}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-adm-border pt-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    item.id,
                    item.link && item.link.startsWith("http")
                      ? item.link
                      : item.displayValue || item.description
                  )
                }
                className="flex items-center gap-1.5 text-xs font-semibold text-adm-text-2 hover:text-adm-blue transition"
                title="Copy source details to clipboard"
              >
                {copiedId === item.id ? (
                  <>
                    <Check size={13} className="text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-adm-blue hover:underline"
                >
                  <span>{item.actionLabel || "Open"}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-adm-border bg-adm-surface py-12 text-center">
          <Lock size={32} className="text-adm-text-3 mb-2" />
          <p className="font-bold text-adm-text text-sm">No sources found</p>
          <p className="text-xs text-adm-text-3">Try adjusting your search filter.</p>
        </div>
      )}
    </div>
  );
}
