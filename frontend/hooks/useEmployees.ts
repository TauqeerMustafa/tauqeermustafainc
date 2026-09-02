"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { employeeService } from "@/services";
import type { CreateEmployeePayload, UpdateEmployeePayload } from "@/types";

/**
 * The employee roster. `/employees` is manager-gated, so callers that render for
 * everyone (the document vault's assignee picker, say) pass `enabled` to hold the
 * request back rather than trip a 403.
 */
export function useEmployees(enabled = true) {
  return useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: employeeService.list,
    enabled,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id ?? ""),
    queryFn: () => employeeService.detail(id as string),
    enabled: Boolean(id),
  });
}

function invalidateEmployees(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
  if (id) queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
  // Both reporting dashboards count headcount, so a roster change stales both.
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.management });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: () => invalidateEmployees(queryClient),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) =>
      employeeService.update(id, payload),
    onSuccess: (_data, variables) => invalidateEmployees(queryClient, variables.id),
  });
}

export function useSetEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      employeeService.setStatus(id, status),
    onSuccess: (_data, variables) => invalidateEmployees(queryClient, variables.id),
  });
}
