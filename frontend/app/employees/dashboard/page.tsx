"use client";

import Link from "next/link";
import {
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  FileText,
  FolderKanban,
  LogOut,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users2,
} from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  Label,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  StatCard,
  StatusPill,
} from "@/components/portal/PortalUI";
import { useCheckIn, useCheckOut } from "@/hooks/useAttendance";
import { useEmployeeDashboard } from "@/hooks/useDashboard";
import { useCurrentUser } from "@/hooks/useAuth";
import { useUpdateTask } from "@/hooks/useTasks";

function formatTime(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function EmployeeDashboardPage() {
  const { data: me } = useCurrentUser();
  const { data, isLoading, isError, error, refetch } = useEmployeeDashboard();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const updateTask = useUpdateTask();

  const firstName = me?.data?.name?.split(" ")[0] ?? "there";

  if (isLoading) return <LoadingBlock label="Loading your dashboard…" />;
  if (isError || !data) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "Could not load your dashboard."}
        onRetry={() => refetch()}
      />
    );
  }

  const { attendance, tasks, leave, projects, announcements, documents, notifications, internship } = data;
  
  // All tasks are treated as completed/closed for internship completion
  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "closed");
  const checkedIn = Boolean(attendance.checkInTime);
  const checkedOut = Boolean(attendance.checkOutTime);
  const mutating = checkIn.isPending || checkOut.isPending;

  // Internship metrics
  const totalDays = internship?.totalDays ?? 30;
  const daysWorked = internship?.daysWorked ?? 30;
  const progressPct = internship?.progressPercentage ?? 100;
  const stipendStatus = internship?.stipendStatus ?? "Processing";
  const certStatus = internship?.certificateStatus ?? "Processing";

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title={`${greeting()}, ${firstName}`}
        description="1-Month B2B Executive Internship track · Overview of your completed term, days working, and deliverables."
      />

      {/* ── 1-Month Internship Completion & Progress Banner ─────────────────── */}
      <section className="relative overflow-hidden border border-adm-blue/30 bg-adm-surface p-6 sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-adm-blue/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-adm-blue/30 bg-adm-blue/10 text-adm-blue">
              <Award size={30} className="animate-pulse" />
            </span>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-adm-green-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-green">
                  ✓ Term Completed · 100% Milestones Met
                </span>
                <span className="inline-block rounded-full bg-adm-blue-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue">
                  Qorlune LLC
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-adm-text">
                1-Month B2B Executive Internship
              </h1>
              <p className="text-sm leading-relaxed text-adm-text-2 max-w-3xl">
                Congratulations on successfully completing your 1-month B2B Executive internship at Qorlune LLC.
                Your hard work, client outreach, and dedication did not go unnoticed. All assignments are now closed
                and your stipend and Certificate of Completion are currently being processed.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2">
            <div className="text-left lg:text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-adm-text-3">Completion Status</p>
              <p className="text-lg font-bold text-adm-green uppercase tracking-wide">Graduated / Complete</p>
            </div>
            <a
              href="https://portals.qorlune.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-adm-border bg-adm-surface-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-adm-blue hover:border-adm-blue hover:bg-adm-surface transition-colors"
            >
              <span>Portal Verification</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6 pt-6 border-t border-adm-border/60">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className="text-adm-text flex items-center gap-2">
              <TrendingUp size={14} className="text-adm-blue" />
              <span>Internship Track Progress</span>
            </span>
            <span className="font-mono text-adm-blue">{progressPct}% Complete ({daysWorked} / {totalDays} Days)</span>
          </div>
          <div className="h-2.5 w-full bg-adm-surface-2 overflow-hidden border border-adm-border">
            <div
              className="h-full bg-gradient-to-r from-adm-blue to-adm-green transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── Key Metrics Grid: Days Working & Progress ──────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Days Working"
          value={`${daysWorked} / ${totalDays}`}
          icon={CalendarDays}
          tone="green"
          hint="100% full-term attendance recorded"
        />
        <StatCard
          label="Internship Progress"
          value={`${progressPct}%`}
          icon={Target}
          tone="blue"
          hint="All core pipeline goals fulfilled"
        />
        <StatCard
          label="Certificate of Completion"
          value={certStatus}
          icon={ShieldCheck}
          tone="blue"
          hint="Official letter & credential clearance"
        />
        <StatCard
          label="Performance Stipend"
          value={stipendStatus}
          icon={Sparkles}
          tone="amber"
          hint="Payout processing by finance team"
        />
      </div>

      {/* ── Core Internship Highlights & Deliverables Achieved ───────────────── */}
      <Panel title="Internship Highlights & Deliverables Achieved" icon={Award} tone="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-adm-border bg-adm-surface-2/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-adm-text-3">CRM Lead Gen</span>
                <span className="rounded-full bg-adm-green-light px-2 py-0.5 text-[9px] font-bold uppercase text-adm-green">100% Target</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-adm-text">60+ Leads</p>
              <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                Sourced and cataloged 60+ verified SME decision-makers directly in the central CRM portal.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-adm-border flex items-center gap-1.5 text-[11px] font-semibold text-adm-green">
              <CheckCircle2 size={13} /> Sourced & Verified
            </div>
          </div>

          <div className="border border-adm-border bg-adm-surface-2/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-adm-text-3">Multi-Channel</span>
                <span className="rounded-full bg-adm-green-light px-2 py-0.5 text-[9px] font-bold uppercase text-adm-green">Completed</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-adm-text">45+ Touches</p>
              <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                Handled 45+ multi-channel first touches via LinkedIn, targeted email campaigns, and phone outreach.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-adm-border flex items-center gap-1.5 text-[11px] font-semibold text-adm-green">
              <CheckCircle2 size={13} /> Multi-Touch Execution
            </div>
          </div>

          <div className="border border-adm-border bg-adm-surface-2/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-adm-text-3">Client Conversions</span>
                <span className="rounded-full bg-adm-green-light px-2 py-0.5 text-[9px] font-bold uppercase text-adm-green">Secured</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-adm-text">5+ Calls</p>
              <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                Successfully secured and scheduled 5+ confirmed B2B discovery calls with business owners and budget holders.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-adm-border flex items-center gap-1.5 text-[11px] font-semibold text-adm-green">
              <CheckCircle2 size={13} /> Budget Holders Pitched
            </div>
          </div>

          <div className="border border-adm-border bg-adm-surface-2/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-adm-text-3">Pipeline Discipline</span>
                <span className="rounded-full bg-adm-green-light px-2 py-0.5 text-[9px] font-bold uppercase text-adm-green">Clean</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-adm-text">0 Overdue</p>
              <p className="mt-1 text-xs text-adm-text-3 leading-relaxed">
                Qualified high-intent accounts and maintained an active follow-up pipeline with zero overdue tasks.
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-adm-border flex items-center gap-1.5 text-[11px] font-semibold text-adm-green">
              <CheckCircle2 size={13} /> Strict Data Compliance
            </div>
          </div>
        </div>

        {/* Offerings Summary */}
        <div className="mt-4 pt-4 border-t border-adm-border flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-adm-text-2">
          <span className="font-bold text-adm-text uppercase tracking-wider text-[11px]">Core Offerings Pitched:</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-adm-blue" /> Cybersecurity Consulting & Data Protection</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-adm-blue" /> Financial Compliance & Accounting Controls</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-adm-blue" /> SEO Strategy & Digital AdSense Optimization</span>
        </div>
      </Panel>

      {/* ── Operational Status & Closed Items ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Attendance Panel — Concluded & Closed */}
          <Panel title="Attendance & Working Record" icon={Clock} tone="green">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xl font-bold uppercase text-adm-text">
                  <CheckCircle2 size={18} className="text-adm-green" />
                  <span className="inline-block rounded-full bg-adm-green-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-adm-green">
                    Term Completed
                  </span>
                </p>
                <p className="mt-2 text-xs text-adm-text-3">
                  All 30 days verified & logged · Daily check-in requirement concluded
                </p>
              </div>
              <Link
                href="/employees/attendance"
                className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline"
              >
                Full Log
              </Link>
            </div>

            <div className="mt-5 border-t border-adm-border pt-4">
              <div className="flex items-center justify-between text-xs text-adm-text-2">
                <span>Working Cycle Status:</span>
                <span className="font-bold text-adm-text uppercase">Day closed · Term completed</span>
              </div>
              <p className="mt-2 text-[11px] text-adm-text-3">
                Your 30-day attendance record is fully verified. No further daily check-ins are required.
              </p>
            </div>
          </Panel>

          {/* Today's Work — All Tasks Closed */}
          <Panel
            title="Assigned Tasks & Deliverables"
            icon={CheckSquare}
            padded={false}
            action={
              <span className="rounded-full bg-adm-green-light px-2.5 py-0.5 text-[10px] font-bold uppercase text-adm-green">
                All Closed (100%)
              </span>
            }
          >
            {tasks.length === 0 ? (
              <div className="p-5">
                <div className="flex items-center gap-3 text-adm-green">
                  <CheckCircle2 size={18} />
                  <div>
                    <p className="text-sm font-semibold text-adm-text">All deliverables completed</p>
                    <p className="text-xs text-adm-text-3">Zero open tasks remain. All assignments have been finalized.</p>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-adm-border">
                {tasks.slice(0, 6).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <span className="min-w-0 truncate text-sm font-semibold text-adm-text-3 line-through">
                      {task.title}
                    </span>
                    <span className="shrink-0 inline-block rounded-full bg-adm-green-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-adm-green">
                      Done · Closed
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-adm-border bg-adm-surface-2/30 px-5 py-3 text-xs text-adm-text-3">
              ✓ All task deliverables closed & archived for stipend clearance.
            </div>
          </Panel>

          {/* Active Projects — Concluded */}
          <Panel
            title="Projects & Accounts"
            icon={FolderKanban}
            padded={false}
            action={
              <Link href="/employees/projects" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Hub
              </Link>
            }
          >
            {projects.length === 0 ? (
              <div className="p-5">
                <p className="text-sm font-semibold text-adm-text">B2B Accounts & Pipelines Handed Over</p>
                <p className="text-xs text-adm-text-3 mt-0.5">All accounts successfully cataloged into central CRM.</p>
              </div>
            ) : (
              <ul className="divide-y divide-adm-border">
                {projects.map((project) => (
                  <li key={project.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <span className="truncate text-sm font-semibold text-adm-text">{project.name}</span>
                    <span className="inline-block rounded-full bg-adm-green-light px-2.5 py-0.5 text-[10px] font-bold uppercase text-adm-green">
                      Concluded
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Right Column: Next Steps, Announcements & Vault */}
        <div className="flex flex-col gap-6">
          {/* Post-Internship Next Steps Panel */}
          <Panel title="What Comes Next" icon={Sparkles} tone="amber">
            <div className="space-y-3 text-xs leading-relaxed text-adm-text-2">
              <div className="border border-adm-border bg-adm-surface-2/40 p-3.5">
                <p className="font-bold uppercase tracking-wider text-adm-text text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-adm-blue" />
                  1. Certificate of Completion & Experience Letter
                </p>
                <p className="mt-1 text-adm-text-3">
                  Your formal internship certificate and recommendation letter are in final verification and will be delivered to your email and documents vault.
                </p>
              </div>

              <div className="border border-adm-border bg-adm-surface-2/40 p-3.5">
                <p className="font-bold uppercase tracking-wider text-adm-text text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-adm-blue" />
                  2. Performance Stipend Payout
                </p>
                <p className="mt-1 text-adm-text-3">
                  The finance division is processing stipend disbursements. Payout notifications will be sent directly via email.
                </p>
              </div>

              <div className="border border-adm-border bg-adm-surface-2/40 p-3.5">
                <p className="font-bold uppercase tracking-wider text-adm-text text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-adm-blue" />
                  3. Full-Time Salaried Transition Review
                </p>
                <p className="mt-1 text-adm-text-3">
                  High-converting candidates will be contacted for full-time executive positions based on their qualified discovery calls and pipeline discipline.
                </p>
              </div>
            </div>
          </Panel>

          {/* Announcements */}
          <Panel
            title="Company Announcements"
            icon={Bell}
            tone="red"
            padded={false}
            action={
              <Link href="/employees/announcements" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Read all
              </Link>
            }
          >
            {announcements.length === 0 ? (
              <p className="p-5 text-sm text-adm-text-3">No recent announcements.</p>
            ) : (
              <ul className="divide-y divide-adm-border">
                {announcements.map((item) => (
                  <li key={item.id} className="px-5 py-4">
                    <p className="text-sm font-semibold text-adm-text">{item.title}</p>
                    <p className="mt-0.5 text-xs text-adm-text-3">{formatDate(item.publishedAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Documents Vault */}
          <Panel
            title="Documents Vault"
            icon={FileText}
            padded={false}
            action={
              <Link href="/employees/documents" className="text-[11px] font-bold uppercase tracking-[0.14em] text-adm-blue hover:underline">
                Vault
              </Link>
            }
          >
            {documents.length === 0 ? (
              <div className="p-5 text-sm text-adm-text-3">
                Completion certificates will appear here once finalized.
              </div>
            ) : (
              <ul className="divide-y divide-adm-border">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-adm-surface-2 text-adm-blue">
                      <FileText size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-adm-text">{doc.title}</span>
                      <Label>{doc.type}</Label>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
