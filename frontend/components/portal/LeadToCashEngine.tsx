"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Building2,
  UserCheck,
  Layers,
  Calendar,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useRunLeadToCashCycle } from "@/hooks/useAgent";
import type { LeadToCashCycleResponse } from "@/types";

export function LeadToCashEngine() {
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [targetBudget, setTargetBudget] = useState<number | undefined>(undefined);

  const [activeCycle, setActiveCycle] = useState<LeadToCashCycleResponse | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const runCycleMutation = useRunLeadToCashCycle();

  const handleRunFullCycle = async () => {
    try {
      const response = await runCycleMutation.mutateAsync({
        companyName: companyName.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        email: email.trim() || undefined,
        industry: industry.trim() || undefined,
        serviceType: serviceType.trim() || undefined,
        targetBudget: targetBudget ? Number(targetBudget) : undefined,
        autoRunAll: true,
      });

      setActiveCycle(response);
      toast.success("Autonomous Lead-to-Cash Cycle Completed!", {
        description: `Successfully provisioned ${response.companyName} with payment link generated.`,
      });
    } catch (err: any) {
      toast.error("Cycle execution failed", {
        description: err?.message || "An unexpected error occurred during execution.",
      });
    }
  };

  const handleCopyLink = () => {
    if (!activeCycle?.payment?.checkoutUrl) return;
    const fullUrl = `${window.location.origin}${activeCycle.payment.checkoutUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success("Checkout link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card/90 to-primary/10 p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>Full Autonomous Business Lifecycle</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Lead-to-Cash Autonomous Engine
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dispatches the complete 5-stage commercial workflow autonomously: discovers & qualifies B2B leads via BANT criteria, generates comprehensive architecture proposals, provisions projects with sprint tasks, and issues official payment links for online checkout.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowCustomConfig(!showCustomConfig)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/60 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent/40 transition-colors"
            >
              <span>{showCustomConfig ? "Hide Parameters" : "Customize Lead (Optional)"}</span>
              {showCustomConfig ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <button
              onClick={handleRunFullCycle}
              disabled={runCycleMutation.isPending}
              className="relative group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {runCycleMutation.isPending ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Executing 5-Stage Cycle...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-white" />
                  <span>Run Autonomous Loop (1-Click)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optional Custom Configuration Form */}
        {showCustomConfig && (
          <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex FinTech Solutions"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. David Vance (CTO)"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. david.vance@apexfintech.io"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. FinTech & Payments"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Service Type</label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g. AI Financial Copilot Modernization"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Budget (USD)</label>
              <input
                type="number"
                value={targetBudget ?? ""}
                onChange={(e) => setTargetBudget(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 25000"
                className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visual 5-Stage Stepper */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            {
              step: "1",
              name: "Lead Prospecting",
              sub: "BANT Qualification",
              icon: Building2,
              active: !!activeCycle,
              completed: !!activeCycle,
            },
            {
              step: "2",
              name: "Proposal Synthesis",
              sub: "SOW & Milestone Fees",
              icon: FileText,
              active: !!activeCycle?.proposal,
              completed: !!activeCycle?.proposal,
            },
            {
              step: "3",
              name: "Project Provisioning",
              sub: "ClientProject & Tasks",
              icon: Layers,
              active: !!activeCycle?.projectId,
              completed: !!activeCycle?.projectId,
            },
            {
              step: "4",
              name: "Invoice & Link",
              sub: "/billing/pay Gateway",
              icon: CreditCard,
              active: !!activeCycle?.payment,
              completed: !!activeCycle?.payment,
            },
            {
              step: "5",
              name: "Payment Ready",
              sub: "Online Settlement",
              icon: DollarSign,
              active: activeCycle?.completed,
              completed: activeCycle?.completed,
            },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className={`relative flex flex-col p-3 rounded-xl border transition-all ${
                  s.completed
                    ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                    : s.active
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-border/40 bg-muted/20 text-muted-foreground opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 border text-[11px] font-bold text-foreground">
                    {s.completed ? <Check className="h-3 w-3 text-emerald-400" /> : s.step}
                  </span>
                  <Icon className={`h-4 w-4 ${s.completed ? "text-emerald-400" : "text-muted-foreground"}`} />
                </div>
                <div className="font-medium text-xs text-foreground leading-tight">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Cycle Live Dossier */}
      {activeCycle ? (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs md:text-sm text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{activeCycle.summary}</span>
            </div>
            <button
              onClick={() => setActiveCycle(null)}
              className="text-xs text-emerald-400/80 hover:text-emerald-300 flex items-center gap-1 shrink-0 ml-4 underline underline-offset-2"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Qualified Lead Card */}
            <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Qualified B2B Lead</h3>
                    <p className="text-[11px] text-muted-foreground">BANT qualification verified autonomously</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  Qualified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Company:</span>
                  <div className="font-semibold text-foreground mt-0.5">{activeCycle.companyName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Decision Maker:</span>
                  <div className="font-semibold text-foreground mt-0.5">{activeCycle.contactPerson}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact Email:</span>
                  <div className="font-medium text-foreground mt-0.5 break-all">{activeCycle.email || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Lead ID:</span>
                  <div className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">{activeCycle.leadId}</div>
                </div>
              </div>
            </div>

            {/* 2. Payment & Invoice Card */}
            {activeCycle.payment && (
              <div className="rounded-xl border border-emerald-500/40 bg-card p-5 space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Payment Terminal Ready</h3>
                      <p className="text-[11px] text-muted-foreground">Online checkout URL minted</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    ${activeCycle.payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {activeCycle.payment.currency}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">Invoice Number</span>
                    <span className="font-mono font-semibold text-foreground">{activeCycle.payment.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">Billed For</span>
                    <span className="font-medium text-foreground text-right truncate max-w-[200px]">{activeCycle.payment.service}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span>{copiedLink ? "Copied to Clipboard!" : "Copy Checkout Link"}</span>
                  </button>

                  <a
                    href={activeCycle.payment.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow transition-colors"
                  >
                    <span>Open Checkout Terminal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* 3. Technical Proposal Dossier Card */}
            {activeCycle.proposal && (
              <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Technical Proposal Dossier</h3>
                      <p className="text-[11px] text-muted-foreground">ID: {activeCycle.proposal.proposalId} | {activeCycle.proposal.estimatedTimeline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Total Proposal Budget: </span>
                    <span className="text-sm font-bold text-foreground">${activeCycle.proposal.totalBudget.toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <span className="font-semibold text-foreground">Scope Summary:</span>
                    <p className="text-muted-foreground mt-1 leading-relaxed">{activeCycle.proposal.scopeSummary}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground">Architecture Stack:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {activeCycle.proposal.techStack.map((tech, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-foreground">Milestones & Fee Allocation:</span>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {activeCycle.proposal.milestones.map((m, i) => (
                        <div key={i} className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-primary">{m.milestoneId}</span>
                            <span className="text-xs font-bold text-emerald-400">${m.fee.toLocaleString()}</span>
                          </div>
                          <div className="font-medium text-xs text-foreground leading-snug">{m.title}</div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{m.description}</p>
                          <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Estimated: {m.estimatedDays} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Active Project & Sprint Backlog Card */}
            {activeCycle.projectName && (
              <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Project Provisioned: {activeCycle.projectName}</h3>
                      <p className="text-[11px] text-muted-foreground">Deal Won | Project ID: {activeCycle.projectId}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
                    <Briefcase className="h-3 w-3" />
                    <span>{activeCycle.tasksCreatedCount} Sprint Tasks Created</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      title: "Phase 1: Architecture Blueprint",
                      priority: "High",
                      due: "In 5 Days",
                      status: "todo",
                    },
                    {
                      title: "Phase 1: Environment Provisioning",
                      priority: "Medium",
                      due: "In 7 Days",
                      status: "todo",
                    },
                    {
                      title: "Phase 2: Core Platform API & AI",
                      priority: "High",
                      due: "In 14 Days",
                      status: "todo",
                    },
                    {
                      title: "Phase 3: QA Staging & Verification",
                      priority: "Medium",
                      due: "In 21 Days",
                      status: "todo",
                    },
                  ].map((t, idx) => (
                    <div key={idx} className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.priority}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>{t.due}</span>
                        </span>
                      </div>
                      <div className="text-xs font-medium text-foreground leading-snug">{t.title}</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Assigned to Sprint</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State / Prompt */
        <div className="rounded-xl border border-dashed border-border/70 bg-card/40 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Active Lead-to-Cash Run Displayed</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Click the &ldquo;Run Autonomous Loop (1-Click)&rdquo; button above. The Executive AI Agent will prospect high-value enterprise leads, synthesize proposals, provision projects, and generate online checkout links automatically.
          </p>
        </div>
      )}
    </div>
  );
}
