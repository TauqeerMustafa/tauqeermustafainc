"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import RevenueBanner from "@/components/portal/RevenueBanner";
import {
  Badge,
  Breadcrumb,
  Callout,
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  Label,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  Progress,
  StatCard,
  StatusPill,
  Tabs,
  Td,
  Toolbar,
  inputClass,
} from "@/components/portal/PortalUI";
import { useLeadPipeline, useLeads } from "@/hooks/useLeads";
import { useI18n } from "@/lib/i18n";
import {
  B2BSalesState,
  DEFAULT_TEMPLATES,
  INITIAL_WEEKLY_SCORECARD,
  PLAYBOOK_45_DAYS,
  PlaybookDayTask,
  SALES_PHASES,
  STORAGE_KEY_V1,
  SalesPhaseId,
  WeeklyScorecardEntry,
  getDefaultSalesState,
} from "@/constants/salesPlaybook";

type SalesTab = "tasks" | "templates" | "pipeline" | "metrics";
type PhaseFilter = "all" | SalesPhaseId | "today" | "incomplete";
type TemplateCategoryFilter = "all" | "email" | "linkedin" | "phone" | "objection";

function formatCurrency(amount: number | null | undefined, currency: string = "USD"): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateCurrentDay(startDateStr: string): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr);
  const now = new Date();
  // Set both to midnight for pure day difference
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(45, diffDays));
}

