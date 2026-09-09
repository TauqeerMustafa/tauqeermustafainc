import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

/**
 * A project task as served by `/tasks`.
 *
 * The router now extends `CamelModel`, so the JSON is camelCase like the rest of
 * the API and carries the flattened `projectName` / `assignedToName` labels.
 */
export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

export interface ProjectTask {
  id: string;
  projectId?: string | null;
  assignedToId?: string | null;
  assignedToIds?: string[];
  assignees?: TaskAssignee[];
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
  assignedToIds?: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface BulkTaskDeletePayload {
  ids: string[];
}

export interface BulkTaskUpdatePayload {
  ids: string[];
  status?: string;
  priority?: string;
  assignedToIds?: string[];
}

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
  mine: () =>
    apiRequest<ApiResponse<ProjectTask[]>>({
      url: `${API_ENDPOINTS.admin.tasks}/me`,
      method: "GET",
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
  bulkDelete: (payload: BulkTaskDeletePayload) =>
    apiRequest<ApiResponse<{ deletedCount: number }>>({
      url: API_ENDPOINTS.tasks.bulkDelete,
      method: "POST",
      data: payload,
    }),
  bulkUpdate: (payload: BulkTaskUpdatePayload) =>
    apiRequest<ApiResponse<{ updatedCount: number }>>({
      url: API_ENDPOINTS.tasks.bulkUpdate,
      method: "POST",
      data: payload,
    }),
  deleteAll: () =>
    apiRequest<ApiResponse<{ deleted: number }>>({
      url: `${API_ENDPOINTS.admin.tasks}/all/clear`,
      method: "DELETE",
    }),
};
