"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  Send,
  CheckCircle2,
  Settings,
  Briefcase,
  Layers,
  Users,
  CreditCard,
  Building2,
  FileText,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useAgentChat } from "@/hooks/useAgent";
import type { AgentChatMessage, ExecutedActionRecord } from "@/types";

interface PersonaConfig {
  id: string;
  name: string;
  roleTitle: string;
  icon: React.ElementType;
  badgeColor: string;
  description: string;
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "universal",
    name: "Universal Executive",
    roleTitle: "Chief Operating Officer",
    icon: Bot,
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    description: "Full cross-department oversight: Tasks, CRM deals, HR, Announcements, Invoicing",
  },
  {
    id: "project_manager",
    name: "Project Manager",
    roleTitle: "Senior Agile Delivery Lead",
    icon: Layers,
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    description: "Sprints, backlog orchestration, task provisioning, bottleneck escalation",
  },
  {
    id: "sales_exec",
    name: "Sales Director",
    roleTitle: "VP of Enterprise Revenue",
    icon: Building2,
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description: "Deal qualification, B2B pipeline, customer follow-ups, proposal synthesis",
  },
  {
    id: "hr_specialist",
    name: "People Ops Lead",
    roleTitle: "HR & Talent Director",
    icon: Users,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Leave approvals, attendance monitoring, company-wide broadcast memos",
  },
  {
    id: "finance_officer",
    name: "Billing Officer",
    roleTitle: "Head of Commercial Finance",
    icon: CreditCard,
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    description: "Invoicing, payment links, billing settlement, pricing schedules",
  },
];

const PRESET_INSTRUCTIONS = [
  "Always set task priority to High",
  "Default billing currency is USD",
  "Auto-assign deliverables to Tauqeer",
  "Default task due date is within 3 days",
  "Company signature: Tauqeer Mustafa Inc.",
];

