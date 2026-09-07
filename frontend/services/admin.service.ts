import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  AdminMetrics,
  AdminPermission,
  AdminRole,
  AdminTeam,
  AdminUser,
  UserStatus,
} from "@/types";

export interface AdminUserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UserStatus | "all";
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleSlug: string;
  teamId?: string;
  status: UserStatus;
  /** Mail the credentials out now — the only moment the API still has them in
   *  plaintext, since it hashes the password before returning. */
  sendWelcomeEmail?: boolean;
  /** Personal address to deliver to; the company mailbox these credentials
   *  unlock cannot be read until after the first sign-in. */
  welcomeEmailTo?: string;
}

export interface UpdateAdminUserPayload {
  roleSlug?: string;
  teamId?: string | null;
  status?: UserStatus;
}

export interface CreateRolePayload {
  slug: string;
  name: string;
  hierarchyLevel: number;
  description?: string | null;
}

/** PATCH /admin/roles/{id} cannot move a slug — it is the RBAC join key. */
export interface UpdateRolePayload {
  name?: string;
  hierarchyLevel?: number;
  description?: string | null;
}

export const adminService = {
  users: (params: AdminUserListParams = {}) =>
    apiRequest<ApiResponse<PaginatedResponse<AdminUser>>>({
      url: API_ENDPOINTS.admin.users,
      method: "GET",
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status && params.status !== "all" ? { status: params.status } : {}),
      },
    }),
  createUser: (payload: CreateAdminUserPayload) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: API_ENDPOINTS.admin.users,
      method: "POST",
      data: payload,
    }),
  updateUser: (id: string, payload: UpdateAdminUserPayload) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: `${API_ENDPOINTS.admin.users}/${id}`,
      method: "PATCH",
      data: payload,
    }),
  deleteUser: (id: string) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>({
      url: `${API_ENDPOINTS.admin.users}/${id}`,
      method: "DELETE",
    }),
  /** Create (or link an existing) open.email mailbox for one user. */
  provisionMailbox: (id: string) =>
    apiRequest<ApiResponse<AdminUser>>({
      url: `${API_ENDPOINTS.admin.users}/${id}/provision-mailbox`,
      method: "POST",
    }),
  /** Backfill mailboxes for every user that has none. */
  provisionAllMailboxes: () =>
    apiRequest<ApiResponse<{ total: number; provisioned: number; failed: number }>>({
      url: `${API_ENDPOINTS.admin.users}/provision-mailboxes`,
      method: "POST",
    }),
  roles: () =>
    apiRequest<ApiResponse<AdminRole[]>>({
      url: API_ENDPOINTS.admin.roles,
      method: "GET",
    }),
  permissions: () =>
    apiRequest<ApiResponse<AdminPermission[]>>({
      url: API_ENDPOINTS.admin.permissions,
      method: "GET",
    }),
  createRole: (payload: CreateRolePayload) =>
    apiRequest<ApiResponse<AdminRole>>({
      url: API_ENDPOINTS.admin.roles,
      method: "POST",
      data: payload,
    }),
  updateRole: (id: string, payload: UpdateRolePayload) =>
    apiRequest<ApiResponse<AdminRole>>({
      url: `${API_ENDPOINTS.admin.roles}/${id}`,
      method: "PATCH",
      data: payload,
    }),
  deleteRole: (id: string) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>({
      url: `${API_ENDPOINTS.admin.roles}/${id}`,
      method: "DELETE",
    }),
  assignRolePermissions: (id: string, permissionIds: string[]) =>
    apiRequest<ApiResponse<AdminRole>>({
      url: `${API_ENDPOINTS.admin.roles}/${id}/permissions`,
      method: "POST",
      data: { permissionIds },
    }),
  teams: () =>
    apiRequest<ApiResponse<AdminTeam[]>>({
      url: API_ENDPOINTS.admin.teams,
      method: "GET",
    }),
  metrics: () =>
    apiRequest<ApiResponse<AdminMetrics>>({
      url: API_ENDPOINTS.admin.metrics,
      method: "GET",
    }),
};
