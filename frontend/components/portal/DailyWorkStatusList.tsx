"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Layers,
  Plane,
  RefreshCw,
  Search,
  Users,
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
  StatCard,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useAttendanceRoster } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
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

type WorkStatusKind = "working" | "shift_completed" | "on_leave" | "not_working";

interface EmployeeWorkStatus {
  employee: EmployeeRecord;
  kind: WorkStatusKind;
  isWorking: boolean;
  attendance?: AttendanceRecord;
  leave?: LeaveRequest;
  checkInDisplay: string | null;
  checkOutDisplay: string | null;
  routineSummary: string;
  activeTasksCount: number;
  totalTasksCount: number;
  shiftDisplay: string;
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
  title = "Who's Working Today — Daily Routine Status",
  description = "Real-time list of all staff members with Green Tick (✅) or Red Cross (❌) indicating daily routine activity.",
}: Props) {
  const { t } = useI18n();
  const [date, setDate] = useState(initialDate || todayKey());
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "working" | "not_working" | "on_leave">("all");

  const employeesQuery = useEmployees();
  const attendanceQuery = useAttendanceRoster(date);
  const leavesQuery = useLeaveQueue("approved");
  const tasksQuery = useAllTasks();

  const isToday = date === todayKey();
  const employees = employeesQuery.data ?? [];
  const attendanceRecords = attendanceQuery.data ?? [];
  const approvedLeaves = leavesQuery.data ?? [];
  const allTasks: ProjectTask[] = tasksQuery.data?.items ?? [];

  // Map employee status
  const statuses: EmployeeWorkStatus[] = useMemo(() => {
    return employees.map((emp) => {
      // Find attendance record for this employee on the chosen date
      const att = attendanceRecords.find(
        (r) => r.employeeId === emp.id || (r.employeeName && emp.name && r.employeeName === emp.name),
      );

      // Find if employee is on approved leave for this date
      const leave = approvedLeaves.find((l) => {
        if (l.employeeId !== emp.id) return false;
        const start = l.startDate.slice(0, 10);
        const end = l.endDate.slice(0, 10);
        return date >= start && date <= end;
      });

      // Find tasks assigned to this employee's user account
      const empTasks = allTasks.filter(
        (taskItem: ProjectTask) =>
          taskItem.assignedToId === emp.userId ||
          (taskItem as unknown as { assignees?: { id: string }[] }).assignees?.some(
            (a) => a.id === emp.userId,
          ),
      );
      const activeTasks = empTasks.filter(
        (taskItem: ProjectTask) =>
          taskItem.status === "in_progress" ||
          taskItem.status === "review" ||
          taskItem.status === "todo",
      );

      // Shift info
      const shift = getEmployeeShift(emp.id);
      const shiftDisplay = formatShiftDisplay(shift.expectedTime);

      const inTime = formatTime(att?.checkInTime);
      const outTime = formatTime(att?.checkOutTime);

      let kind: WorkStatusKind = "not_working";
      let isWorking = false;
      let routineSummary = t("No check-in or daily routine recorded today");

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

      return {
        employee: emp,
        kind,
        isWorking,
        attendance: att,
        leave,
        checkInDisplay: inTime,
        checkOutDisplay: outTime,
        routineSummary,
        activeTasksCount: activeTasks.length,
        totalTasksCount: empTasks.length,
        shiftDisplay,
      };
    });
  }, [employees, attendanceRecords, approvedLeaves, allTasks, date, t]);

  // Aggregate metrics
  const totalCount = statuses.length;
  const workingCount = statuses.filter((s) => s.isWorking).length;
  const notWorkingCount = statuses.filter((s) => s.kind === "not_working").length;
  const onLeaveCount = statuses.filter((s) => s.kind === "on_leave").length;
  const workingRate = totalCount > 0 ? Math.round((workingCount / totalCount) * 100) : 0;

  // Filtered rows
  const filtered = useMemo(() => {
    let result = statuses;

    if (filterTab === "working") {
      result = result.filter((s) => s.isWorking);
    } else if (filterTab === "not_working") {
      result = result.filter((s) => s.kind === "not_working");
    } else if (filterTab === "on_leave") {
      result = result.filter((s) => s.kind === "on_leave");
    }

    const needle = search.trim().toLowerCase();
    if (!needle) return result;

    return result.filter((item) => {
      const e = item.employee;
      return [e.name, e.email, e.jobTitle, e.employeeIdString, e.role]
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
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with Date & Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-adm-border bg-adm-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-adm-text">
              {t(title)}
            </h2>
            {isToday && (
              <span className="inline-flex items-center gap-1 rounded-full bg-adm-green-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-adm-green">
                <span className="h-2 w-2 animate-pulse rounded-full bg-adm-green" />
                {t("Live Today")}
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
                className={`${inputClass} w-40 text-xs`}
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
              title={t("Refresh")}
              aria-label={t("Refresh")}
              className="rounded border border-adm-border p-2 text-adm-text-2 transition hover:bg-adm-surface-2 hover:text-adm-text"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="flex flex-col border border-adm-border bg-adm-surface p-4">
          <div className="flex items-center justify-between text-adm-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">{t("Total Staff")}</span>
            <Users size={16} />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-adm-text">
            {isLoading ? "…" : totalCount}
          </p>
          <span className="mt-1 text-[11px] text-adm-text-3">{t("Registered on roster")}</span>
        </div>

        <div className="flex flex-col border border-emerald-500/30 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t("Working Today")}</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {isLoading ? "…" : workingCount}
          </p>
          <span className="mt-1 text-[11px] font-semibold text-emerald-600/80 dark:text-emerald-400/80">
            ✅ {t("Checked in & active")}
          </span>
        </div>

        <div className="flex flex-col border border-rose-500/30 bg-rose-500/[0.04] p-4">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t("Not Working")}</span>
            <XCircle size={18} className="text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {isLoading ? "…" : notWorkingCount}
          </p>
          <span className="mt-1 text-[11px] font-semibold text-rose-600/80 dark:text-rose-400/80">
            ❌ {t("Absent / No check-in")}
          </span>
        </div>

        <div className="flex flex-col border border-blue-500/30 bg-blue-500/[0.04] p-4">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t("On Leave")}</span>
            <Plane size={16} className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {isLoading ? "…" : onLeaveCount}
          </p>
          <span className="mt-1 text-[11px] text-blue-600/80 dark:text-blue-400/80">
            🏖️ {t("Approved leave")}
          </span>
        </div>

        <div className="col-span-2 flex flex-col border border-adm-border bg-adm-surface p-4 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-adm-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">{t("Activity Rate")}</span>
            <Clock size={16} />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-adm-text">
            {isLoading ? "…" : `${workingRate}%`}
          </p>
          <div className="mt-2 h-1.5 w-full bg-adm-surface-2 overflow-hidden rounded-full">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${workingRate}%` }}
            />
          </div>
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
              <span>{t("Working Today")} ({workingCount})</span>
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
              <span>{t("Not Working")} ({notWorkingCount})</span>
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
              placeholder={t("Filter by name, title, role…")}
              aria-label={t("Search staff")}
              className={`${inputClass} w-full ps-9 py-1.5 text-xs`}
            />
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-8">
            <LoadingBlock label={t("Loading workforce daily status…")} />
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorBlock message={errorMessage} onRetry={refetchAll} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyBlock
              title={search || filterTab !== "all" ? t("No matching staff") : t("No staff records")}
              description={
                search || filterTab !== "all"
                  ? t("Try clearing your search or switching filter tabs.")
                  : t("No employees are registered in the company yet.")
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-start text-sm">
              <thead className="border-b border-adm-border bg-adm-surface-2 text-xs font-semibold uppercase tracking-wider text-adm-text-2">
                <tr>
                  <th className="px-5 py-3 text-start">{t("Work Status")}</th>
                  <th className="px-5 py-3 text-start">{t("Staff Member")}</th>
                  <th className="px-5 py-3 text-start">{t("Daily Routine & Activity")}</th>
                  <th className="px-5 py-3 text-start">{t("Tasks / Work")}</th>
                  <th className="px-5 py-3 text-start">{t("Shift & Timing")}</th>
                  <th className="px-5 py-3 text-end">{t("Profile")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adm-border">
                {filtered.map((item) => {
                  const emp = item.employee;
                  const isWorking = item.isWorking;
                  const isNotWorking = item.kind === "not_working";
                  const isOnLeave = item.kind === "on_leave";

                  return (
                    <tr
                      key={emp.id}
                      className={`transition ${
                        isWorking
                          ? "border-s-4 border-emerald-500 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.06]"
                          : isNotWorking
                            ? "border-s-4 border-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/[0.06]"
                            : "border-s-4 border-blue-500 bg-blue-500/[0.02] hover:bg-blue-500/[0.06]"
                      }`}
                    >
                      {/* 1. Large Visual Status Indicator */}
                      <td className="px-5 py-4">
                        {isWorking ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <Check size={20} strokeWidth={3} />
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                ✅ {item.kind === "shift_completed" ? t("Shift Done") : t("Working")}
                              </span>
                              {item.checkInDisplay && (
                                <p className="mt-0.5 text-[11px] font-medium text-emerald-600/90 dark:text-emerald-400/90">
                                  {t("In at")} {item.checkInDisplay}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : isNotWorking ? (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              <X size={20} strokeWidth={3} />
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                                ❌ {t("Not Working")}
                              </span>
                              <p className="mt-0.5 text-[11px] font-medium text-rose-600/80 dark:text-rose-400/80">
                                {t("Absent today")}
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
                          <p className="font-bold text-adm-text">
                            {emp.name || emp.email || t("Unnamed Staff")}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-adm-text-3">
                            {emp.jobTitle && <span>{emp.jobTitle}</span>}
                            {emp.employeeIdString && (
                              <span className="font-mono text-[10px] text-adm-text-3 border border-adm-border px-1">
                                {emp.employeeIdString}
                              </span>
                            )}
                            {emp.email && <span className="text-adm-text-3">{emp.email}</span>}
                          </div>
                        </div>
                      </td>

                      {/* 3. Daily Routine & Activity */}
                      <td className="px-5 py-4">
                        <p
                          className={`text-xs font-semibold ${
                            isWorking
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isNotWorking
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {item.routineSummary}
                        </p>
                        {item.attendance?.notes && (
                          <p className="mt-0.5 text-[11px] text-adm-text-3 italic">
                            “{item.attendance.notes}”
                          </p>
                        )}
                      </td>

                      {/* 4. Active Tasks */}
                      <td className="px-5 py-4 tabular-nums">
                        {item.activeTasksCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-adm-text">
                            <Briefcase size={13} className="text-adm-blue" />
                            {item.activeTasksCount} {t("active task(s)")}
                          </span>
                        ) : (
                          <span className="text-xs text-adm-text-3">
                            {item.totalTasksCount > 0
                              ? t("Tasks completed")
                              : t("No assigned tasks")}
                          </span>
                        )}
                      </td>

                      {/* 5. Assigned Shift */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-adm-text-2">
                          {item.shiftDisplay}
                        </span>
                      </td>

                      {/* 6. Action Link */}
                      <td className="px-5 py-4 text-end">
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className="inline-flex items-center gap-1 rounded border border-adm-border px-2.5 py-1 text-xs font-semibold text-adm-text transition hover:border-adm-blue hover:text-adm-blue"
                        >
                          <span>{t("Profile")}</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
