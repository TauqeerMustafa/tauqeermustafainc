import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

/**
 * A project task as served by `/tasks`.
 *
 * The router now extends `CamelModel`, so the JSON is camelCase like the rest of
 * the API and carries the flattened `projectName` / `assignedToName` labels.
 */
export interface ProjectTask {
  id: string;
  projectId?: string | null;
  assignedToId?: string | null;
  createdById?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  projectName?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  projectId?: string;
  assignedToId?: string;
  status?: string;
  /** Only tasks past their due date and not done — powers the Delivery page. */
  overdue?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  projectId?: string | null;
  assignedToId?: string | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export const taskService = {
  list: (params: TaskListParams = {}) =>
    apiRequest<ApiResponse<PaginatedResponse<ProjectTask>>>({
      url: API_ENDPOINTS.admin.tasks,
      method: "GET",
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
        ...(params.projectId ? { projectId: params.projectId } : {}),
        ...(params.assignedToId ? { assignedToId: params.assignedToId } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.overdue ? { overdue: true } : {}),
      },
    }),
  create: (payload: CreateTaskPayload) =>
    apiRequest<ApiResponse<ProjectTask>>({
      url: API_ENDPOINTS.admin.tasks,
      method: "POST",
      data: payload,
    }),
  update: (id: string, payload: UpdateTaskPayload) =>
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