export function VirtualEmployeeConsole() {
  const [selectedPersona, setSelectedPersona] = useState<string>("universal");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [chatHistory, setChatHistory] = useState<
    (AgentChatMessage & { executedActions?: ExecutedActionRecord[] })[]
  >([
    {
      role: "assistant",
      content:
        "Greetings leadership. I am your Autonomous Virtual Business Employee. Give me any commercial or operational instruction—from provisioning tasks to issuing client invoices or approving leaves—and I will execute it immediately.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useAgentChat();

  // Load standing instructions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tmi_employee_custom_instructions");
      if (saved) {
        setCustomInstructions(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveCustomInstructions = () => {
    try {
      localStorage.setItem("tmi_employee_custom_instructions", customInstructions);
      toast.success("Standing custom instructions saved!", {
        description: "Your virtual employee will apply these rules on every interaction.",
      });
    } catch {
      toast.error("Failed to save to local storage.");
    }
  };

  const handleApplyPreset = (preset: string) => {
    setCustomInstructions((prev) => {
      if (!prev.trim()) return preset;
      if (prev.includes(preset)) return prev;
      return `${prev.trim()}; ${preset}`;
    });
  };

  const handleSendMessage = async (directiveText?: string) => {
    const text = (directiveText || inputMessage).trim();
    if (!text || chatMutation.isPending) return;

    setInputMessage("");

    const userMsg: AgentChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const historyPayload: AgentChatMessage[] = chatHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));

      const res = await chatMutation.mutateAsync({
        message: text,
        history: historyPayload,
        customInstructions: customInstructions.trim() || undefined,
        employeePersona: selectedPersona,
        autoExecute: true,
      });

      const assistantMsg = {
        role: "assistant" as const,
        content: res.reply,
        timestamp: new Date().toISOString(),
        executedActions: res.executedActions,
      };

      setChatHistory((prev) => [...prev, assistantMsg]);

      if (res.executedActions && res.executedActions.length > 0) {
        toast.success(`Executed ${res.executedActions.length} directive(s) immediately!`, {
          description: res.executedActions.map((a) => a.entityTitle).join(", "),
        });
      }
    } catch (err: any) {
      toast.error("Execution failed", {
        description: err?.message || "Could not process instruction.",
      });
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ I encountered an error while executing your directive. Please review database connectivity and parameters.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // Scroll to bottom on chat update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech synthesis not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const lastAssistantMsg = [...chatHistory].reverse().find((m) => m.role === "assistant");
    if (!lastAssistantMsg) return;

    // Strip markdown chars for clean audio
    const cleanText = lastAssistantMsg.content
      .replace(/[#*_`~[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 md:p-7 shadow-lg space-y-6">
      {/* Header & Persona Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Autonomous Virtual Business Employee
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <span>Executive Business Staff Copilot</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${activePersonaObj.badgeColor}`}>
              {activePersonaObj.name}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">{activePersonaObj.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Standing Custom Instructions</span>
            {showConfig ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
              isSpeaking
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-border/80 bg-muted/30 text-foreground hover:bg-muted/60"
            }`}
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />}
            <span>{isSpeaking ? "Mute Voice" : "Listen"}</span>
          </button>
        </div>
      </div>

      {/* Role / Persona Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PERSONAS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPersona(p.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium border transition-all shrink-0 ${
                isSelected
                  ? `${p.badgeColor} shadow-sm font-semibold scale-[1.02]`
                  : "border-border/60 bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Standing Custom Instructions Drawer */}
      {showConfig && (
        <div className="rounded-xl border border-primary/20 bg-muted/20 p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>My Standing Custom Instructions (Persistent Rules)</span>
            </span>
            <button
              onClick={handleSaveCustomInstructions}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Save className="h-3 w-3" />
              <span>Save Rules</span>
            </button>
          </div>

          <textarea
            rows={2}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. Always set task priority to High; Default billing currency USD; Company name: Tauqeer Mustafa Inc.; Auto-assign tasks to Tauqeer..."
            className="w-full rounded-lg border border-border bg-background/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Add Preset Rule:</span>
            {PRESET_INSTRUCTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="rounded-md border border-border/70 bg-background/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat & Directives Stream */}
      <div className="rounded-xl border border-border/70 bg-background/40 p-4 min-h-[320px] max-h-[480px] overflow-y-auto space-y-4">
        {chatHistory.map((msg, i) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div key={i} className={`flex flex-col ${isAssistant ? "items-start" : "items-end"} space-y-2`}>
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-sm ${
                  isAssistant
                    ? "border border-border/80 bg-card text-foreground"
                    : "bg-primary text-primary-foreground font-medium"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Render Executed Action Badges / Receipts */}
                {msg.executedActions && msg.executedActions.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <Zap className="h-3 w-3 fill-emerald-400" />
                      <span>Executed Directives ({msg.executedActions.length})</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.executedActions.map((act, actIdx) => (
                        <div
                          key={actIdx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                            <div>
                              <div className="font-semibold text-foreground text-xs">{act.entityTitle}</div>
                              <div className="text-[10px] text-muted-foreground">{act.message}</div>
                            </div>
                          </div>

                          {typeof act.details?.checkout_url === "string" && (
                            <a
                              href={act.details.checkout_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0"
                            >
                              <span>Checkout Terminal</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick 1-Click Directive Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" />
          <span>Quick Directives:</span>
        </span>
        {[
          "⚡ Approve all pending leaves",
          "📝 Post announcement: Q4 Engineering Review at 3pm",
          "🚀 Create task Audit Paddle Webhooks due tomorrow with urgent priority",
          "💼 Add qualified lead for Apex FinTech with $35,000 budget",
          "💳 Generate invoice for $15,000 for Quantum AI Labs",
          "🔥 Escalate all overdue tasks",
          "🔄 Run autopilot",
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip.replace(/^[^\w]+/, ""))}
            disabled={chatMutation.isPending}
            className="rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/40 transition-colors shrink-0 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Directive Command Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={chatMutation.isPending}
            placeholder={`Instruct your ${activePersonaObj.name}... (e.g. "Create a task for John", "Generate invoice for $5,000 for Acme", "Approve leaves")`}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!inputMessage.trim() || chatMutation.isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-xs font-semibold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {chatMutation.isPending ? (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
}
