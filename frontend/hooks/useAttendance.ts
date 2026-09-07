"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { attendanceService } from "@/services";

/** The signed-in user's own attendance history. */
export function useMyAttendance(limit = 30) {
  return useQuery({
    queryKey: [...queryKeys.attendance.me, limit],
    queryFn: () => attendanceService.mine(limit),
  });
}

/**
 * Company-wide roster for one day. `date` is an ISO `YYYY-MM-DD` string; when
 * omitted the backend defaults to today, so the key uses a `today` sentinel
 * rather than baking in a client-side date that would drift past midnight.
 */
export function useAttendanceRoster(date?: string) {
  return useQuery({
    queryKey: queryKeys.attendance.roster(date ?? "today"),
    queryFn: () => attendanceService.roster(date),
  });
}

/** One employee's attendance history, for the admin profile page. */
export function useEmployeeAttendance(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attendance.forEmployee(employeeId ?? ""),
    queryFn: () => attendanceService.forEmployee(employeeId as string),
    enabled: Boolean(employeeId),
  });
}

function useAttendanceMutation(fn: (notes?: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => fn(notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.me });
      queryClient.invalidateQueries({ queryKey: ["attendance", "roster"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "employee"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.employee });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.management });
    },
  });
}

export function useCheckIn() {
  return useAttendanceMutation(attendanceService.checkIn);
}

export function useCheckOut() {
  return useAttendanceMutation(attendanceService.checkOut);
}
