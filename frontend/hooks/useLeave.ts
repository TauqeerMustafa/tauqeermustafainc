"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { leaveService } from "@/services";
import type { CreateLeaveRequestPayload, UpdateLeaveStatusPayload } from "@/types";

export function useMyLeave() {
  return useQuery({
    queryKey: queryKeys.leave.me,
    queryFn: leaveService.mine,
  });
}

/** Approval queue. Pass an empty string to fetch every status. */
export function useLeaveQueue(status = "pending") {
  return useQuery({
    queryKey: queryKeys.leave.queue(status || "all"),
    queryFn: () => leaveService.queue(status),
  });
}

/** One employee's full leave history, for the admin profile page. */
export function useEmployeeLeave(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leave.forEmployee(employeeId ?? ""),
    queryFn: () => leaveService.forEmployee(employeeId as string),
    enabled: Boolean(employeeId),
  });
}

function invalidateLeave(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.leave.me });
  queryClient.invalidateQueries({ queryKey: ["leave", "queue"] });
  queryClient.invalidateQueries({ queryKey: ["leave", "employee"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.employee });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.management });
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => leaveService.submit(payload),
    onSuccess: () => invalidateLeave(queryClient),
  });
}

export function useDecideLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeaveStatusPayload }) =>
      leaveService.decide(id, payload),
    onSuccess: () => invalidateLeave(queryClient),
  });
}
