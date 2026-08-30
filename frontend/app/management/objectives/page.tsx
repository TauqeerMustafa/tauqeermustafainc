"use client";

import { Activity, BarChart3, FolderKanban, Target, Users } from "lucide-react";

import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  StatCard,
} from "@/components/portal/PortalUI";
import { useManagementDashboard } from "@/hooks/useDashboard";
import { useLeadPipeline } from "@/hooks/useLeads";

function money(value: number | null | undefined) {
  const amount = value ?? 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function pct(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

/**
 * A single objective row: a live signal with the context needed to read it.
 * These are real, current numbers — not stored targets, which the backend does
 * not model — so the copy frames each as a signal to watch, not a goal to hit.
 */
function Signal({ label, detail, value }: { label: string; detail: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-adm-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-adm-text">{label}</p>
        <p className="truncate text-xs text-adm-text-3">{detail}</p>
      </div>
      <span className="shrink-0 text-lg font-bold tabular-nums text-adm-text">{value}</span>
    </li>
  );
}

export default function ManagementObjectivesPage() {
  const summary = useManagementDashboard();
  const pipeline = useLeadPipeline();

  if (summary.isLoading) return <LoadingBlock label="Loading objectives…" />;
  if (summary.isError || !summary.data) {
    return (
      <ErrorBlock
        message={
          summary.error instanceof Error ? summary.error.message : "Could not load objectives."
        }
        onRetry={() => summary.refetch()}
      />
    );
  }

  const { overview, attendanceToday } = summary.data;
  const rosterTotal =
    attendanceToday.present + attendanceToday.late + attendanceToday.absent + attendanceToday.onLeave;
  const attendanceRate = pct(attendanceToday.present, rosterTotal);
  const onTimeTasks = overview.openTasks - overview.overdueTasks;
  const onTrackRate = pct(onTimeTasks, overview.openTasks);
  const funnel = pipeline.data;
  const wonTotal = (funnel?.wonValue ?? 0) + (funnel?.lostValue ?? 0);
  const winRate = funnel ? pct(funnel.wonValue, wonTotal) : 0;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="Objectives"
        description="Leadership signals rolled up from today's live operating data."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Attendance rate"
          value={`${attendanceRate}%`}
          icon={Users}
          tone={attendanceRate >= 80 ? "green" : "amber"}
          hint="Present vs recorded today"
        />
        <StatCard
          label="Delivery on track"
          value={`${onTrackRate}%`}
          icon={FolderKanban}
          tone={onTrackRate >= 80 ? "green" : overview.overdueTasks > 0 ? "red" : "neutral"}
          hint={`${overview.overdueTasks} overdue of ${overview.openTasks} open`}
        />
        <StatCard
          label="Win rate"
          value={funnel ? `${winRate}%` : "—"}
          icon={BarChart3}
          tone={winRate >= 40 ? "green" : "neutral"}
          hint="Won vs closed value"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="People" icon={Users}>
          <ul className="flex flex-col">
            <Signal
              label="Headcount"
              detail="Active employee records"
              value={String(overview.headcount)}
            />
            <Signal
              label="Present today"
              detail={`${overview.onLeaveToday} on approved leave`}
              value={String(overview.presentToday)}
            />
            <Signal
              label="Approvals waiting"
              detail="Leave requests in the queue"
              value={String(overview.pendingApprovals)}
            />
          </ul>
        </Panel>

        <Panel title="Delivery" icon={FolderKanban}>
          <ul className="flex flex-col">
            <Signal
              label="Active projects"
              detail="Not completed or cancelled"
              value={String(overview.activeProjects)}
            />
            <Signal
              label="Open tasks"
              detail="Across every project"
              value={String(overview.openTasks)}
            />
            <Signal
              label="Overdue tasks"
              detail="Past due and not done"
              value={String(overview.overdueTasks)}
            />
          </ul>
        </Panel>

        <Panel title="Growth" icon={BarChart3}>
          {!funnel ? (
            <EmptyBlock title="No pipeline access" description="You cannot view lead data." />
          ) : (
            <ul className="flex flex-col">
              <Signal
                label="Open leads"
                detail={`Scope: ${funnel.scope}`}
                value={String(funnel.totalLeads)}
              />
              <Signal
                label="Open value"
                detail="Not yet won or lost"
                value={money(funnel.openValue)}
              />
              <Signal
                label="Follow-ups due"
                detail="Leads awaiting a next touch"
                value={String(funnel.followUpsDue)}
              />
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="How to read this" icon={Activity} tone="neutral">
        <p className="flex items-start gap-2 text-sm text-adm-text-2">
          <Target size={16} className="mt-0.5 shrink-0 text-adm-blue" />
          These are current operating signals pulled live from attendance, delivery, and pipeline
          data — not stored targets. Use them to spot where the week is drifting; drill into
          Headcount, Delivery, or Pipeline for the detail behind each number.
        </p>
      </Panel>
    </div>
  );
}