export default function B2BSalesCommandCenterPage() {
  const { t } = useI18n();
  const [, startTransition] = useTransition();

  // Queries
  const pipelineQuery = useLeadPipeline();
  const leadsQuery = useLeads({ limit: 100 });

  // Persistent Local State
  const [salesState, setSalesState] = useState<B2BSalesState>(getDefaultSalesState);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<SalesTab>("tasks");

  // Tasks Filter & State
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Templates Filter & State
  const [templateCategory, setTemplateCategory] = useState<TemplateCategoryFilter>("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Pipeline Filter & State
  const [pipelineSearch, setPipelineSearch] = useState("");

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_V1);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<B2BSalesState>;
        setSalesState({
          startDate: parsed.startDate || new Date().toISOString().slice(0, 10),
          completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
          customTemplates: parsed.customTemplates || {},
          weeklyScorecard: Array.isArray(parsed.weeklyScorecard)
            ? parsed.weeklyScorecard
            : INITIAL_WEEKLY_SCORECARD,
          taskNotes: parsed.taskNotes || {},
        });
      }
    } catch {
      // ignore storage parsing error
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Save to localStorage
  const persistState = (updater: (prev: B2BSalesState) => B2BSalesState) => {
    setSalesState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(next));
      } catch {
        // quota exceeded or private mode
      }
      return next;
    });
  };

  // Calculations based on Start Date
  const currentDay = useMemo(() => calculateCurrentDay(salesState.startDate), [salesState.startDate]);
  const daysRemaining = Math.max(0, 45 - currentDay);
  const progressPct = Math.round((salesState.completedDays.length / 45) * 100);

  // Determine current active phase based on currentDay
  const currentPhase = useMemo(() => {
    return SALES_PHASES.find((p) => currentDay >= p.startDay && currentDay <= p.endDay) || SALES_PHASES[0];
  }, [currentDay]);

  // Consecutive Streak calculation
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let d = currentDay; d >= 1; d--) {
      if (salesState.completedDays.includes(d)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [currentDay, salesState.completedDays]);

  // Toggle single day task
  const toggleDayCompletion = (day: number) => {
    persistState((prev) => {
      const exists = prev.completedDays.includes(day);
      return {
        ...prev,
        completedDays: exists
          ? prev.completedDays.filter((d) => d !== day)
          : [...prev.completedDays, day].sort((a, b) => a - b),
      };
    });
  };

  // Save note for a specific day
  const updateTaskNote = (day: number, note: string) => {
    persistState((prev) => ({
      ...prev,
      taskNotes: {
        ...prev.taskNotes,
        [day]: note,
      },
    }));
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return PLAYBOOK_45_DAYS.filter((task) => {
      // Phase filtering
      if (phaseFilter === "today") {
        if (task.day !== currentDay) return false;
      } else if (phaseFilter === "incomplete") {
        if (salesState.completedDays.includes(task.day)) return false;
      } else if (phaseFilter !== "all") {
        if (task.phase !== phaseFilter) return false;
      }

      // Keyword search
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.actionItem.toLowerCase().includes(q) ||
          `day ${task.day}`.includes(q)
        );
      }

      return true;
    });
  }, [phaseFilter, taskSearch, currentDay, salesState.completedDays]);

  // Mark all tasks in current filter as done
  const markCurrentPhaseDone = () => {
    const tasksToComplete = filteredTasks.map((t) => t.day);
    persistState((prev) => ({
      ...prev,
      completedDays: Array.from(new Set([...prev.completedDays, ...tasksToComplete])).sort((a, b) => a - b),
    }));
  };

  // Reset tasks
  const resetTasks = () => {
    if (window.confirm("Are you sure you want to reset all completed tasks in this 45-day cycle?")) {
      persistState((prev) => ({
        ...prev,
        completedDays: [],
      }));
    }
  };

  // Template handling
  const getTemplateContent = (tmpl: (typeof DEFAULT_TEMPLATES)[0]) => {
    const custom = salesState.customTemplates[tmpl.id];
    return {
      subject: custom?.subject ?? tmpl.subject,
      body: custom?.body ?? tmpl.body,
    };
  };

  const updateTemplateContent = (id: string, field: "subject" | "body", value: string) => {
    persistState((prev) => {
      const existing = prev.customTemplates[id] || {};
      return {
        ...prev,
        customTemplates: {
          ...prev.customTemplates,
          [id]: {
            ...existing,
            [field]: value,
          },
        },
      };
    });
  };

  const resetTemplateToDefault = (id: string) => {
    persistState((prev) => {
      const nextCustom = { ...prev.customTemplates };
      delete nextCustom[id];
      return {
        ...prev,
        customTemplates: nextCustom,
      };
    });
  };

  const copyToClipboard = async (tmplId: string, textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedTemplateId(tmplId);
      setTimeout(() => setCopiedTemplateId(null), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedTemplateId(tmplId);
      setTimeout(() => setCopiedTemplateId(null), 2500);
    }
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return DEFAULT_TEMPLATES.filter((tmpl) => {
      if (templateCategory !== "all" && tmpl.category !== templateCategory) {
        return false;
      }
      if (templateSearch.trim()) {
        const q = templateSearch.toLowerCase();
        const content = getTemplateContent(tmpl);
        return (
          tmpl.name.toLowerCase().includes(q) ||
          (content.subject && content.subject.toLowerCase().includes(q)) ||
          content.body.toLowerCase().includes(q) ||
          tmpl.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [templateCategory, templateSearch, salesState.customTemplates]);

  // Scorecard entry update
  const updateScorecardMetric = (weekIndex: number, field: keyof WeeklyScorecardEntry, val: number) => {
    persistState((prev) => {
      const nextScorecard = [...prev.weeklyScorecard];
      nextScorecard[weekIndex] = {
        ...nextScorecard[weekIndex],
        [field]: Number.isNaN(val) ? 0 : val,
      };
      return {
        ...prev,
        weeklyScorecard: nextScorecard,
      };
    });
  };

  // Reset scorecard
  const resetScorecard = () => {
    if (window.confirm("Reset all weekly KPI logs to zero?")) {
      persistState((prev) => ({
        ...prev,
        weeklyScorecard: INITIAL_WEEKLY_SCORECARD,
      }));
    }
  };

  // CSV Lead Export
  const exportLeadsCsv = () => {
    const leads = leadsQuery.data ?? [];
    if (leads.length === 0) {
      alert("No leads found in CRM to export.");
      return;
    }

    const headers = [
      "Company Name",
      "Contact Person",
      "Title",
      "Email",
      "Phone",
      "Industry",
      "Source",
      "Status",
      "Estimated Value",
      "Currency",
      "Next Follow Up",
      "Created At",
    ];

    const rows = leads.map((lead) => [
      `"${(lead.companyName || "").replace(/"/g, '""')}"`,
      `"${(lead.contactPerson || "").replace(/"/g, '""')}"`,
      `"${(lead.contactTitle || "").replace(/"/g, '""')}"`,
      `"${(lead.email || "").replace(/"/g, '""')}"`,
      `"${(lead.phone || "").replace(/"/g, '""')}"`,
      `"${(lead.industry || "").replace(/"/g, '""')}"`,
      `"${(lead.source || "").replace(/"/g, '""')}"`,
      `"${(lead.status || "").replace(/"/g, '""')}"`,
      lead.estimatedValue ?? 0,
      lead.currency || "USD",
      lead.nextFollowUpDate || "",
      lead.createdAt || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `b2b_sales_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pipeline filter
  const filteredLeads = useMemo(() => {
    const leads = leadsQuery.data ?? [];
    if (!pipelineSearch.trim()) return leads;
    const q = pipelineSearch.toLowerCase();
    return leads.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.industry && l.industry.toLowerCase().includes(q)) ||
        l.status.toLowerCase().includes(q),
    );
  }, [leadsQuery.data, pipelineSearch]);

  const pipeline = pipelineQuery.data;
  const totalLeads = pipeline?.totalLeads ?? 0;
  const openValue = pipeline?.openValue ?? 0;
  const wonValue = pipeline?.wonValue ?? 0;
  const followUpsDue = pipeline?.followUpsDue ?? 0;

  return (
    <div className="flex flex-col gap-8">
      {/* ── Breadcrumbs ── */}
      <Breadcrumb
        items={[
          { label: t("Admin"), href: "/admin/dashboard" },
          { label: t("Revenue & CRM"), href: "/admin/client" },
          { label: t("B2B Sales Command") },
        ]}
      />

      {/* ── Revenue Banner with active sales tab ── */}
      <RevenueBanner active="sales" />

      {/* ── Page Header with Strategy Controls ── */}
      <PortalPageHeader
        title={t("B2B Sales Command Center")}
        description={t(
          "45-Day systematic outbound engine: daily checklists, objection navigation scripts, live pipeline synchronization, and velocity metrics.",
        )}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/client"
            className="inline-flex items-center gap-1.5 rounded-none border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-text hover:border-adm-border-2"
          >
            <ExternalLink size={13} className="text-adm-text-3" />
            <span>{t("Open CRM Workbench")}</span>
          </Link>
          <PortalButton
            variant="primary"
            icon={Download}
            onClick={exportLeadsCsv}
          >
            {t("Export CSV")}
          </PortalButton>
        </div>
      </PortalPageHeader>

      {/* ── Date Alignment & Streak Engine Widget ── */}
      <Panel tone="blue" padded={false}>
        <div className="flex flex-col gap-4 border-b border-adm-border bg-adm-surface-2/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-none bg-adm-blue text-white">
                <Calendar size={16} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-adm-text-3">
                  {t("Outreach Cycle Start Date")}
                </p>
                <input
                  type="date"
                  value={salesState.startDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    startTransition(() => {
                      persistState((prev) => ({ ...prev, startDate: newDate }));
                    });
                  }}
                  className="mt-0.5 rounded-none border border-adm-border bg-adm-surface px-2.5 py-1 text-xs font-semibold text-adm-text outline-none focus:border-adm-blue"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                persistState((prev) => ({ ...prev, startDate: today }));
              }}
              className="rounded-full border border-adm-border px-3 py-1 text-[11px] font-medium text-adm-text-2 hover:bg-adm-surface-2"
            >
              {t("Reset to Today")}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-full border border-adm-blue/30 bg-adm-blue-light px-3 py-1 font-semibold text-adm-blue">
              <Sparkles size={13} />
              <span>
                {t("Day {{day}} of 45", { day: currentDay })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-adm-amber/30 bg-adm-amber-light px-3 py-1 font-semibold text-adm-amber">
              <Clock size={13} />
              <span>
                {daysRemaining > 0
                  ? t("{{days}} Days Remaining", { days: daysRemaining })
                  : t("Playbook Cycle Completed")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-adm-green/30 bg-adm-green-light px-3 py-1 font-semibold text-adm-green">
              <Flame size={13} />
              <span>
                {t("{{streak}}-Day Streak", { streak: currentStreak })}
              </span>
            </div>
          </div>
        </div>

        {/* Thin progress bar across top */}
        <div className="px-5 py-3.5 bg-adm-surface">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-adm-text">
              {t("Overall 45-Day Completion: {{pct}}%", { pct: progressPct })}
            </span>
            <span className="text-adm-text-3 tabular-nums">
              {salesState.completedDays.length} / 45 {t("days completed")}
            </span>
          </div>
          <Progress value={progressPct} tone={progressPct >= 80 ? "green" : "blue"} size="sm" />
        </div>
      </Panel>

      {/* ── 4-Column High-Level Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("Completed Tasks")}
          value={`${salesState.completedDays.length} / 45`}
          icon={CheckSquare}
          tone="blue"
          hint={`${progressPct}% ${t("of 45-day playbook finished")}`}
        />

        <StatCard
          label={t("Total CRM Leads")}
          value={totalLeads}
          icon={Target}
          tone="amber"
          hint={
            followUpsDue > 0
              ? `${followUpsDue} ${t("follow-ups due today")}`
              : t("All follow-ups current")
          }
        />

        <StatCard
          label={t("Pipeline Value")}
          value={formatCurrency(openValue + wonValue)}
          icon={TrendingUp}
          tone="green"
          hint={`${formatCurrency(wonValue)} ${t("won")} · ${formatCurrency(openValue)} ${t("open")}`}
        />

        <StatCard
          label={t("Current Focus Phase")}
          value={currentPhase.name.split(" ")[0]}
          icon={Shield}
          tone={currentPhase.colorTone}
          hint={`${currentPhase.daysRange} · ${currentPhase.name}`}
        />
      </div>

      {/* ── Main Command Tabs ── */}
      <Tabs<SalesTab>
        tabs={[
          {
            id: "tasks",
            label: t("45-Day Action Plan"),
            count: 45 - salesState.completedDays.length,
            countTone: "amber",
          },
          {
            id: "templates",
            label: t("Outreach & Objection Scripts"),
            count: DEFAULT_TEMPLATES.length,
            countTone: "blue",
          },
          {
            id: "pipeline",
            label: t("CRM Lead Pipeline"),
            count: totalLeads,
            countTone: "green",
          },
          {
            id: "metrics",
            label: t("Weekly Performance Scorecard"),
          },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: 45-DAY ACTION PLAN (TASKS ENGINE)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tasks" && (
        <div className="flex flex-col gap-6">
          {/* Phase Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-adm-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-adm-text-3 mr-2">
              {t("Filter:")}
            </span>

            {[
              { id: "all", label: t("All (45 Days)") },
              { id: "foundation", label: t("Foundation (D1–9)") },
              { id: "outreach", label: t("Outreach (D10–16)") },
              { id: "pipeline", label: t("Pipeline (D17–24)") },
              { id: "closing", label: t("Closing (D25–35)") },
              { id: "scale", label: t("Scale (D36–45)") },
              { id: "today", label: t("Today (Day {{d}})", { d: currentDay }) },
              { id: "incomplete", label: t("Incomplete Only") },
            ].map((filter) => {
              const isActive = phaseFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPhaseFilter(filter.id as PhaseFilter)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
                    isActive
                      ? "bg-adm-blue text-white font-semibold"
                      : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Task Search & Batch Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-3 text-adm-text-3" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder={t("Search tasks, deliverables, keywords…")}
                className={`${inputClass} pl-9 py-2 text-xs`}
              />
              {taskSearch && (
                <button
                  type="button"
                  onClick={() => setTaskSearch("")}
                  className="absolute right-3 top-2.5 text-adm-text-3 hover:text-adm-text"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markCurrentPhaseDone}
                className="inline-flex items-center gap-1.5 rounded-none border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-semibold text-adm-text hover:border-adm-border-2"
              >
                <CheckCircle2 size={13} className="text-adm-green" />
                <span>{t("Complete Filtered ({{count}})", { count: filteredTasks.length })}</span>
              </button>

              <button
                type="button"
                onClick={resetTasks}
                className="inline-flex items-center gap-1.5 rounded-none border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-medium text-adm-text-3 hover:text-adm-red hover:border-adm-red/30"
              >
                <RotateCcw size={13} />
                <span>{t("Reset All")}</span>
              </button>
            </div>
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <EmptyBlock
              title={t("No tasks found")}
              description={t("Try clearing your search filter or selecting a different strategy phase.")}
            />
          ) : (
            <div className="flex flex-col divide-y divide-adm-border border border-adm-border bg-adm-surface">
              {filteredTasks.map((task) => {
                const isCompleted = salesState.completedDays.includes(task.day);
                const isToday = task.day === currentDay;
                const isExpanded = expandedTaskId === task.day;
                const phaseObj = SALES_PHASES.find((p) => p.id === task.phase);
                const savedNote = salesState.taskNotes[task.day] || "";

                return (
                  <div
                    key={task.day}
                    className={`flex flex-col transition-colors ${
                      isCompleted
                        ? "bg-adm-surface-2/20 opacity-80"
                        : isToday
                          ? "bg-adm-blue/5 border-l-4 border-l-adm-blue"
                          : "hover:bg-adm-surface-2/30"
                    }`}
                  >
                    {/* Main Row */}
                    <div className="flex items-start gap-3.5 p-4">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleDayCompletion(task.day)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border transition ${
                          isCompleted
                            ? "border-adm-green bg-adm-green text-white"
                            : "border-adm-border-2 bg-adm-surface hover:border-adm-blue"
                        }`}
                        aria-label={`Mark Day ${task.day} as ${isCompleted ? "incomplete" : "complete"}`}
                      >
                        {isCompleted && <Check size={14} strokeWidth={3} />}
                      </button>

                      {/* Day Pill */}
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${
                          isToday
                            ? "bg-adm-blue text-white"
                            : isCompleted
                              ? "bg-adm-green-light text-adm-green border border-adm-green/30"
                              : "bg-adm-surface-2 text-adm-text-2 border border-adm-border"
                        }`}
                      >
                        Day {task.day}
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm font-semibold tracking-tight ${
                              isCompleted ? "line-through text-adm-text-3" : "text-adm-text"
                            }`}
                          >
                            {task.title}
                          </h3>

                          {phaseObj && (
                            <Badge tone={phaseObj.colorTone}>{phaseObj.name}</Badge>
                          )}

                          {task.targetCount && (
                            <span className="rounded-full border border-adm-border bg-adm-surface-2 px-2 py-0.5 text-[10px] font-medium text-adm-text-3">
                              🎯 {task.targetCount}
                            </span>
                          )}

                          {isToday && (
                            <span className="rounded-full bg-adm-blue text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                              {t("Today")}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-adm-text-2 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-adm-text-3">
                          <span className="font-semibold text-adm-text-2">
                            {t("Action:")} {task.actionItem}
                          </span>
                        </div>
                      </div>

                      {/* Expand notes button */}
                      <button
                        type="button"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.day)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-adm-border text-adm-text-3 hover:bg-adm-surface-2 hover:text-adm-text"
                        aria-label="Toggle notes"
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Expandable Notes Section */}
                    {isExpanded && (
                      <div className="border-t border-adm-border bg-adm-surface-2/40 px-6 py-4">
                        <div className="grid gap-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-adm-text-3">
                            {t("Execution Notes & Proof of Work (Day {{day}})", { day: task.day })}
                          </label>
                          <textarea
                            rows={3}
                            value={savedNote}
                            onChange={(e) => updateTaskNote(task.day, e.target.value)}
                            placeholder={t(
                              "Log links to CRM activities, discovery notes, names of accounts contacted, or key blockers…",
                            )}
                            className={inputClass}
                          />
                          <p className="text-[11px] text-adm-text-3">
                            {t("Auto-saved to your local session workspace.")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: OUTREACH & OBJECTION SCRIPTS (TEMPLATES WORKBENCH)
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "templates" && (
        <div className="flex flex-col gap-6">
          <Callout tone="blue" icon={Sparkles} title={t("High-Velocity Outreach Protocol")}>
            {t(
              "Approved frameworks for Cold Emails, LinkedIn DMs, Phone Pitches, and Objection pivots. Edit any template to tailor it to your immediate prospect. Use 'Open in Email' to populate your desktop mail client or click 'Copy' for immediate paste.",
            )}
          </Callout>

          {/* Category Pills & Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: t("All Scripts"), icon: Target },
                { id: "email", label: t("Cold Emails"), icon: Mail },
                { id: "linkedin", label: t("LinkedIn DMs"), icon: MessageSquare },
                { id: "phone", label: t("Cold Calling"), icon: Phone },
                { id: "objection", label: t("Objection Handling"), icon: ShieldAlert },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = templateCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTemplateCategory(cat.id as TemplateCategoryFilter)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                      isActive
                        ? "bg-adm-blue text-white font-semibold"
                        : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2"
                    }`}
                  >
                    <Icon size={13} className={isActive ? "text-white" : "text-adm-text-3"} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-3 text-adm-text-3" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder={t("Search scripts, objections, hooks…")}
                className={`${inputClass} pl-9 py-2 text-xs`}
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredTemplates.map((tmpl) => {
              const content = getTemplateContent(tmpl);
              const isCopied = copiedTemplateId === tmpl.id;
              const isEdited = Boolean(salesState.customTemplates[tmpl.id]);

              return (
                <Panel
                  key={tmpl.id}
                  title={tmpl.name}
                  icon={
                    tmpl.category === "email"
                      ? Mail
                      : tmpl.category === "linkedin"
                        ? MessageSquare
                        : tmpl.category === "phone"
                          ? Phone
                          : ShieldAlert
                  }
                  action={
                    <div className="flex items-center gap-2">
                      {isEdited && (
                        <button
                          type="button"
                          onClick={() => resetTemplateToDefault(tmpl.id)}
                          className="text-[11px] text-adm-text-3 hover:text-adm-red flex items-center gap-1"
                          title={t("Reset to original script")}
                        >
                          <RotateCcw size={11} />
                          <span>{t("Reset")}</span>
                        </button>
                      )}
                      <Badge tone={tmpl.category === "objection" ? "amber" : "blue"}>
                        {tmpl.category}
                      </Badge>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    {/* Strategy Context */}
                    <div className="rounded-none border border-adm-border bg-adm-surface-2/60 p-3 text-xs text-adm-text-2">
                      <span className="font-semibold text-adm-text">{t("Playbook Context:")} </span>
                      {tmpl.context}
                    </div>

                    {/* Email Subject Field */}
                    {content.subject !== undefined && (
                      <div className="grid gap-1">
                        <Label>{t("Subject Line")}</Label>
                        <input
                          type="text"
                          value={content.subject}
                          onChange={(e) => updateTemplateContent(tmpl.id, "subject", e.target.value)}
                          className={`${inputClass} py-1.5 text-xs font-medium`}
                        />
                      </div>
                    )}

                    {/* Body Field */}
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between">
                        <Label>{t("Script Content (Editable)")}</Label>
                        <span className="text-[11px] text-adm-text-3">
                          {t("Variables:")} <code>{"{{company}}"}</code>, <code>{"{{first_name}}"}</code>
                        </span>
                      </div>
                      <textarea
                        rows={8}
                        value={content.body}
                        onChange={(e) => updateTemplateContent(tmpl.id, "body", e.target.value)}
                        className={`${inputClass} font-mono text-xs leading-relaxed`}
                      />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tmpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-adm-border bg-adm-surface-2 px-2 py-0.5 text-[10px] text-adm-text-3"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-adm-border pt-4">
                      <div className="flex items-center gap-2">
                        {tmpl.category === "email" && (
                          <a
                            href={`mailto:?subject=${encodeURIComponent(
                              content.subject || "",
                            )}&body=${encodeURIComponent(content.body)}`}
                            className="inline-flex items-center gap-1.5 rounded-none border border-adm-border bg-adm-surface px-3 py-1.5 text-xs font-semibold text-adm-text hover:border-adm-border-2"
                          >
                            <Send size={12} className="text-adm-blue" />
                            <span>{t("Open in Email")}</span>
                          </a>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fullText = content.subject
                            ? `Subject: ${content.subject}\n\n${content.body}`
                            : content.body;
                          copyToClipboard(tmpl.id, fullText);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-none px-4 py-1.5 text-xs font-semibold transition active:scale-95 ${
                          isCopied
                            ? "bg-adm-green text-white"
                            : "bg-adm-blue text-white hover:bg-adm-blue-mid"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} />
                            <span>{t("Copied to Clipboard!")}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>{t("Copy Script")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 3: CRM LEAD PIPELINE OVERVIEW
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <div className="flex flex-col gap-6">
          {/* Pipeline Stage Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {(pipeline?.stages || []).map((stage) => (
              <div
                key={stage.status}
                className="flex flex-col rounded-none border border-adm-border bg-adm-surface p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-adm-text-3">
                    {stage.label}
                  </span>
                  <StatusPill status={stage.status} />
                </div>
                <p className="mt-2 text-xl font-bold tabular-nums text-adm-text">
                  {stage.count}
                </p>
                <p className="mt-0.5 text-xs text-adm-text-3 tabular-nums">
                  {formatCurrency(stage.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Table Panel */}
          <Panel
            title={t("Live CRM Leads & Outreach Book")}
            icon={Target}
            action={
              <div className="flex items-center gap-2">
                <PortalButton
                  variant="ghost"
                  icon={Download}
                  onClick={exportLeadsCsv}
                >
                  {t("Export CSV")}
                </PortalButton>
                <Link
                  href="/admin/client"
                  className="inline-flex items-center gap-1.5 rounded-none border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs font-semibold text-adm-text hover:border-adm-border-2"
                >
                  <ExternalLink size={12} />
                  <span>{t("CRM Workbench")}</span>
                </Link>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <Toolbar>
                <div className="relative w-full max-w-sm">
                  <Search size={14} className="absolute left-3 top-3 text-adm-text-3" />
                  <input
                    type="text"
                    value={pipelineSearch}
                    onChange={(e) => setPipelineSearch(e.target.value)}
                    placeholder={t("Filter company, contact, or industry…")}
                    className={`${inputClass} pl-9 py-1.5 text-xs`}
                  />
                </div>
                <span className="text-xs text-adm-text-3 ml-auto">
                  {t("Showing {{count}} leads", { count: filteredLeads.length })}
                </span>
              </Toolbar>

              {leadsQuery.isLoading ? (
                <LoadingBlock label={t("Loading CRM pipeline leads…")} />
              ) : leadsQuery.isError ? (
                <ErrorBlock
                  message={t("Failed to load leads from server.")}
                  onRetry={() => leadsQuery.refetch()}
                />
              ) : filteredLeads.length === 0 ? (
                <EmptyBlock
                  title={t("No leads match criteria")}
                  description={t("Add your target prospects in the CRM Workbench or adjust your search filter.")}
                >
                  <Link
                    href="/admin/client"
                    className="inline-flex items-center gap-1.5 rounded-none bg-adm-blue px-4 py-2 text-xs font-semibold text-white mt-3"
                  >
                    <span>{t("Add Prospect in CRM")}</span>
                  </Link>
                </EmptyBlock>
              ) : (
                <DataTable
                  head={[
                    t("Company"),
                    t("Contact Person"),
                    t("Industry"),
                    t("Source"),
                    t("Status"),
                    t("Est. Value"),
                    t("Next Follow-up"),
                  ]}
                >
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-adm-surface-2/40 transition-colors">
                      <Td strong>
                        <div className="flex flex-col">
                          <span>{lead.companyName}</span>
                          {lead.email && (
                            <span className="text-[11px] font-normal text-adm-text-3">
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span>{lead.contactPerson}</span>
                          {lead.contactTitle && (
                            <span className="text-[11px] text-adm-text-3">
                              {lead.contactTitle}
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>{lead.industry || "—"}</Td>
                      <Td>
                        <span className="rounded-full border border-adm-border bg-adm-surface-2 px-2 py-0.5 text-[11px] font-medium text-adm-text-2 capitalize">
                          {lead.source.replace(/_/g, " ")}
                        </span>
                      </Td>
                      <Td>
                        <StatusPill status={lead.status} />
                      </Td>
                      <Td strong>{formatCurrency(lead.estimatedValue, lead.currency)}</Td>
                      <Td>
                        <span
                          className={`text-xs ${
                            lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) <= new Date()
                              ? "font-semibold text-adm-amber"
                              : "text-adm-text-3"
                          }`}
                        >
                          {lead.nextFollowUpDate
                            ? new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 4: WEEKLY PERFORMANCE SCORECARD
          ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "metrics" && (
        <div className="flex flex-col gap-6">
          <Callout tone="green" icon={TrendingUp} title={t("Outreach Cadence & Conversion Velocity")}>
            {t(
              "Log weekly outbound volumes and track conversion velocity. Real sales math: 100 Cold Touches → 15–20 Replies → 5–8 Discovery Calls → 2–3 Proposals → 1 Won Retainer.",
            )}
          </Callout>

          <Panel
            title={t("7-Week Sales Sprint Scorecard")}
            icon={TrendingUp}
            action={
              <button
                type="button"
                onClick={resetScorecard}
                className="text-xs text-adm-text-3 hover:text-adm-red flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>{t("Reset Scorecard")}</span>
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-adm-border bg-adm-surface-2/60">
                    <th className="p-3 font-semibold text-adm-text">{t("Sprint Week")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Emails")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("LinkedIn DMs")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Calls")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Total Touches")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Replies")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Reply %")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Meetings")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Proposals")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Won Deals")}</th>
                    <th className="p-3 font-semibold text-adm-text">{t("Revenue ($)")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adm-border">
                  {salesState.weeklyScorecard.map((row, idx) => {
                    const totalTouches = row.emailsSent + row.linkedInDms + row.coldCalls;
                    const replyRate = totalTouches > 0 ? Math.round((row.replies / totalTouches) * 100) : 0;
                    const meetingRate = row.replies > 0 ? Math.round((row.meetings / row.replies) * 100) : 0;

                    return (
                      <tr key={row.week} className="hover:bg-adm-surface-2/30">
                        <td className="p-3 font-bold text-adm-text whitespace-nowrap">
                          {row.label}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.emailsSent || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "emailsSent", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-medium outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.linkedInDms || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "linkedInDms", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-medium outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.coldCalls || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "coldCalls", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-medium outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-3 font-bold text-adm-text tabular-nums">
                          {totalTouches}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.replies || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "replies", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-medium outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-3 tabular-nums font-semibold">
                          <span
                            className={
                              replyRate >= 15
                                ? "text-adm-green"
                                : replyRate >= 8
                                  ? "text-adm-blue"
                                  : "text-adm-text-3"
                            }
                          >
                            {replyRate}%
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.meetings || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "meetings", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-medium outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.proposals || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "proposals", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-medium outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.dealsWon || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "dealsWon", parseInt(e.target.value, 10))
                            }
                            className="w-16 border border-adm-border bg-adm-surface px-2 py-1 text-center font-bold text-adm-green outline-none focus:border-adm-blue"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={row.revenue || ""}
                            placeholder="0"
                            onChange={(e) =>
                              updateScorecardMetric(idx, "revenue", parseInt(e.target.value, 10))
                            }
                            className="w-24 border border-adm-border bg-adm-surface px-2 py-1 font-semibold text-adm-text outline-none focus:border-adm-blue"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-adm-border bg-adm-surface-2/70 font-bold text-adm-text">
                    <td className="p-3">{t("Totals")}</td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.emailsSent, 0)}
                    </td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.linkedInDms, 0)}
                    </td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.coldCalls, 0)}
                    </td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce(
                        (acc, r) => acc + r.emailsSent + r.linkedInDms + r.coldCalls,
                        0,
                      )}
                    </td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.replies, 0)}
                    </td>
                    <td className="p-3 tabular-nums">
                      {(() => {
                        const totalTouches = salesState.weeklyScorecard.reduce(
                          (acc, r) => acc + r.emailsSent + r.linkedInDms + r.coldCalls,
                          0,
                        );
                        const totalReplies = salesState.weeklyScorecard.reduce(
                          (acc, r) => acc + r.replies,
                          0,
                        );
                        return totalTouches > 0
                          ? `${Math.round((totalReplies / totalTouches) * 100)}%`
                          : "0%";
                      })()}
                    </td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.meetings, 0)}
                    </td>
                    <td className="p-3 tabular-nums">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.proposals, 0)}
                    </td>
                    <td className="p-3 tabular-nums text-adm-green">
                      {salesState.weeklyScorecard.reduce((acc, r) => acc + r.dealsWon, 0)}
                    </td>
                    <td className="p-3 tabular-nums text-adm-blue font-semibold">
                      {formatCurrency(
                        salesState.weeklyScorecard.reduce((acc, r) => acc + r.revenue, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
