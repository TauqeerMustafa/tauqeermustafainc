import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { AdminTeam, CreateTeamPayload, UpdateTeamPayload } from "@/types/domain";

export const teamService = {
  list: () =>
    apiRequest<ApiResponse<AdminTeam[]>>({
      url: API_ENDPOINTS.admin.teams,
      method: "GET",
    }),

  get: (id: string) =>
    apiRequest<ApiResponse<AdminTeam>>({
      url: `${API_ENDPOINTS.admin.teams}/${id}`,
      method: "GET",
    }),

  create: (payload: CreateTeamPayload) =>
    apiRequest<ApiResponse<AdminTeam>>({
      url: API_ENDPOINTS.admin.teams,
      method: "POST",
      data: payload,
    }),

  update: (id: string, payload: UpdateTeamPayload) =>
    apiRequest<ApiResponse<AdminTeam>>({
      url: `${API_ENDPOINTS.admin.teams}/${id}`,
      method: "PUT",
      data: payload,
    }),

  delete: (id: string) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>({
      url: `${API_ENDPOINTS.admin.teams}/${id}`,
      method: "DELETE",
    }),

  bulkDelete: (ids: string[]) =>
    apiRequest<ApiResponse<{ deletedCount: number }>>({
      url: API_ENDPOINTS.admin.teamsBulkDelete,
      method: "POST",
      data: { ids },
    }),
};
