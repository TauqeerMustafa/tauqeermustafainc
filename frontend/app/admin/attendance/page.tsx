"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock, Search, UserX, Users } from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  LoadingBlock,
  Panel,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import { useAttendanceRoster } from "@/hooks/useAttendance";

function formatTime(value: string | null | undefined) {
  if (!value) return "--:--";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** Local-time `YYYY-MM-DD`; `toISOString()` would roll back a day west of UTC. */
function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(todayKey());
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error, refetch } = useAttendanceRoster(date);

  const records = data ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => (record.employeeName ?? "").toLowerCase().includes(needle));
  }, [records, query]);

  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const away = records.length - present - late;

  return (
    <div className="flex flex-col gap-8">
      <PortalPageHeader title="Daily Roster" description="Who is in, who is late, and who is away.">
        <div className="w-52">
          <Field label="Date" htmlFor="roster-date">
            <input
              id="roster-date"
              type="date"
              value={date}
              max={todayKey()}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </PortalPageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Logged" value={records.length} icon={Users} tone="blue" />
        <StatCard label="Present" value={present} icon={Clock} tone="green" />
        <StatCard label="Late" value={late} icon={CalendarDays} tone="amber" />
        <StatCard label="Away" value={away < 0 ? 0 : away} icon={UserX} tone="red" />
      </div>

      <Panel
        title={`Roster · ${new Date(date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}`}
        icon={Users}
        padded={false}
        action={
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-adm-text-3" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employee"
              aria-label="Search employee"
              className="w-40 rounded-none border border-adm-border bg-adm-surface py-1.5 pl-8 pr-3 text-xs text-adm-text outline-none transition placeholder:text-adm-text-3 focus:border-adm-blue sm:w-56"
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="p-5">
            <LoadingBlock label="Loading roster…" />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorBlock
              message={error instanceof Error ? error.message : "Could not load the roster."}
              onRetry={() => refetch()}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyBlock
              title={records.length === 0 ? "No records" : "No matches"}
              description={
                records.length === 0
                  ? "Nobody has checked in on this date yet."
                  : "No employee on this roster matches your search."
              }
            />
          </div>
        ) : (
          <DataTable head={["Employee", "Status", "Check in", "Check out", "Notes"]}>
            {filtered.map((record) => (
              <tr key={record.id} className="transition hover:bg-adm-surface-2">
                <Td strong>
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-adm-blue-light text-xs font-bold text-adm-blue">
                      {(record.employeeName ?? "E").charAt(0).toUpperCase()}
                    </span>
                    {record.employeeName ?? "Unknown"}
                  </span>
                </Td>
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
