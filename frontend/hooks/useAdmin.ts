import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  adminService,
  type AdminUserListParams,
  type CreateAdminUserPayload,
  type CreateRolePayload,
  type UpdateAdminUserPayload,
  type UpdateRolePayload,
} from "@/services";

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

export function useAdminPermissions() {
  return useQuery({
    queryKey: queryKeys.admin.permissions,
    queryFn: adminService.permissions,
    staleTime: 10 * 60 * 1000,
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

/** A role change can widen or narrow what any signed-in user may see, so the
 *  user list goes stale alongside the role list itself. */
function invalidateRoles(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles });
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => adminService.createRole(payload),
    onSuccess: () => invalidateRoles(queryClient),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      adminService.updateRole(id, payload),
    onSuccess: () => invalidateRoles(queryClient),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteRole(id),
    onSuccess: () => invalidateRoles(queryClient),
  });
}

export function useAssignRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
      adminService.assignRolePermissions(id, permissionIds),
    onSuccess: () => invalidateRoles(queryClient),
  });
}
