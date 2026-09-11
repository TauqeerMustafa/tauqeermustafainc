"use client";

import { useState } from "react";
import { Copy, Check, MessageSquare, Mail, FileText, Send, Sparkles, User, Building } from "lucide-react";
import { outreachTemplates, type OutreachTemplate } from "@/data/company-profile";

export default function OutreachTemplates() {
  const [clientName, setClientName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");

  const channels = [
    { id: "all", label: "All Scripts & Pitches" },
    { id: "whatsapp", label: "WhatsApp Messages" },
    { id: "email", label: "Email Introductions" },
    { id: "proposal", label: "Security & RFP Blurbs" },
    { id: "linkedin", label: "LinkedIn Direct" },
  ];

  const filtered = outreachTemplates.filter((t) =>
    selectedChannel === "all" ? true : t.channel === selectedChannel
  );

  const formatTemplate = (tmpl: OutreachTemplate) => {
    let body = tmpl.body;
    if (clientName.trim()) {
      body = body.replaceAll("[ClientName]", clientName.trim());
    }
    if (employeeName.trim()) {
      body = body.replaceAll("[EmployeeName]", employeeName.trim());
    }
    if (companyName.trim()) {
      body = body.replaceAll("[CompanyName]", companyName.trim());
    }
    return body;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Quick Customization Variables Header */}
      <div className="border border-adm-border bg-adm-surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold uppercase text-adm-text flex items-center gap-2">
              <Sparkles size={16} className="text-adm-blue" />
              Client Outreach & Pitch Generator
            </h2>
            <p className="text-xs text-adm-text-3 mt-0.5">
              Fill in client variables to instantly personalize ready-to-dispatch messages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-adm-text-2 mb-1 flex items-center gap-1">
              <User size={12} className="text-adm-blue" />
              Client / Recipient Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs text-adm-text outline-none focus:border-adm-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-adm-text-2 mb-1 flex items-center gap-1">
              <Building size={12} className="text-adm-blue" />
              Client Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Health"
              className="w-full border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs text-adm-text outline-none focus:border-adm-blue"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-adm-text-2 mb-1 flex items-center gap-1">
              <User size={12} className="text-green-600" />
              Your Name (Sender)
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs text-adm-text outline-none focus:border-adm-blue"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setSelectedChannel(ch.id)}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${
              selectedChannel === ch.id
                ? "border-adm-blue bg-adm-blue text-white"
                : "border-adm-border bg-adm-surface text-adm-text-2 hover:bg-adm-surface-2 hover:text-adm-text"
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 gap-5">
        {filtered.map((tmpl) => {
          const formattedBody = formatTemplate(tmpl);
          const fullMessage = tmpl.subject
            ? `Subject: ${tmpl.subject}\n\n${formattedBody}`
            : formattedBody;

          return (
            <div
              key={tmpl.id}
              className="border border-adm-border bg-adm-surface p-5 space-y-3 transition hover:border-adm-blue"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-adm-border pb-3">
                <div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-adm-blue-light text-adm-blue border border-adm-blue/20 mb-1">
                    {tmpl.channel}
                  </span>
                  <h3 className="text-sm font-bold text-adm-text">{tmpl.title}</h3>
                  <p className="text-xs text-adm-text-3">{tmpl.purpose}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(tmpl.id, fullMessage)}
                  className="btn-press flex items-center gap-1.5 bg-adm-blue px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                >
                  {copiedId === tmpl.id ? (
                    <>
                      <Check size={14} />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>1-Click Copy Message</span>
                    </>
                  )}
                </button>
              </div>

              {tmpl.subject && (
                <div className="rounded bg-adm-surface-2 p-2.5 text-xs font-semibold text-adm-text border border-adm-border">
                  <span className="text-adm-text-3 font-normal uppercase tracking-wider text-[10px] block">
                    Email Subject:
                  </span>
                  {tmpl.subject.replaceAll("[ClientName]", clientName || "[ClientName]")}
                </div>
              )}

              <div className="rounded border border-adm-border/80 bg-adm-surface-2 p-4 font-mono text-xs text-adm-text-2 leading-relaxed whitespace-pre-wrap select-all">
                {formattedBody}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
