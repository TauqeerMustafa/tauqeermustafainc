import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface ProjectTask {
  id: string;
  project_id?: string;
  assigned_to_id?: string;
  created_by_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  project_id?: string;
  assigned_to_id?: string;
  status?: string;
}

export const taskService = {
  list: (params: TaskListParams = {}) =>
    apiRequest<ApiResponse<PaginatedResponse<ProjectTask>>>({
      url: API_ENDPOINTS.admin.tasks,
      method: "GET",
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 50,
        ...(params.project_id ? { project_id: params.project_id } : {}),
        ...(params.assigned_to_id ? { assigned_to_id: params.assigned_to_id } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    }),
  create: (payload: any) =>
    apiRequest<ApiResponse<ProjectTask>>({
      url: API_ENDPOINTS.admin.tasks,
      method: "POST",
      data: payload,
    }),
  update: (id: string, payload: any) =>
    apiRequest<ApiResponse<ProjectTask>>({
      url: `${API_ENDPOINTS.admin.tasks}/${id}`,
      method: "PUT",
      data: payload,
    }),
  delete: (id: string) =>
    apiRequest<ApiResponse<{ id: string }>>({
      url: `${API_ENDPOINTS.admin.tasks}/${id}`,
      method: "DELETE",
    }),
};
