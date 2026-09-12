"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  FolderKanban,
  Lightbulb,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  Users,
} from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Tone,
} from "@/components/portal/PortalUI";
import { LeadToCashEngine } from "@/components/portal/LeadToCashEngine";
import {
  useAgentBriefing,
  useAgentChat,
  useAgentPulse,
  useExecuteAction,
  useRunAudit,
} from "@/hooks/useAgent";
import type { AgentChatMessage, AnomalyItem } from "@/types";

export default function AIAgentConsole() {
  const {
    data: pulse,
    isLoading: isPulseLoading,
    isError: isPulseError,
    error: pulseError,
    refetch: refetchPulse,
  } = useAgentPulse();

  const {
    data: briefing,
    isLoading: isBriefingLoading,
    refetch: refetchBriefing,
  } = useAgentBriefing();

  const runAuditMutation = useRunAudit();
  const executeActionMutation = useExecuteAction();
  const chatMutation = useAgentChat();

  const [inputMessage, setInputMessage] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>([
    {
      role: "assistant",
      content:
        "Greetings! I am the TMI Executive AI Copilot. I continuously monitor company health across operations, HR, delivery, sales, and communications. How can I assist leadership today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  // Clean up speech synthesis if component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setActionNotice("Audio readout is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      briefing?.audioSummary ||
      `${briefing?.headline}. ${briefing?.summary}`;

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
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRunAudit = async () => {
    try {
      const result = await runAuditMutation.mutateAsync();
      setActionNotice(
        `Autonomous audit finished in ${result.durationMs}ms: detected ${result.anomaliesCount} item(s) across all departments.`
      );
    } catch (err: unknown) {
      setActionNotice(
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
      setActionNotice(res.message);
    } catch (err: unknown) {
      setActionNotice(
        `Failed to execute action: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleResolveAllCritical = async () => {
    try {
      const res = await executeActionMutation.mutateAsync({
        actionType: "resolve_critical_bottlenecks",
        parameters: {},
      });
      setActionNotice(res.message);
    } catch (err: unknown) {
      setActionNotice(
        `Batch resolution failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || chatMutation.isPending) return;

    const userMsg: AgentChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    if (!customPrompt) setInputMessage("");

    try {
      const response = await chatMutation.mutateAsync({
        message: textToSend,
        history: newHistory,
      });

      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content: response.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: unknown) {
      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content: `⚠️ Failed to get a response: ${
            err instanceof Error ? err.message : "Network error"
          }`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  if (isPulseLoading) {
    return <LoadingBlock label="Initializing Executive AI Agent Telemetry..." />;
  }

  if (isPulseError || !pulse) {
    return (
      <ErrorBlock
        message={
          pulseError instanceof Error
            ? pulseError.message
            : "Could not connect to the AI Agent service."
        }
        onRetry={() => {
          refetchPulse();
          refetchBriefing();
        }}
      />
    );
  }

  const healthTone: Tone =
    pulse.healthScore >= 90
      ? "green"
      : pulse.healthScore >= 75
      ? "amber"
      : "red";

  const samplePrompts = [
    "📊 What is our overall company health?",
    "⚠️ What tasks are overdue?",
    "👥 Check pending leaves and attendance",
    "💼 Summarize sales pipeline",
    "🎯 What are today's top priorities?",
  ];

  // Filter anomalies in Action Center
  const anomaliesList = briefing?.urgentAnomalies || [];
  const filteredAnomalies = anomaliesList.filter((item) => {
    if (activeCategoryFilter === "all") return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header with Autonomous Agent Status & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PortalPageHeader
          title="Autonomous Executive AI Agent"
          description="Real-time company telemetry, automated risk auditing, cross-department orchestration, and 1-click executive interventions."
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-adm-green/40 bg-adm-green-light px-3.5 py-1.5 text-xs font-semibold text-adm-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adm-green opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-adm-green"></span>
            </span>
            <span>Autopilot: Active</span>
          </div>

          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-semibold transition ${
              isSpeaking
                ? "border-adm-amber bg-adm-amber text-white"
                : "border-adm-border bg-adm-surface text-adm-text hover:border-adm-blue"
            }`}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isSpeaking ? "Stop Voice" : "Listen"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBriefing}
            className="inline-flex items-center gap-1.5 border border-adm-border bg-adm-surface px-3 py-2 text-xs font-semibold text-adm-text transition hover:border-adm-blue"
          >
            {copied ? <Check size={14} className="text-adm-green" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy Briefing"}</span>
          </button>

          {pulse.overdueTasks > 0 && (
            <button
              type="button"
              onClick={handleResolveAllCritical}
              disabled={executeActionMutation.isPending}
              className="inline-flex items-center gap-1.5 border border-adm-red bg-adm-red px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-adm-red/90 disabled:opacity-50"
            >
              <Zap size={14} />
              <span>Resolve Critical Delays</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={runAuditMutation.isPending}
            className="inline-flex items-center gap-2 border border-adm-blue bg-adm-blue px-4 py-2 text-xs font-semibold text-white transition hover:bg-adm-blue/90 disabled:opacity-50"
          >
            {runAuditMutation.isPending ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>Run Audit</span>
          </button>
        </div>
      </div>

      {/* Action Execution Notice */}
      {actionNotice && (
        <div className="flex items-center justify-between border border-adm-blue bg-adm-blue-light px-4 py-3 text-sm text-adm-blue">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-adm-blue hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Pulse Telemetry KPI Scorecards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Operational Health"
          value={`${pulse.healthScore}% (${pulse.operationalGrade})`}
          icon={Activity}
          tone={healthTone}
          hint={
            pulse.healthScore >= 90
              ? "All systems normal"
              : `${pulse.overdueTasks} critical delays`
          }
        />
        <StatCard
          label="Workforce Active"
          value={`${pulse.presentToday} / ${pulse.activeEmployees}`}
          icon={Users}
          tone="green"
          href="/management/attendance"
          hint={`${pulse.pendingLeaves} leave(s) awaiting approval`}
        />
        <StatCard
          label="Delivery Velocity"
          value={`${pulse.openTasks} open`}
          icon={FolderKanban}
          tone={pulse.overdueTasks > 0 ? "red" : "neutral"}
          href="/management/delivery"
          hint={
            pulse.overdueTasks > 0
              ? `⚠️ ${pulse.overdueTasks} overdue task(s)`
              : `${pulse.completedTasksThisWeek} closed this week`
          }
        />
        <StatCard
          label="Sales Pipeline"
          value={`$${pulse.pipelineEstimatedValue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          icon={DollarSign}
          tone="blue"
          href="/management/pipeline"
          hint={`${pulse.qualifiedLeads} qualified of ${pulse.totalLeads} leads`}
        />
      </div>

      {/* Autonomous Lead-to-Cash Engine */}
      <LeadToCashEngine />

      {/* 2. Departmental Health Breakdown (New Upgrade) */}
      {pulse.departments && pulse.departments.length > 0 && (
        <Panel title="Departmental Operational Matrix" icon={Building2}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pulse.departments.map((dept) => (
              <div
                key={dept.id}
                className="flex flex-col justify-between border border-adm-border bg-adm-surface p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-adm-text">{dept.name}</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        dept.grade === "A"
                          ? "bg-adm-green-light text-adm-green"
                          : dept.grade === "B"
                          ? "bg-adm-amber-light text-adm-amber"
                          : "bg-adm-red-light text-adm-red"
                      }`}
                    >
                      {dept.healthScore}% ({dept.grade})
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-adm-text-3">
                    <span>Staff: {dept.presentToday}/{dept.headcount} present</span>
                    <span className={dept.overdueTasks > 0 ? "text-adm-red font-semibold" : ""}>
                      {dept.overdueTasks > 0 ? `${dept.overdueTasks} overdue` : `${dept.openTasks} active`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* 3. Daily Executive Intelligence Briefing */}
      {briefing && (
        <Panel
          title="Daily Executive Intelligence Briefing"
          icon={Sparkles}
          action={
            <span className="text-xs font-mono text-adm-text-3">
              Generated: {new Date(briefing.generatedAt).toLocaleTimeString()}
            </span>
          }
        >
          <div className="flex flex-col gap-6">
            <div className="rounded-none border-l-4 border-adm-blue bg-adm-surface-2 p-4">
              <h3 className="text-base font-semibold text-adm-text">
                {briefing.headline}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-adm-text-2">
                {briefing.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="border border-adm-border bg-adm-surface p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-adm-green">
                  <CheckCircle2 size={15} />
                  <span>Key Wins & Milestones</span>
                </div>
                <ul className="mt-3 flex flex-col gap-2 text-xs text-adm-text-2">
                  {briefing.topAchievements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-adm-green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-adm-border bg-adm-surface p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-adm-red">
                  <AlertOctagon size={15} />
                  <span>Critical Operational Risks</span>
                </div>
                <ul className="mt-3 flex flex-col gap-2 text-xs text-adm-text-2">
                  {briefing.criticalRisks.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-adm-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-adm-border bg-adm-surface p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-adm-blue">
                  <Lightbulb size={15} />
                  <span>AI Recommendations</span>
                </div>
                <ul className="mt-3 flex flex-col gap-2 text-xs text-adm-text-2">
                  {briefing.strategicRecommendations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-adm-blue" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* 4. Action Center & Urgent Triage with Category Filters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="Action Center: Bottlenecks & Anomalies"
          icon={AlertTriangle}
          action={
            <div className="flex items-center gap-1.5">
              {["all", "delivery", "hr", "sales"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2 py-0.5 text-[11px] font-medium transition ${
                    activeCategoryFilter === cat
                      ? "bg-adm-blue text-white"
                      : "bg-adm-surface-2 text-adm-text-2 hover:text-adm-text"
                  }`}
                >
                  {cat === "all"
                    ? "All"
                    : cat === "delivery"
                    ? "Delivery"
                    : cat === "hr"
                    ? "HR"
                    : "Sales"}
                </button>
              ))}
            </div>
          }
        >
          {filteredAnomalies.length === 0 ? (
            <EmptyBlock
              title="All Clear"
              description="No bottlenecks or overdue risks detected in this category."
            />
          ) : (
            <div className="flex flex-col divide-y divide-adm-border">
              {filteredAnomalies.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusPill
                        status={
                          item.severity === "critical"
                            ? "rejected"
                            : item.severity === "warning"
                            ? "pending"
                            : "active"
                        }
                      />
                      <h4 className="text-sm font-semibold text-adm-text">
                        {item.title}
                      </h4>
                    </div>
                    {item.actionType && (
                      <button
                        type="button"
                        onClick={() => handleExecuteAction(item)}
                        disabled={executeActionMutation.isPending}
                        className="inline-flex items-center gap-1.5 border border-adm-border bg-adm-surface-2 px-2.5 py-1 text-xs font-medium text-adm-text transition hover:border-adm-blue hover:text-adm-blue disabled:opacity-50"
                      >
                        <Play size={12} />
                        <span>Execute</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-adm-text-2">{item.description}</p>
                  {item.suggestedAction && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-adm-blue">
                      <Sparkles size={12} />
                      <span>Suggested: {item.suggestedAction}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* 5. Interactive Executive Copilot Chat Terminal */}
        <Panel title="Interactive Executive Terminal" icon={Bot}>
          <div className="flex flex-col h-[420px]">
            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-none p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-adm-blue text-white"
                        : "border border-adm-border bg-adm-surface-2 text-adm-text"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  </div>
                  <span className="mt-1 text-[10px] text-adm-text-3 font-mono">
                    {msg.role === "user" ? "You" : "Executive AI"} •{" "}
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex items-center gap-2 text-xs text-adm-text-3 italic p-2">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Synthesizing operational response...</span>
                </div>
              )}
            </div>

            {/* Prompt suggestions */}
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-adm-border pt-2.5">
              {samplePrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-none border border-adm-border bg-adm-surface px-2 py-1 text-[11px] text-adm-text-2 transition hover:border-adm-blue hover:text-adm-blue"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask the AI Manager about operations, tasks, team or pipeline..."
                className="flex-1 rounded-none border border-adm-border bg-adm-surface px-3 py-2 text-xs text-adm-text outline-none focus:border-adm-blue"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="inline-flex items-center justify-center border border-adm-blue bg-adm-blue px-3 py-2 text-xs font-semibold text-white transition hover:bg-adm-blue/90 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
