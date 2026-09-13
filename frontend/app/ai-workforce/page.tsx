"use client";

import React, { useState } from "react";
import {
  Bot,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Building2,
  FolderKanban,
  Users,
  DollarSign,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { VirtualEmployeeConsole } from "@/components/portal/VirtualEmployeeConsole";
import { LeadToCashEngine } from "@/components/portal/LeadToCashEngine";
import {
  useAgentBriefing,
  useAgentPulse,
  useExecuteAction,
  useRunAudit,
} from "@/hooks/useAgent";
import type { AnomalyItem } from "@/types";

type WorkforceTab = "employee" | "lead-to-cash" | "telemetry";

export default function AIWorkforcePage() {
  const [activeTab, setActiveTab] = useState<WorkforceTab>("employee");

  // Telemetry Hooks for Tab 3
  const {
    data: pulse,
    isLoading: isPulseLoading,
    isError: isPulseError,
    refetch: refetchPulse,
  } = useAgentPulse();

  const {
    data: briefing,
    isLoading: isBriefingLoading,
    refetch: refetchBriefing,
  } = useAgentBriefing();

  const runAuditMutation = useRunAudit();
  const executeActionMutation = useExecuteAction();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio readout is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      briefing?.audioSummary ||
      `${briefing?.headline || "Executive Briefing"}. ${briefing?.summary || ""}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyBriefing = () => {
    if (!briefing) return;
    const text = `📊 *Tauqeer Mustafa Inc. Executive Briefing*\nHealth Score: ${briefing.healthScore}% (${briefing.operationalGrade})\n\n*${briefing.headline}*\n${briefing.summary}\n\n🌟 *Key Wins:*\n${briefing.topAchievements.map((a) => `• ${a}`).join("\n")}\n\n⚠️ *Risks:*\n${briefing.criticalRisks.map((r) => `• ${r}`).join("\n")}\n\n🎯 *AI Recommendations:*\n${briefing.strategicRecommendations.map((s) => `• ${s}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Executive briefing copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRunAudit = async () => {
    try {
      const result = await runAuditMutation.mutateAsync();
      toast.success(
        `Autonomous audit finished in ${result.durationMs}ms: evaluated all departments.`
      );
      refetchPulse();
      refetchBriefing();
    } catch (err: unknown) {
      toast.error(
        `Audit failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleExecuteAction = async (item: AnomalyItem) => {
    if (!item.actionType) return;
    try {
      const res = await executeActionMutation.mutateAsync({
        actionType: item.actionType,
        parameters: (item.actionPayload as Record<string, unknown>) || {},
      });
      toast.success(res.message);
      refetchPulse();
      refetchBriefing();
    } catch (err: unknown) {
      toast.error(
        `Failed to execute action: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const anomaliesList = briefing?.urgentAnomalies || [];
  const filteredAnomalies = anomaliesList.filter((item) => {
    if (activeCategoryFilter === "all") return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Dedicated Platform Notice */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-950 p-5 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Autonomous AI Workforce Console
            </h1>
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              Isolated Standalone Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Execute operations instantly across tasks, leaves, announcements, CRM leads, and customer billing.
            Separated from all standard human portals with guaranteed executive identity attribution.
          </p>
        </div>

        {/* Security & Audit Compliance Pill */}
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3.5 py-2 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-emerald-200">Zero Anonymous Execution</div>
            <div className="text-[10px] text-emerald-400/80">Every action committed is logged with operator ID</div>
          </div>
        </div>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("employee")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
            activeTab === "employee"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Virtual Business Employee</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeTab === "employee"
                ? "bg-slate-950/20 text-slate-950"
                : "bg-slate-800 text-cyan-400"
            }`}
          >
            Immediate
          </span>
        </button>

        <button
          onClick={() => setActiveTab("lead-to-cash")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
            activeTab === "lead-to-cash"
              ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Lead-to-Cash Engine</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeTab === "lead-to-cash"
                ? "bg-slate-950/20 text-slate-950"
                : "bg-slate-800 text-amber-400"
            }`}
          >
            Autopilot
          </span>
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
            activeTab === "telemetry"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Pulse & Radar Telemetry</span>
          {pulse && (
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "telemetry"
                  ? "bg-white/20 text-white"
                  : "bg-slate-800 text-indigo-400"
              }`}
            >
              {pulse.healthScore}%
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Virtual Business Employee Console */}
      {activeTab === "employee" && (
        <div className="animate-in fade-in duration-300">
          <VirtualEmployeeConsole />
        </div>
      )}

      {/* Tab 2: Autonomous Lead-to-Cash Engine */}
      {activeTab === "lead-to-cash" && (
        <div className="animate-in fade-in duration-300">
          <LeadToCashEngine />
        </div>
      )}

      {/* Tab 3: Telemetry & Radar Dashboard */}
      {activeTab === "telemetry" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Real-time Telemetry Cards */}
          {pulse && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Operational Health
                  </span>
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{pulse.healthScore}%</span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    Grade {pulse.operationalGrade}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Autonomous company health index</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Active Workforce
                  </span>
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{pulse.presentToday}</span>
                  <span className="text-xs text-slate-400">/ {pulse.activeEmployees} active</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Staff attendance today</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Delivery & Sprints
                  </span>
                  <FolderKanban className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">{pulse.openTasks}</span>
                  {pulse.overdueTasks > 0 ? (
                    <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/20">
                      {pulse.overdueTasks} Overdue
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400">0 Overdue</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">Open project deliverables</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Sales Pipeline
                  </span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-300">
                    ${pulse.pipelineEstimatedValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-slate-400">({pulse.totalLeads} leads)</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Active pipeline volume</p>
              </div>
            </div>
          )}

          {/* Strategic Daily Briefing */}
          {briefing && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    {briefing.headline}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{briefing.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSpeech}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isSpeaking
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    <span>{isSpeaking ? "Stop Voice" : "Listen"}</span>
                  </button>
                  <button
                    onClick={handleCopyBriefing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy Briefing"}</span>
                  </button>
                  <button
                    onClick={handleRunAudit}
                    disabled={runAuditMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${runAuditMutation.isPending ? "animate-spin" : ""}`} />
                    <span>Run Audit</span>
                  </button>
                </div>
              </div>

              {/* Achievements & Recommendations */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                    Key Wins & Highlights
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {briefing.topAchievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
                    Autonomous Recommendations
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {briefing.strategicRecommendations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Zap className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Center & Detected Anomalies */}
          {filteredAnomalies.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Action Center: Detected Bottlenecks ({filteredAnomalies.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    One-click corrective executive actions evaluated by the autonomous auditor.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredAnomalies.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                            item.severity === "critical"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>

                    {item.actionType && (
                      <button
                        onClick={() => handleExecuteAction(item)}
                        disabled={executeActionMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white shrink-0 disabled:opacity-50"
                      >
                        <Play className="h-3 w-3 text-cyan-400" />
                        <span>{item.suggestedAction || "Execute Action"}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
