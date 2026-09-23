"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  Plane,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  UserCheck,
  UserMinus,
  Users,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalDialog,
  StatCard,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useAttendanceRoster } from "@/hooks/useAttendance";
import { useEmployees, useSetEmployeeStatus } from "@/hooks/useEmployees";
import { useLeaveQueue } from "@/hooks/useLeave";
import { useAllTasks } from "@/hooks/useTasks";
import { formatShiftDisplay, getEmployeeShift } from "@/lib/attendance-shifts";
import { useI18n } from "@/lib/i18n";
import type { AttendanceRecord, EmployeeRecord, LeaveRequest } from "@/types";
import type { ProjectTask } from "@/services";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function formatTime(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDateDisplay(dateStr: string) {
  const parsed = new Date(dateStr + "T00:00:00");
  return Number.isNaN(parsed.getTime())
    ? dateStr
    : parsed.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export type WorkStatusKind = "working" | "shift_completed" | "on_leave" | "not_working";
export type RetentionRisk = "high_risk" | "moderate_risk" | "productive" | "excused";

export interface EmployeeWorkStatus {
  employee: EmployeeRecord;
  kind: WorkStatusKind;
  isWorking: boolean;
  attendance?: AttendanceRecord;
  leave?: LeaveRequest;
  checkInDisplay: string | null;
  checkOutDisplay: string | null;
  hoursWorkedDisplay: string | null;
  routineSummary: string;
  tasksDoneToday: number;
  tasksInProgress: number;
  tasksTodo: number;
  totalTasksCount: number;
  shiftDisplay: string;
  outputScore: number; // 0 to 100
  riskLevel: RetentionRisk;
  riskReason: string;
}

type Props = {
  initialDate?: string;
  showDateSelector?: boolean;
  title?: string;
  description?: string;
};

export default function DailyWorkStatusList({
  initialDate,
  showDateSelector = true,
  title = "Daily Presence & Workforce Productivity",
  description = "Evaluate attendance presence and daily task progress to identify productive staff vs underperforming candidates for removal.",
}: Props) {
  const { t } = useI18n();
  const [date, setDate] = useState(initialDate || todayKey());
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<
    "all" | "working" | "not_working" | "removal_candidates" | "idle" | "on_leave"
  >("all");

  // Removal & Evaluation Dialog State
  const [evaluatingEmployee, setEvaluatingEmployee] = useState<EmployeeWorkStatus | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const employeesQuery = useEmployees();
  const attendanceQuery = useAttendanceRoster(date);
  const leavesQuery = useLeaveQueue("approved");
  const tasksQuery = useAllTasks();
  const setEmployeeStatusMutation = useSetEmployeeStatus();

  const isToday = date === todayKey();
  const employees = employeesQuery.data ?? [];
  const attendanceRecords = attendanceQuery.data ?? [];
  const approvedLeaves = leavesQuery.data ?? [];
  const allTasks: ProjectTask[] = tasksQuery.data?.items ?? [];

  // Map employee status and calculate daily work output
  const statuses: EmployeeWorkStatus[] = useMemo(() => {
    return employees.map((emp) => {
      // 1. Find attendance record for this employee on chosen date
      const att = attendanceRecords.find(
        (r) => r.employeeId === emp.id || (r.employeeName && emp.name && r.employeeName === emp.name),
      );

      // 2. Find if employee is on approved leave for this date
      const leave = approvedLeaves.find((l) => {
        if (l.employeeId !== emp.id) return false;
        const start = l.startDate.slice(0, 10);
        const end = l.endDate.slice(0, 10);
        return date >= start && date <= end;
      });

      // 3. Find tasks assigned to this employee
      const empTasks = allTasks.filter(
        (taskItem: ProjectTask) =>
          taskItem.assignedToId === emp.userId ||
          taskItem.assignedToId === emp.id ||
          (taskItem as unknown as { assignees?: { id: string }[] }).assignees?.some(
            (a) => a.id === emp.userId || a.id === emp.id,
          ),
      );

      // Tasks done or completed on this specific day
      const tasksDoneToday = empTasks.filter((taskItem: ProjectTask) => {
        const isDone = taskItem.status === "done" || taskItem.status === "completed";
        const dateMatch =
          taskItem.updatedAt?.slice(0, 10) === date || taskItem.createdAt?.slice(0, 10) === date;
        return isDone && dateMatch;
      }).length;

      // Tasks currently in progress
      const tasksInProgress = empTasks.filter(
        (taskItem: ProjectTask) => taskItem.status === "in_progress",
      ).length;

      // Tasks pending
      const tasksTodo = empTasks.filter(
        (taskItem: ProjectTask) => taskItem.status === "todo" || taskItem.status === "review",
      ).length;

      // 4. Shift & Timing
      const shift = getEmployeeShift(emp.id);
      const shiftDisplay = formatShiftDisplay(shift.expectedTime);
      const inTime = formatTime(att?.checkInTime);
      const outTime = formatTime(att?.checkOutTime);

      // Calculate working hours logged on this day
      let hoursWorkedDisplay: string | null = null;
      if (att?.checkInTime && att?.checkOutTime) {
        const diffMs = new Date(att.checkOutTime).getTime() - new Date(att.checkInTime).getTime();
        if (diffMs > 0) {
          const h = Math.floor(diffMs / 3600000);
          const m = Math.floor((diffMs % 3600000) / 60000);
          hoursWorkedDisplay = `${h}h ${m}m logged`;
        }
      } else if (att?.checkInTime && isToday) {
        const diffMs = Date.now() - new Date(att.checkInTime).getTime();
        if (diffMs > 0) {
          const h = Math.floor(diffMs / 3600000);
          const m = Math.floor((diffMs % 3600000) / 60000);
          hoursWorkedDisplay = `${h}h ${m}m active`;
        }
      }

      // 5. Work status determination
      let kind: WorkStatusKind = "not_working";
      let isWorking = false;
      let routineSummary = t("No check-in or daily routine recorded");

      if (leave) {
        kind = "on_leave";
        isWorking = false;
        routineSummary = `${t("On approved leave")} (${t(leave.leaveType || "Leave")})`;
      } else if (att) {
        const attStatus = String(att.status || "").toLowerCase();
        if (att.checkOutTime) {
          kind = "shift_completed";
          isWorking = true;
          routineSummary = `${t("Shift ended")} · ${inTime || "--"} - ${outTime}`;
        } else if (att.checkInTime || attStatus === "present" || attStatus === "late") {
          kind = "working";
          isWorking = true;
          routineSummary = inTime ? `${t("Checked in at")} ${inTime} · ${t("Working now")}` : t("Present today");
        } else if (attStatus === "leave") {
          kind = "on_leave";
          isWorking = false;
          routineSummary = t("Recorded on leave");
        }
      }

      // 6. Calculate Output Score (0 - 100%)
      let outputScore = 0;
      if (kind === "on_leave") {
        outputScore = 100; // Excused
      } else if (!isWorking) {
        outputScore = tasksDoneToday > 0 ? 40 : 0;
      } else {
        if (tasksDoneToday >= 2) outputScore = 100;
        else if (tasksDoneToday === 1) outputScore = 80;
        else if (tasksInProgress >= 1) outputScore = 60;
        else outputScore = 20; // Clocked in but zero tasks moved
      }

      // 7. Calculate Retention & Removal Risk Level
      let riskLevel: RetentionRisk = "productive";
      let riskReason = t("Present and contributing to active deliverables");

      const isAccountTerminated =
        emp.status === "inactive" || emp.status === "terminated";

      if (leave) {
        riskLevel = "excused";
        riskReason = `${t("Excused absence")} (${t(leave.leaveType || "Leave")})`;
      } else if (isAccountTerminated) {
        riskLevel = "high_risk";
        riskReason = t("Account already inactive or marked terminated");
      } else if (!isWorking) {
        if (tasksDoneToday === 0) {
          riskLevel = "high_risk";
          riskReason = t("Candidate for Removal: Absent without leave & 0 tasks completed");
        } else {
          riskLevel = "moderate_risk";
          riskReason = t("Absent from attendance roster, but completed offline task(s)");
        }
      } else {
        // Is working/checked in
        if (tasksDoneToday === 0 && tasksInProgress === 0) {
          riskLevel = "moderate_risk";
          riskReason = t("Idle on shift: Checked in, but 0 tasks completed or in progress");
        } else {
          riskLevel = "productive";
          riskReason = t("Good standing: Actively moving project deliverables");
        }
      }

      return {
        employee: emp,
        kind,
        isWorking,
        attendance: att,
        leave,
        checkInDisplay: inTime,
        checkOutDisplay: outTime,
        hoursWorkedDisplay,
        routineSummary,
        tasksDoneToday,
        tasksInProgress,
        tasksTodo,
        totalTasksCount: empTasks.length,
        shiftDisplay,
        outputScore,
        riskLevel,
        riskReason,
      };
    });
  }, [employees, attendanceRecords, approvedLeaves, allTasks, date, t, isToday]);

  // Aggregate metrics
  const totalCount = statuses.length;
  const workingCount = statuses.filter((s) => s.isWorking).length;
  const notWorkingCount = statuses.filter((s) => s.kind === "not_working").length;
  const onLeaveCount = statuses.filter((s) => s.kind === "on_leave").length;
  const removalCandidates = statuses.filter((s) => s.riskLevel === "high_risk");
  const idleStaff = statuses.filter((s) => s.riskLevel === "moderate_risk");
  const productiveCount = statuses.filter((s) => s.riskLevel === "productive").length;
  const workingRate = totalCount > 0 ? Math.round((workingCount / totalCount) * 100) : 0;

  // Filtered rows
  const filtered = useMemo(() => {
    let result = statuses;

    if (filterTab === "working") {
      result = result.filter((s) => s.isWorking);
    } else if (filterTab === "not_working") {
      result = result.filter((s) => s.kind === "not_working");
    } else if (filterTab === "removal_candidates") {
      result = result.filter((s) => s.riskLevel === "high_risk");
    } else if (filterTab === "idle") {
      result = result.filter((s) => s.riskLevel === "moderate_risk");
    } else if (filterTab === "on_leave") {
      result = result.filter((s) => s.kind === "on_leave");
    }

    const needle = search.trim().toLowerCase();
    if (!needle) return result;

    return result.filter((item) => {
      const e = item.employee;
      return [e.name, e.email, e.jobTitle, e.employeeIdString, e.role, item.riskReason]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(needle));
    });
  }, [statuses, filterTab, search]);

  const isLoading =
    employeesQuery.isLoading || attendanceQuery.isLoading || leavesQuery.isLoading;
  const isError = employeesQuery.isError || attendanceQuery.isError;
  const errorMessage =
    employeesQuery.error instanceof Error
      ? employeesQuery.error.message
      : attendanceQuery.error instanceof Error
        ? attendanceQuery.error.message
        : t("Could not load work status data.");

  const refetchAll = () => {
    employeesQuery.refetch();
    attendanceQuery.refetch();
    leavesQuery.refetch();
    tasksQuery.refetch();
  };

  // Execute Employee Status Update / Removal
  async function handleUpdateStatus(statusToSet: "inactive" | "terminated" | "active") {
    if (!evaluatingEmployee) return;
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    try {
      await setEmployeeStatusMutation.mutateAsync({
        id: evaluatingEmployee.employee.id,
        status: statusToSet,
      });

      const label =
        statusToSet === "inactive"
          ? t("set to Inactive")
          : statusToSet === "terminated"
            ? t("marked as Terminated")
            : t("re-activated to Active");

      setActionSuccessMessage(
        `${t("Employee")} ${evaluatingEmployee.employee.name} ${label}.`,
      );
      setEvaluatingEmployee(null);
      refetchAll();
      setTimeout(() => setActionSuccessMessage(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Failed to update employee status.");
      setActionErrorMessage(msg);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification Banner */}
      {actionSuccessMessage && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {actionErrorMessage && (
        <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{actionErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 dark:text-rose-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Banner with Date & Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-adm-border bg-adm-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-adm-text">
              {t(title)}
            </h2>
            {isToday ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-adm-green-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-adm-green">
                <span className="h-2 w-2 animate-pulse rounded-full bg-adm-green" />
                {t("Live Today")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-adm-surface-2 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-adm-text-2">
                {formatDateDisplay(date)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-adm-text-3">
            {t(description)}
          </p>
        </div>

        {showDateSelector && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-adm-text-3" />
              <input
                type="date"
                value={date}
                max={todayKey()}
                onChange={(e) => setDate(e.target.value || todayKey())}
                aria-label={t("Select Date")}
                className={`${inputClass} w-40 text-xs font-mono`}
              />
            </div>
            {!isToday && (
              <button
                type="button"
                onClick={() => setDate(todayKey())}
                className="rounded-none border border-adm-border bg-adm-surface-2 px-3 py-1.5 text-xs font-semibold text-adm-text hover:border-adm-border-2"
              >
                {t("Today")}
              </button>
            )}
            <button
              type="button"
              onClick={refetchAll}
              title={t("Refresh Roster and Workload")}
              aria-label={t("Refresh")}
              className="rounded border border-adm-border p-2 text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total Staff */}
        <div className="flex flex-col border border-adm-border bg-adm-surface p-4">
          <div className="flex items-center justify-between text-adm-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">{t("Total Staff")}</span>
            <Users size={16} />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-adm-text">
            {isLoading ? "…" : totalCount}
          </p>
          <span className="mt-1 text-[11px] text-adm-text-3">{t("Registered workforce")}</span>
        </div>

        {/* Working Today */}
        <div className="flex flex-col border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t("Present & Active")}</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {isLoading ? "…" : workingCount}
          </p>
          <span className="mt-1 text-[11px] font-semibold text-emerald-600/80 dark:text-emerald-400/80">
            ✅ {t("Checked in")} ({workingRate}%)
          </span>
        </div>

        {/* Absent */}
        <div className="flex flex-col border border-rose-500/30 bg-rose-500/[0.04] p-4">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t("Not Working")}</span>
            <XCircle size={18} className="text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {isLoading ? "…" : notWorkingCount}
          </p>
          <span className="mt-1 text-[11px] font-semibold text-rose-600/80 dark:text-rose-400/80">
            ❌ {t("Absent without check-in")}
          </span>
        </div>

        {/* Removal Candidates (Underperforming / Zero Work) */}
        <div
          onClick={() => setFilterTab("removal_candidates")}
          className={`flex cursor-pointer flex-col border p-4 transition ${
            filterTab === "removal_candidates"
              ? "border-rose-600 bg-rose-600/15 ring-2 ring-rose-500"
              : "border-rose-500/40 bg-rose-500/10 hover:border-rose-500 hover:bg-rose-500/20"
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
            <span className="text-xs font-black uppercase tracking-wider">
              {t("Removal Watchlist")}
            </span>
            <UserX size={18} className="text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums text-rose-700 dark:text-rose-300">
            {isLoading ? "…" : removalCandidates.length}
          </p>
          <span className="mt-1 text-[11px] font-bold text-rose-700/90 dark:text-rose-300/90">
            ⚠️ {t("Absent & Zero Tasks Done")}
          </span>
        </div>

        {/* Idle / Low Output */}
        <div
          onClick={() => setFilterTab("idle")}
          className={`flex cursor-pointer flex-col border p-4 transition ${
            filterTab === "idle"
              ? "border-amber-600 bg-amber-600/15 ring-2 ring-amber-500"
              : "border-amber-500/30 bg-amber-500/[0.04] hover:border-amber-500/60 hover:bg-amber-500/10"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t("Idle on Shift")}</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {isLoading ? "…" : idleStaff.length}
          </p>
          <span className="mt-1 text-[11px] text-amber-600/80 dark:text-amber-400/80">
            🟡 {t("Clocked in, 0 tasks")}
          </span>
        </div>
      </div>

      {/* Main List Panel */}
      <div className="overflow-hidden rounded-xl border border-adm-border bg-adm-surface shadow-sm">
        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 border-b border-adm-border bg-adm-surface-2 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filterTab === "all"
                  ? "bg-adm-blue text-white shadow-sm"
                  : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2"
              }`}
            >
              {t("All Staff")} ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("working")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filterTab === "working"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <Check size={14} strokeWidth={3} />
              <span>{t("Present & Active")} ({workingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("removal_candidates")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black transition ${
                filterTab === "removal_candidates"
                  ? "bg-rose-700 text-white shadow-sm ring-2 ring-rose-600"
                  : "border border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25"
              }`}
            >
              <UserX size={14} strokeWidth={2.5} />
              <span>{t("Review for Removal")} ({removalCandidates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("idle")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filterTab === "idle"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
              }`}
            >
              <Clock size={13} />
              <span>{t("Idle / 0 Tasks")} ({idleStaff.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("not_working")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filterTab === "not_working"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
              }`}
            >
              <X size={14} strokeWidth={3} />
              <span>{t("Absent")} ({notWorkingCount})</span>
            </button>

            {onLeaveCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab("on_leave")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  filterTab === "on_leave"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20"
                }`}
              >
                <Plane size={13} />
                <span>{t("On Leave")} ({onLeaveCount})</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-adm-text-3"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search by name, role, status…")}
              aria-label={t("Search staff")}
              className={`${inputClass} w-full ps-9 py-1.5 text-xs`}
            />
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-8">
            <LoadingBlock label={t("Loading workforce daily status and task delivery…")} />
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorBlock message={errorMessage} onRetry={refetchAll} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyBlock
              title={
                filterTab === "removal_candidates"
                  ? t("No removal candidates found")
                  : search || filterTab !== "all"
                    ? t("No matching staff")
                    : t("No staff records")
              }
              description={
                filterTab === "removal_candidates"
                  ? t("Great news! All staff members were either present, completed tasks, or are on approved leave.")
                  : search || filterTab !== "all"
                    ? t("Try clearing your search or switching filter tabs.")
                    : t("No employees are registered in the company yet.")
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-start text-sm">
              <thead className="border-b border-adm-border bg-adm-surface-2 text-xs font-semibold uppercase tracking-wider text-adm-text-2">
                <tr>
                  <th className="px-5 py-3 text-start">{t("Presence & Check-In")}</th>
                  <th className="px-5 py-3 text-start">{t("Staff Member")}</th>
                  <th className="px-5 py-3 text-start">{t("Tasks & Work Done")}</th>
                  <th className="px-5 py-3 text-start">{t("Hours Logged")}</th>
                  <th className="px-5 py-3 text-start">{t("Retention / Removal Assessment")}</th>
                  <th className="px-5 py-3 text-end">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adm-border">
                {filtered.map((item) => {
                  const emp = item.employee;
                  const isWorking = item.isWorking;
                  const isHighRisk = item.riskLevel === "high_risk";
                  const isModerateRisk = item.riskLevel === "moderate_risk";

                  return (
                    <tr
                      key={emp.id}
                      className={`transition ${
                        isHighRisk
                          ? "border-s-4 border-rose-600 bg-rose-500/[0.04] hover:bg-rose-500/[0.08]"
                          : isModerateRisk
                            ? "border-s-4 border-amber-500 bg-amber-500/[0.03] hover:bg-amber-500/[0.07]"
                            : isWorking
                              ? "border-s-4 border-emerald-500 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.06]"
                              : "border-s-4 border-blue-500 bg-blue-500/[0.02] hover:bg-blue-500/[0.06]"
                      }`}
                    >
                      {/* 1. Large Visual Presence Indicator */}
                      <td className="px-5 py-4">
                        {isWorking ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <Check size={20} strokeWidth={3} />
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                ✅ {item.kind === "shift_completed" ? t("Shift Done") : t("Present")}
                              </span>
                              {item.checkInDisplay && (
                                <p className="mt-0.5 text-[11px] font-medium text-emerald-600/90 dark:text-emerald-400/90">
                                  {t("In at")} {item.checkInDisplay}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : item.kind === "not_working" ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              <X size={20} strokeWidth={3} />
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                                ❌ {t("Absent")}
                              </span>
                              <p className="mt-0.5 text-[11px] font-medium text-rose-600/80 dark:text-rose-400/80">
                                {t("No check-in recorded")}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                              <Plane size={18} />
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                                🏖️ {t("On Leave")}
                              </span>
                              <p className="mt-0.5 text-[11px] font-medium text-blue-600/80 dark:text-blue-400/80">
                                {item.leave?.leaveType || t("Approved leave")}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 2. Employee Info */}
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-adm-text">
                              {emp.name || emp.email || t("Unnamed Staff")}
                            </p>
                            {emp.status && emp.status !== "active" && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold uppercase text-rose-600">
                                {emp.status}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-adm-text-3">
                            {emp.jobTitle && <span>{emp.jobTitle}</span>}
                            {emp.employeeIdString && (
                              <span className="border border-adm-border px-1 font-mono text-[10px] text-adm-text-3">
                                {emp.employeeIdString}
                              </span>
                            )}
                            {emp.email && <span className="text-adm-text-3">{emp.email}</span>}
                          </div>
                        </div>
                      </td>

                      {/* 3. Daily Work Done & Tasks */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 size={13} />
                              {item.tasksDoneToday} {t("completed today")}
                            </span>
                            {item.tasksInProgress > 0 && (
                              <span className="inline-flex items-center gap-1 rounded bg-adm-blue/15 px-2 py-0.5 text-xs font-bold text-adm-blue">
                                <Briefcase size={12} />
                                {item.tasksInProgress} {t("in progress")}
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="flex items-center gap-2 text-[11px] text-adm-text-3">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-adm-surface-2">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  item.tasksDoneToday > 0
                                    ? "bg-emerald-500"
                                    : item.tasksInProgress > 0
                                      ? "bg-adm-blue"
                                      : "bg-rose-400"
                                }`}
                                style={{ width: `${Math.max(item.outputScore, 8)}%` }}
                              />
                            </div>
                            <span className="tabular-nums font-semibold">
                              {item.totalTasksCount} {t("total assigned")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Hours Logged */}
                      <td className="px-5 py-4 tabular-nums">
                        {item.hoursWorkedDisplay ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-adm-text">
                              <Clock size={12} className="text-emerald-600" />
                              {item.hoursWorkedDisplay}
                            </span>
                            <span className="text-[11px] text-adm-text-3">
                              {item.shiftDisplay}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-adm-text-3 italic">
                            {isWorking ? t("Clocked in (no duration)") : t("0 hours logged")}
                          </span>
                        )}
                      </td>

                      {/* 5. Retention / Removal Assessment */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {isHighRisk ? (
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
                              <AlertTriangle size={12} />
                              {t("Candidate to Remove")}
                            </span>
                          ) : isModerateRisk ? (
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                              <Clock size={12} />
                              {t("Idle / Underperforming")}
                            </span>
                          ) : item.kind === "on_leave" ? (
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                              <Plane size={12} />
                              {t("Excused Leave")}
                            </span>
                          ) : (
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                              <Check size={12} />
                              {t("Keep · Productive")}
                            </span>
                          )}

                          <p className="text-[11px] font-medium text-adm-text-3">
                            {item.riskReason}
                          </p>
                        </div>
                      </td>

                      {/* 6. Removal Action Button */}
                      <td className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEvaluatingEmployee(item)}
                            title={t("Evaluate & Manage Removal")}
                            className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition ${
                              isHighRisk
                                ? "bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                                : "border border-adm-border text-adm-text-2 hover:border-rose-500 hover:text-rose-600"
                            }`}
                          >
                            <UserMinus size={13} />
                            <span>{isHighRisk ? t("Remove / Review") : t("Evaluate")}</span>
                          </button>

                          <Link
                            href={`/admin/employees/${emp.id}`}
                            className="inline-flex items-center gap-1 rounded border border-adm-border px-2.5 py-1 text-xs font-semibold text-adm-text transition hover:border-adm-blue hover:text-adm-blue"
                          >
                            <span>{t("Profile")}</span>
                            <ExternalLink size={11} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Evaluation & Removal Modal Dialog */}
      <PortalDialog
        open={Boolean(evaluatingEmployee)}
        title={t("Staff Removal & Performance Decision")}
        onClose={() => setEvaluatingEmployee(null)}
      >
        {evaluatingEmployee && (
          <div className="flex flex-col gap-5 p-1">
            {/* Staff Card Summary */}
            <div className="flex items-start gap-3 rounded-lg border border-adm-border bg-adm-surface-2 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-adm-surface border border-adm-border font-bold text-adm-text">
                {evaluatingEmployee.employee.name?.slice(0, 2).toUpperCase() || "ST"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-adm-text">
                    {evaluatingEmployee.employee.name}
                  </h3>
                  <span className="rounded bg-adm-surface px-1.5 py-0.5 text-[10px] font-mono text-adm-text-3 border border-adm-border">
                    {evaluatingEmployee.employee.employeeIdString || "ID"}
                  </span>
                </div>
                <p className="text-xs text-adm-text-3">
                  {evaluatingEmployee.employee.jobTitle} · {evaluatingEmployee.employee.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold text-adm-text">
                    {t("Status on")} {formatDateDisplay(date)}:
                  </span>
                  <span
                    className={
                      evaluatingEmployee.isWorking
                        ? "font-bold text-emerald-600"
                        : "font-bold text-rose-600"
                    }
                  >
                    {evaluatingEmployee.isWorking ? `✅ ${t("Present")}` : `❌ ${t("Absent")}`}
                  </span>
                  <span className="text-adm-text-3">·</span>
                  <span className="font-bold text-adm-text">
                    {evaluatingEmployee.tasksDoneToday} {t("tasks completed")}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance & Removal Rationale */}
            <div
              className={`rounded-lg border p-4 text-xs ${
                evaluatingEmployee.riskLevel === "high_risk"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert size={16} />
                <span>{t("Performance & Removal Assessment")}</span>
              </div>
              <p className="mt-1.5 leading-relaxed">
                {evaluatingEmployee.riskReason}.
              </p>
            </div>

            {/* Decision Action Buttons */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEvaluatingEmployee(null)}
                className="rounded-none border border-adm-border bg-adm-surface px-4 py-2 text-xs font-semibold text-adm-text transition hover:bg-adm-surface-2"
              >
                {t("Cancel")}
              </button>

              <button
                type="button"
                disabled={setEmployeeStatusMutation.isPending}
                onClick={() => handleUpdateStatus("inactive")}
                className="flex items-center justify-center gap-1.5 rounded-none border border-rose-600 bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                <UserMinus size={14} />
                <span>
                  {setEmployeeStatusMutation.isPending
                    ? t("Updating…")
                    : t("Deactivate Staff Member")}
                </span>
              </button>

              <button
                type="button"
                disabled={setEmployeeStatusMutation.isPending}
                onClick={() => handleUpdateStatus("terminated")}
                className="flex items-center justify-center gap-1.5 rounded-none border border-rose-800 bg-rose-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-black disabled:opacity-50"
              >
                <UserX size={14} />
                <span>
                  {setEmployeeStatusMutation.isPending
                    ? t("Terminating…")
                    : t("Terminate Employee")}
                </span>
              </button>
            </div>
          </div>
        )}
      </PortalDialog>
    </div>
  );
}
