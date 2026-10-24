"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Mail,
  UserCheck,
  Building,
  Target,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  Search,
  ExternalLink,
  ArrowRight,
  Code
} from "lucide-react";

interface Prospect {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  targetRole: string;
  keyPainPoint: string;
  valueAngle: string;
  estimatedDealSize?: string;
  contactName?: string;
  contactEmail?: string;
}

interface PipelineRecord {
  id: string;
  toEmail: string;
  toName: string;
  subject: string;
  sentFrom: string;
  sentAt: string;
  deliveryId: string;
  status: string;
}

export default function ExecutiveOutreachPortal() {
  // Discovery State
  const [niche, setNiche] = useState("UK High-Growth B2B Startups & SaaS");
  const [location, setLocation] = useState("United Kingdom & Europe");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Email Composition State
  const [isComposing, setIsComposing] = useState(false);
  const [senderMailbox, setSenderMailbox] = useState("admin@qorlune.co.uk");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");

  // Dispatch & History State
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"discover" | "compose" | "history">("discover");

  // Load Pipeline History
  const fetchPipeline = async () => {
    try {
      const res = await fetch("/api/tauqeer");
      const data = await res.json();
      if (data.success && data.prospects) {
        setPipeline(data.prospects);
      }
    } catch (e) {
      console.error("Failed to load pipeline", e);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  // 1. Run Gemini Prospecting
  const handleDiscover = async () => {
    setIsDiscovering(true);
    setSendStatus(null);
    try {
      const res = await fetch("/api/tauqeer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "discover_prospects",
          niche,
          location,
          count: 6,
        }),
      });
      const data = await res.json();
      if (data.success && data.prospects) {
        setProspects(data.prospects);
        if (data.prospects.length > 0) {
          handleSelectProspect(data.prospects[0]);
        }
      } else {
        alert("Discovery failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error calling discovery: " + err.message);
    } finally {
      setIsDiscovering(false);
    }
  };

  // 2. Select Prospect & Auto-fill
  const handleSelectProspect = (p: Prospect) => {
    setSelectedProspect(p);
    setRecipientName(p.targetRole);
    setRecipientEmail(`contact@${p.domain.toLowerCase().replace(/^https?:\/\//, "")}`);
    handleGenerateDraft(p);
  };

  // 3. Draft with Gemini
  const handleGenerateDraft = async (p: Prospect) => {
    setIsComposing(true);
    try {
      const res = await fetch("/api/tauqeer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "compose_email",
          prospect: p,
          senderEmail: senderMailbox,
        }),
      });
      const data = await res.json();
      if (data.success && data.email) {
        setEmailSubject(data.email.subject);
        setEmailBody(data.email.text);
      }
    } catch (e) {
      console.error("Compose failed", e);
    } finally {
      setIsComposing(false);
    }
  };

  // 4. Send Verified Email from tauqeermustafa.com
  const handleSendEmail = async () => {
    if (!recipientEmail || !emailSubject || !emailBody) {
      alert("Please provide recipient email, subject, and body.");
      return;
    }
    setIsSending(true);
    setSendStatus(null);
    try {
      const res = await fetch("/api/tauqeer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_email",
          toEmail: recipientEmail,
          toName: recipientName || recipientEmail,
          subject: emailSubject,
          text: emailBody,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">${emailBody.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>")}</div>`,
          fromEmail: senderMailbox,
          prospectId: selectedProspect?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus({
          success: true,
          msg: `Dispatched from ${senderMailbox} (Receipt ID: ${data.deliveryId || "Confirmed"})`,
        });
        fetchPipeline();
      } else {
        setSendStatus({
          success: false,
          msg: data.error || "Failed to dispatch email",
        });
      }
    } catch (err: any) {
      setSendStatus({
        success: false,
        msg: "Dispatch error: " + err.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Executive Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20 text-lg">
              TM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Qorlune LLC</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> Executive Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Executive AI Client Acquisition Engine • <span className="text-slate-300 font-mono">qorlune.co.uk</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Gemini 3.8 Neural Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs font-mono text-cyan-300">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>admin@qorlune.co.uk</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("discover")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "discover"
                ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            1. Find Clients & Research
          </button>

          <button
            onClick={() => setActiveTab("compose")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "compose"
                ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            2. Personal Outreach Studio
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "history"
                ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            3. Sent Pipeline ({pipeline.length})
          </button>
        </div>

        {/* Status Notification */}
        {sendStatus && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
              sendStatus.success
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {sendStatus.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              <span>{sendStatus.msg}</span>
            </div>
            <button
              onClick={() => setSendStatus(null)}
              className="text-xs opacity-70 hover:opacity-100 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: DISCOVER PROSPECTS */}
        {activeTab === "discover" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Target className="w-5 h-5" />
                  <h2 className="font-semibold text-white">Target Market Parameters</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Gemini analyzes real market segments to extract high-leverage clients with technical bottlenecks.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Industry / Niche Focus</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. UK Fintech Startups, Shopify Plus Brands, AI SaaS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Geography / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. London / UK, North America, Global Remote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Quick presets:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "B2B SaaS Series A",
                      "E-commerce £3M-£20M",
                      "Fintech & Crypto Apps",
                      "AI Workflow Automation",
                    ].map((p) => (
                      <button
                        key={p}
                        onClick={() => setNiche(p)}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDiscover}
                  disabled={isDiscovering}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-600/25 transition disabled:opacity-50"
                >
                  {isDiscovering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Discover Target Prospects
                    </>
                  )}
                </button>
              </div>

              {/* Direct Mailbox Summary */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Configured Executive Inboxes
                </span>
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-cyan-300">tauqeer@tauqeermustafa.com</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">contact@tauqeermustafa.com</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300">admin@tauqeermustafa.com</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right List of Discovered Prospects */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Discovered Target Accounts</h3>
                  <p className="text-xs text-slate-400">
                    {prospects.length > 0
                      ? `${prospects.length} curated high-fit accounts generated`
                      : "Run discovery to generate target clients"}
                  </p>
                </div>
              </div>

              {prospects.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Building className="w-6 h-6 text-slate-500" />
                  </div>
                  <h4 className="font-medium text-slate-200">No prospects loaded yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Enter your target market in the panel on the left and click &quot;Discover Target Prospects&quot; to have Gemini research high-converting accounts.
                  </p>
                  <button
                    onClick={handleDiscover}
                    className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-400 border border-slate-700 transition"
                  >
                    Quick Run Default Niche
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prospects.map((p) => {
                    const isSelected = selectedProspect?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProspect(p)}
                        className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-4 ${
                          isSelected
                            ? "bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                            : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-white text-base">{p.companyName}</h4>
                              <span className="text-xs text-cyan-400 font-mono">{p.domain}</span>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {p.industry}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-col gap-1 text-xs">
                            <div className="text-slate-400">
                              <span className="text-slate-500 font-medium">Target:</span>{" "}
                              <span className="text-slate-200">{p.targetRole}</span>
                            </div>
                            <div className="text-slate-400">
                              <span className="text-slate-500 font-medium">Bottleneck:</span>{" "}
                              <span className="text-slate-300">{p.keyPainPoint}</span>
                            </div>
                            <div className="text-slate-400">
                              <span className="text-slate-500 font-medium">Value Hook:</span>{" "}
                              <span className="text-cyan-300/90">{p.valueAngle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-mono text-[11px]">
                            {p.estimatedDealSize || "High Value"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProspect(p);
                              setActiveTab("compose");
                            }}
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            Draft Pitch <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COMPOSE & SEND */}
        {activeTab === "compose" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Context / Target Details */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Target Account</h3>
                  {selectedProspect && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                      Selected
                    </span>
                  )}
                </div>

                {selectedProspect ? (
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">Company</div>
                      <div className="text-sm font-semibold text-white">{selectedProspect.companyName}</div>
                      <div className="text-cyan-400 font-mono text-xs">{selectedProspect.domain}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
                      <div>
                        <span className="text-slate-400 font-medium">Decision Maker:</span>
                        <div className="text-slate-200 mt-0.5">{selectedProspect.targetRole}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Identified Bottleneck:</span>
                        <div className="text-slate-300 mt-0.5">{selectedProspect.keyPainPoint}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Tauqeer&apos;s Strategic Angle:</span>
                        <div className="text-cyan-300 mt-0.5">{selectedProspect.valueAngle}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGenerateDraft(selectedProspect)}
                      disabled={isComposing}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isComposing ? "animate-spin" : ""}`} />
                      Regenerate Pitch with Gemini
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-6">
                    No prospect selected. You can enter manual recipient details on the right or select an account from the Discover tab.
                  </div>
                )}
              </div>

              {/* Sender Details */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Outbound Sender Identity
                </span>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-slate-300">Sending Mailbox</label>
                  <select
                    value={senderMailbox}
                    onChange={(e) => setSenderMailbox(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="admin@qorlune.co.uk">admin@qorlune.co.uk (Primary Corporate)</option>
                    <option value="contact@qorlune.co.uk">contact@qorlune.co.uk (Client Relations)</option>
                    <option value="sales@qorlune.co.uk">sales@qorlune.co.uk (B2B Executive Sales)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-medium">100% Qorlune Corporate Domain Verification</span>
                  </div>
                  <p>
                    All emails are routed directly through your dedicated DNS-authenticated mailboxes at <strong>qorlune.co.uk</strong> with zero third-party branding.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Email Editor */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Outbound Email Studio</h3>
                  </div>
                  {isComposing && (
                    <span className="text-xs text-cyan-400 flex items-center gap-1.5 animate-pulse font-mono">
                      <Sparkles className="w-3.5 h-3.5" /> Gemini drafting personal pitch...
                    </span>
                  )}
                </div>

                {/* Recipient Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Recipient Email</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="e.g. founder@company.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-300">Recipient Name / Title</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Alex / Chief Technology Officer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Subject Line */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Subject Line</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Email Body */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-300">Message Content</label>
                  <textarea
                    rows={10}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Email body..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Send Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Signing as: <strong className="text-slate-200">Tauqeer Mustafa ({senderMailbox})</strong>
                  </span>

                  <button
                    onClick={handleSendEmail}
                    disabled={isSending || !recipientEmail || !emailSubject}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-600/25 transition disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Dispatching through {senderMailbox}...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Verified Outreach
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PIPELINE & HISTORY */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Dispatched Outreach Log</h3>
                <p className="text-xs text-slate-400">
                  Every email sent from your personal domain is verified and logged with its open.email receipt ID.
                </p>
              </div>
              <button
                onClick={fetchPipeline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh Log
              </button>
            </div>

            {pipeline.length === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3">
                <Clock className="w-8 h-8 text-slate-600" />
                <h4 className="font-medium text-slate-300">No sent emails in pipeline yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Dispatched outreach emails will appear here with delivery timestamps and server receipts.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Sent From</th>
                        <th className="py-3 px-4">Delivery ID</th>
                        <th className="py-3 px-4">Sent At</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {pipeline.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{item.toName}</div>
                            <div className="text-[11px] text-cyan-400 font-mono">{item.toEmail}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-200">
                            {item.subject}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            {item.sentFrom}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                            {item.deliveryId}
                          </td>
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                            {new Date(item.sentAt).toLocaleDateString()} {new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Dispatched
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        Qorlune LLC • Executive AI Client Acquisition &amp; Outreach Engine • Corporate Domain: qorlune.co.uk
      </footer>
    </div>
  );
}
