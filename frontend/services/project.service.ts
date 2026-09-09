import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  AdminProject,
  BulkUpdateProjectPayload,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/types/domain";

export interface ProjectListParams {
  clientId?: string;
  status?: string;
  search?: string;
}

export const projectService = {
  list: (params?: ProjectListParams) =>
    apiRequest<ApiResponse<AdminProject[]>>({
      url: API_ENDPOINTS.admin.projects,
      method: "GET",
      params: {
        ...(params?.clientId ? { clientId: params.clientId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.search ? { search: params.search } : {}),
      },
    }),

  get: (id: string) =>
    apiRequest<ApiResponse<AdminProject>>({
      url: `${API_ENDPOINTS.admin.projects}/${id}`,
      method: "GET",
    }),

  create: (payload: CreateProjectPayload) =>
    apiRequest<ApiResponse<AdminProject>>({
      url: API_ENDPOINTS.admin.projects,
      method: "POST",
      data: payload,
    }),

  bulkCreate: (projects: CreateProjectPayload[]) =>
    apiRequest<ApiResponse<AdminProject[]>>({
      url: API_ENDPOINTS.admin.projectsBulk,
      method: "POST",
      data: { projects },
    }),

  update: (id: string, payload: UpdateProjectPayload) =>
    apiRequest<ApiResponse<AdminProject>>({
      url: `${API_ENDPOINTS.admin.projects}/${id}`,
      method: "PUT",
      data: payload,
    }),

  delete: (id: string) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>({
      url: `${API_ENDPOINTS.admin.projects}/${id}`,
      method: "DELETE",
    }),

  bulkDelete: (ids: string[]) =>
    apiRequest<ApiResponse<{ deletedCount: number }>>({
      url: API_ENDPOINTS.admin.projectsBulkDelete,
      method: "POST",
      data: { ids },
    }),

  bulkUpdate: (payload: BulkUpdateProjectPayload) =>
    apiRequest<ApiResponse<{ updatedCount: number }>>({
      url: API_ENDPOINTS.admin.projectsBulkUpdate,
      method: "POST",
      data: payload,
    }),
};
