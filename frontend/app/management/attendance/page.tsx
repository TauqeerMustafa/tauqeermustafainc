"use client";

import { useState } from "react";
import { AlertCircle, CalendarClock, Check, CheckCircle2, Plane, X } from "lucide-react";

import DailyWorkStatusList from "@/components/portal/DailyWorkStatusList";
import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  SegmentBar,
  StatCard,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useAttendanceRoster } from "@/hooks/useAttendance";
import { useDecideLeave, useLeaveQueue } from "@/hooks/useLeave";
import { getEmployeeShift, formatShiftDisplay } from "@/lib/attendance-shifts";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(value: string | null | undefined) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const QUEUE_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
] as const;

export default function ManagementAttendancePage() {
  const [viewMode, setViewMode] = useState<"status" | "roster">("status");
  const [date, setDate] = useState(today);
  const [queueStatus, setQueueStatus] = useState<string>("pending");

  const roster = useAttendanceRoster(date);
  const queue = useLeaveQueue(queueStatus);
  const decide = useDecideLeave();

  const rows = roster.data ?? [];
  const counts = rows.reduce(
    (acc, row) => {
      const status = String(row.status ?? "").toLowerCase();
      if (status === "present") acc.present += 1;
      else if (status === "late") acc.late += 1;
      else if (status === "leave") acc.onLeave += 1;
      else if (status === "half_day") acc.halfDay += 1;
      else acc.absent += 1;
      return acc;
    },
    { present: 0, late: 0, absent: 0, onLeave: 0, halfDay: 0 },
  );

  const requests = queue.data ?? [];
  const pendingCount = requests.filter(
    (request) => String(request.status).toLowerCase() === "pending",
  ).length;

  /** Which row is mid-flight, so only its buttons disable. */
  const decidingId = decide.isPending ? decide.variables?.id : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* View Switcher: Daily Work Status vs Roster & Leave */}
      <div className="flex border-b border-adm-border">
        <button
          type="button"
          onClick={() => setViewMode("status")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
            viewMode === "status"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-adm-text-3 hover:text-adm-text"
          }`}
        >
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>Who&apos;s Working Today (Check ✅ / Cross ❌)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("roster")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
            viewMode === "roster"
              ? "border-adm-blue text-adm-blue"
              : "border-transparent text-adm-text-3 hover:text-adm-text"
          }`}
        >
          <CalendarClock size={15} />
          <span>Detailed Roster &amp; Approvals</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {viewMode === "status" ? (
        <>
          {pendingCount > 0 && (
            <div className="flex items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>
                  <strong>{pendingCount}</strong> leave request(s) waiting for your decision.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode("roster")}
                className="font-bold underline hover:no-underline"
              >
                Review Leave Queue →
              </button>
            </div>
          )}
          <DailyWorkStatusList />
        </>
      ) : (
        <>
          <PortalPageHeader
            title="Attendance & approvals"
            description="Who is in today, and the leave sitting in your queue."
          >
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value || today())}
              aria-label="Roster date"
              className={`${inputClass} w-44`}
            />
          </PortalPageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Present" value={counts.present} icon={Check} tone="green" />
        <StatCard label="Late" value={counts.late} icon={CalendarClock} tone="amber" />
        <StatCard label="On leave" value={counts.onLeave} icon={Plane} tone="blue" />
        <StatCard
          label="Awaiting approval"
          value={pendingCount}
          icon={CalendarClock}
          tone={pendingCount > 0 ? "amber" : "neutral"}
          hint={queueStatus === "pending" ? undefined : "Pending only"}
        />
      </div>

      <Panel title={`Roster — ${formatDate(date)}`} icon={Check} padded={false}>
        {roster.isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading roster…" />
          </div>
        ) : roster.isError ? (
          <div className="p-5">
            <ErrorBlock
              message={
                roster.error instanceof Error
                  ? roster.error.message
                  : "Could not load attendance for this day."
              }
              onRetry={() => roster.refetch()}
            />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title="Nothing recorded"
              description="No attendance rows exist for this date yet."
            />
          </div>
        ) : (
          <>
            <div className="px-5 pt-5">
              <SegmentBar
                segments={[
                  { value: counts.present, tone: "green" },
                  { value: counts.late, tone: "amber" },
                  { value: counts.halfDay, tone: "blue" },
                  { value: counts.onLeave, tone: "blue" },
                  { value: counts.absent, tone: "red" },
                ]}
              />
            </div>
            <DataTable head={["Employee", "Assigned Shift", "Status", "Check in", "Check out", "Notes"]}>
              {rows.map((row) => {
                const shift = getEmployeeShift(row.employeeId || row.id);
                const shiftDisplay = formatShiftDisplay(shift.expectedTime);
                return (
                  <tr key={row.id} className="transition hover:bg-adm-surface-2">
                    <Td strong>{row.employeeName ?? "—"}</Td>
                    <Td>
                      <span className="font-mono text-[11px] font-medium text-adm-text-2">
                        {shiftDisplay} ({shift.graceMinutes}m grace)
                      </span>
                    </Td>
                    <Td>
                      <StatusPill status={row.status} />
                    </Td>
                    <Td>{formatTime(row.checkInTime)}</Td>
                    <Td>{formatTime(row.checkOutTime)}</Td>
                    <Td className="max-w-xs truncate">{row.notes || "—"}</Td>
                  </tr>
                );
              })}
            </DataTable>
          </>
        )}
      </Panel>

      <Panel
        title={`Leave queue (${requests.length})`}
        icon={Plane}
        padded={false}
        action={
          <select
            value={queueStatus}
            onChange={(event) => setQueueStatus(event.target.value)}
            aria-label="Filter leave requests by status"
            className={`${inputClass} w-36`}
          >
            {QUEUE_FILTERS.map((filter) => (
              <option key={filter.label} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        }
      >
        {decide.isError ? (
          <div className="p-5 pb-0">
            <ErrorBlock
              message={
                decide.error instanceof Error
                  ? decide.error.message
                  : "The decision could not be saved."
              }
            />
          </div>
        ) : null}

        {queue.isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading requests…" />
          </div>
        ) : queue.isError ? (
          <div className="p-5">
            <ErrorBlock
              message={
                queue.error instanceof Error
                  ? queue.error.message
                  : "Could not load the leave queue."
              }
              onRetry={() => queue.refetch()}
            />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title="Queue is clear"
              description={
                queueStatus === "pending"
                  ? "No leave is waiting on a decision."
                  : "No requests match this filter."
              }
            />
          </div>
        ) : (
          <DataTable head={["Employee", "Type", "Dates", "Reason", "Status", ""]}>
            {requests.map((request) => {
              const isPending = String(request.status).toLowerCase() === "pending";
              const busy = decidingId === request.id;
              return (
                <tr key={request.id} className="transition hover:bg-adm-surface-2">
                  <Td strong>{request.employeeName ?? "—"}</Td>
                  <Td>{request.leaveType || "—"}</Td>
                  <Td>
                    {formatDate(request.startDate)} → {formatDate(request.endDate)}
                  </Td>
                  <Td className="max-w-xs truncate">{request.reason || "—"}</Td>
                  <Td>
                    <StatusPill status={request.status} />
                  </Td>
                  <Td>
                    {isPending ? (
                      <div className="flex justify-end gap-2">
                        <PortalButton
                          icon={Check}
                          disabled={busy}
                          onClick={() =>
                            decide.mutate({ id: request.id, payload: { status: "approved" } })
                          }
                        >
                          Approve
                        </PortalButton>
                        <PortalButton
                          variant="danger"
                          icon={X}
                          disabled={busy}
                          onClick={() =>
                            decide.mutate({ id: request.id, payload: { status: "rejected" } })
                          }
                        >
                          Reject
                        </PortalButton>
                      </div>
                    ) : (
                      <span className="block text-right text-xs text-adm-text-3">
                        {request.managerNotes || "Decided"}
                      </span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>
        </>
      )}
    </div>
  );
}
