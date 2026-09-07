"use client";

import { Calendar, CheckCircle2, Clock, LogOut } from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Label,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalPageHeader,
  StatusPill,
  Td,
} from "@/components/portal/PortalUI";
import { useCheckIn, useCheckOut, useMyAttendance } from "@/hooks/useAttendance";

const DASH = "--:--";

function formatTime(value: string | null | undefined) {
  if (!value) return DASH;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDay(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/** Local-time `YYYY-MM-DD`; `toISOString()` would shift the day for UTC-negative offsets. */
function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export default function EmployeeAttendancePage() {
  const { data: history, isLoading, isError, error, refetch } = useMyAttendance(60);
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const today = todayKey();
  const todayRecord = history?.find((record) => record.date?.slice(0, 10) === today) ?? null;
  const checkedIn = Boolean(todayRecord?.checkInTime);
  const checkedOut = Boolean(todayRecord?.checkOutTime);
  const mutating = checkIn.isPending || checkOut.isPending;
  const mutationError = (checkIn.error ?? checkOut.error) as Error | undefined;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader
        title="My Attendance"
        description="Log your working hours and review the last 60 days."
      />

      <Panel title="Today" icon={Clock} tone={checkedIn ? "green" : "amber"}>
        <p className="text-sm text-adm-text-2">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-10">
          <div>
            <Label>Check in</Label>
            <p className="mt-1 text-3xl font-bold tabular-nums text-adm-text">
              {formatTime(todayRecord?.checkInTime)}
            </p>
          </div>
          <div className="hidden h-14 w-px bg-adm-border sm:block" aria-hidden="true" />
          <div>
            <Label>Check out</Label>
            <p className="mt-1 text-3xl font-bold tabular-nums text-adm-text">
              {formatTime(todayRecord?.checkOutTime)}
            </p>
          </div>
          {todayRecord && (
            <div>
              <Label>Status</Label>
              <p className="mt-2">
                <StatusPill status={todayRecord.status} />
              </p>
            </div>
          )}
        </div>

        <div className="mt-7 border-t border-adm-border pt-6">
          {!checkedIn ? (
            <PortalButton icon={CheckCircle2} disabled={mutating} onClick={() => checkIn.mutate(undefined)}>
              {checkIn.isPending ? "Checking in…" : "Check in now"}
            </PortalButton>
          ) : !checkedOut ? (
            <PortalButton variant="ghost" icon={LogOut} disabled={mutating} onClick={() => checkOut.mutate(undefined)}>
              {checkOut.isPending ? "Checking out…" : "Check out now"}
            </PortalButton>
          ) : (
            <p className="flex items-center gap-2 border border-adm-green bg-adm-green-light px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-green">
              <CheckCircle2 size={15} /> Shift completed
            </p>
          )}
          {mutationError && <p className="mt-3 text-xs text-adm-red">{mutationError.message}</p>}
        </div>
      </Panel>

      <Panel title="History" icon={Calendar} padded={false}>
        {isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading history…" />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorBlock
              message={error instanceof Error ? error.message : "Could not load your attendance."}
              onRetry={() => refetch()}
            />
          </div>
        ) : !history?.length ? (
          <div className="p-5">
            <EmptyBlock title="No records" description="Your attendance log starts on your first check-in." />
          </div>
        ) : (
          <DataTable head={["Date", "Status", "Check in", "Check out", "Notes"]}>
            {history.map((record) => (
              <tr key={record.id} className="transition hover:bg-adm-surface-2">
                <Td strong>{formatDay(record.date)}</Td>
                <Td>
                  <StatusPill status={record.status} />
                </Td>
                <Td className="tabular-nums">{formatTime(record.checkInTime)}</Td>
                <Td className="tabular-nums">{formatTime(record.checkOutTime)}</Td>
                <Td className="max-w-xs truncate">{record.notes || "—"}</Td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
