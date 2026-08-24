import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { adminService, type AdminUserListParams, type CreateAdminUserPayload, type UpdateAdminUserPayload } from "@/services";

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin.users, params],
    queryFn: () => adminService.users(params),
  });
}

export function useAdminRoles() {
  return useQuery({
    queryKey: queryKeys.admin.roles,
    queryFn: adminService.roles,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTeams() {
  return useQuery({
    queryKey: queryKeys.admin.teams,
    queryFn: adminService.teams,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: queryKeys.admin.metrics,
    queryFn: adminService.metrics,
    staleTime: 30 * 1000,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => adminService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.metrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.teams });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminUserPayload }) =>
      adminService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.metrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.teams });
    },
  });
}
