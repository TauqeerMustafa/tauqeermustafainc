"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckSquare,
  Clock,
  Search,
  Settings2,
  Square,
  UserX,
  Users,
} from "lucide-react";

import {
  DataTable,
  EmptyBlock,
  ErrorBlock,
  Field,
  LoadingBlock,
  Panel,
  PortalButton,
  PortalDialog,
  PortalPageHeader,
  StatCard,
  StatusPill,
  Td,
  inputClass,
} from "@/components/portal/PortalUI";
import PeopleBanner from "@/components/portal/PeopleBanner";
import { useAttendanceRoster } from "@/hooks/useAttendance";
import {
  DEFAULT_SHIFT,
  assignBulkShifts,
  formatShiftDisplay,
  getEmployeeShift,
  getSavedShifts,
  type ShiftConfig,
} from "@/lib/attendance-shifts";

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

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftTime, setShiftTime] = useState("09:00");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [shiftNotice, setShiftNotice] = useState<string | null>(null);

  // Shift configs trigger state update
  const [shiftsVersion, setShiftsVersion] = useState(0);

  const records = data ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((record) => (record.employeeName ?? "").toLowerCase().includes(needle));
  }, [records, query]);

  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const away = records.length - present - late;

  // Toggle single selection
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  // Toggle select all
  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.employeeId || r.id));
    }
  }

  // Handle shift assignment
  function handleSaveShift(e: React.FormEvent) {
    e.preventDefault();
    const config: ShiftConfig = {
      expectedTime: shiftTime,
      graceMinutes: Number(graceMinutes) || 0,
      label: `Shift (${formatShiftDisplay(shiftTime)})`,
    };

    const targetIds = selectedIds.length > 0 ? selectedIds : ["default"];
    assignBulkShifts(targetIds, config);

    setShiftNotice(
      selectedIds.length > 0
        ? `Shift set to ${formatShiftDisplay(shiftTime)} (${graceMinutes}m grace) for ${selectedIds.length} employee(s).`
        : `Default organization shift set to ${formatShiftDisplay(shiftTime)} (${graceMinutes}m grace).`,
    );

    setShiftsVersion((v) => v + 1);
    setIsShiftModalOpen(false);
    setSelectedIds([]);

    setTimeout(() => setShiftNotice(null), 5000);
  }

  return (
    <div className="flex flex-col gap-8">
      <PeopleBanner active="attendance" />

      <PortalPageHeader
        title="Daily Roster"
        description="Who is in, who is late, and who is away. Multi-select staff to configure shifts."
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-48">
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

          <PortalButton
            icon={Settings2}
            variant="primary"
            onClick={() => setIsShiftModalOpen(true)}
          >
            {selectedIds.length > 0
              ? `Assign Shift (${selectedIds.length})`
              : "Set Shift Time"}
          </PortalButton>
        </div>
      </PortalPageHeader>

      {shiftNotice && (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
          <Check size={16} className="shrink-0" />
          <span>{shiftNotice}</span>
        </div>
      )}

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
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <span className="font-mono text-xs font-bold text-adm-blue">
                {selectedIds.length} selected
              </span>
            )}
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
          <DataTable
            head={[
              <input
                key="select-all"
                type="checkbox"
                aria-label="Select all employees"
                checked={selectedIds.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="accent-adm-blue cursor-pointer"
              />,
              "Employee",
              "Assigned Shift",
              "Status",
              "Check in",
              "Check out",
              "Notes",
            ]}
          >
            {filtered.map((record) => {
              const empId = record.employeeId || record.id;
              const isSelected = selectedIds.includes(empId);
              const shift = getEmployeeShift(empId);
              const shiftDisplay = formatShiftDisplay(shift.expectedTime);

              return (
                <tr
                  key={record.id}
                  className={`transition hover:bg-adm-surface-2 ${
                    isSelected ? "bg-adm-blue/5" : ""
                  }`}
                >
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${record.employeeName ?? "employee"}`}
                      checked={isSelected}
                      onChange={() => toggleSelect(empId)}
                      className="accent-adm-blue cursor-pointer"
                    />
                  </Td>
                  <Td strong>
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-adm-blue-light text-xs font-bold text-adm-blue">
                        {(record.employeeName ?? "E").charAt(0).toUpperCase()}
                      </span>
                      {record.employeeName ?? "Unknown"}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px] font-medium text-adm-text-2">
                      {shiftDisplay} ({shift.graceMinutes}m grace)
                    </span>
                  </Td>
                  <Td>
                    <StatusPill status={record.status} />
                  </Td>
                  <Td className="tabular-nums">{formatTime(record.checkInTime)}</Td>
                  <Td className="tabular-nums">{formatTime(record.checkOutTime)}</Td>
                  <Td className="max-w-xs truncate">{record.notes || "—"}</Td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>

      {/* Assign Shift Dialog */}
      <PortalDialog
        open={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title="Assign Shift &amp; Expected Arrival Time"
      >
        <form onSubmit={handleSaveShift} className="flex flex-col gap-5">
          <p className="text-xs text-adm-text-3">
            {selectedIds.length > 0
              ? `Configuring shift time for ${selectedIds.length} selected employee(s). Anyone who checks in past the shift time (+ grace period) will automatically be flagged as Late.`
              : "Configuring default organization shift schedule for all employees. Anyone checking in past this deadline will automatically be marked Late."}
          </p>

          <Field label="Expected Shift Time (HH:MM)" htmlFor="shift-time">
            <input
              id="shift-time"
              type="time"
              required
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value)}
              className={inputClass}
            />
          </Field>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-adm-text-3">Presets:</span>
            {["09:00", "09:30", "10:00", "14:00"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setShiftTime(preset)}
                className={`px-2 py-0.5 font-mono text-[10px] border transition ${
                  shiftTime === preset
                    ? "border-adm-blue bg-adm-blue text-white"
                    : "border-adm-border bg-adm-surface hover:bg-adm-surface-2 text-adm-text-2"
                }`}
              >
                {formatShiftDisplay(preset)}
              </button>
            ))}
          </div>

          <Field label="Grace Period (Minutes before marking Late)" htmlFor="grace-minutes">
            <select
              id="grace-minutes"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(Number(e.target.value))}
              className={inputClass}
            >
              <option value={0}>0 minutes (Strict — no grace)</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes (Standard)</option>
              <option value={30}>30 minutes</option>
            </select>
          </Field>

          <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-xs text-amber-500">
            <p className="font-bold">Automated Late Detection Rule:</p>
            <p className="mt-0.5">
              Check-ins at or before {formatShiftDisplay(shiftTime)} + {graceMinutes}m will be recorded as <strong>Present</strong>. Any check-in after will automatically be flagged as <strong>Late</strong> with exact minutes elapsed.
            </p>
          </div>

          <div className="mt-2 flex justify-end gap-3 border-t border-adm-border pt-5">
            <PortalButton variant="ghost" onClick={() => setIsShiftModalOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton type="submit">
              Apply Shift Schedule
            </PortalButton>
          </div>
        </form>
      </PortalDialog>
    </div>
  );
}
