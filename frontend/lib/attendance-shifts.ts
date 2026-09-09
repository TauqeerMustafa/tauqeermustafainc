/**
 * Shift configuration and automated late detection utilities.
 * Allows administrators and managers to assign standard or custom shift times
 * to individual or bulk-selected employees, with automated late flagging.
 */

export type ShiftConfig = {
  expectedTime: string; // e.g. "09:00" (24-hour format)
  graceMinutes: number; // e.g. 15 minutes
  label?: string; // e.g. "Standard Morning Shift"
};

export const DEFAULT_SHIFT: ShiftConfig = {
  expectedTime: "09:00",
  graceMinutes: 15,
  label: "Standard Shift (09:00 AM)",
};

const STORAGE_KEY = "tmi_assigned_shifts_config";

/** Retrieve all shift assignments stored in localStorage. */
export function getSavedShifts(): Record<string, ShiftConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Retrieve the assigned shift for a specific employee, falling back to DEFAULT_SHIFT. */
export function getEmployeeShift(employeeIdOrEmail?: string | null): ShiftConfig {
  if (!employeeIdOrEmail) return DEFAULT_SHIFT;
  const shifts = getSavedShifts();
  return shifts[employeeIdOrEmail] || shifts["default"] || DEFAULT_SHIFT;
}

/** Assign shift time to one or multiple employees. */
export function assignBulkShifts(
  employeeIds: string[],
  config: ShiftConfig,
): void {
  if (typeof window === "undefined") return;
  const current = getSavedShifts();
  for (const id of employeeIds) {
    if (id) {
      current[id] = config;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

/** Format "09:00" into "09:00 AM" for human display. */
export function formatShiftDisplay(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr || "9", 10);
  const m = parseInt(mStr || "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, "0");
  return `${String(displayH).padStart(2, "0")}:${displayM} ${ampm}`;
}

/**
 * Evaluate if a given check-in timestamp qualifies as "present" or "late".
 * Compares against the employee's assigned shift time + grace window.
 */
export function evaluateCheckIn(
  checkInDate: Date = new Date(),
  employeeIdOrEmail?: string | null,
): {
  status: "present" | "late";
  lateMinutes: number;
  note: string;
  shiftDisplay: string;
} {
  const shift = getEmployeeShift(employeeIdOrEmail);
  const shiftDisplay = formatShiftDisplay(shift.expectedTime);

  const [expHourStr, expMinStr] = shift.expectedTime.split(":");
  const expHour = parseInt(expHourStr || "9", 10);
  const expMin = parseInt(expMinStr || "0", 10);

  // Target time on the check-in day
  const targetTime = new Date(checkInDate);
  targetTime.setHours(expHour, expMin, 0, 0);

  // Deadline including grace minutes
  const deadlineTime = new Date(targetTime.getTime() + shift.graceMinutes * 60 * 1000);

  const checkInTimeMs = checkInDate.getTime();
  const deadlineMs = deadlineTime.getTime();

  if (checkInTimeMs > deadlineMs) {
    const diffMinutes = Math.ceil((checkInTimeMs - targetTime.getTime()) / (60 * 1000));
    return {
      status: "late",
      lateMinutes: diffMinutes,
      note: `Late arrival (${diffMinutes}m past ${shiftDisplay} shift)`,
      shiftDisplay,
    };
  }

  return {
    status: "present",
    lateMinutes: 0,
    note: `On time check-in (${shiftDisplay} shift)`,
    shiftDisplay,
  };
}
