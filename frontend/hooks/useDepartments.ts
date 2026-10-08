"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { departmentService } from "@/services/department.service";
import type { CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/domain";

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: departmentService.list,
    select: (res) => res.data,
  });
}

function invalidateDepartments(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.departments });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentService.create(payload),
    onSuccess: () => invalidateDepartments(queryClient),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentPayload }) =>
      departmentService.update(id, payload),
    onSuccess: () => invalidateDepartments(queryClient),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => invalidateDepartments(queryClient),
  });
}
