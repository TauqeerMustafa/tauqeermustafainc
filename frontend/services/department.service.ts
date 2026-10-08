import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/domain";

export const departmentService = {
  list: () =>
    apiRequest<ApiResponse<Department[]>>({
      url: API_ENDPOINTS.departments.list,
      method: "GET",
    }),

  create: (payload: CreateDepartmentPayload) =>
    apiRequest<ApiResponse<Department>>({
      url: API_ENDPOINTS.departments.create,
      method: "POST",
      data: payload,
    }),

  update: (id: string, payload: UpdateDepartmentPayload) =>
    apiRequest<ApiResponse<Department>>({
      url: API_ENDPOINTS.departments.detail(id),
      method: "PATCH",
      data: payload,
    }),

  delete: (id: string) =>
    apiRequest<ApiResponse<{ id: string }>>({
      url: API_ENDPOINTS.departments.detail(id),
      method: "DELETE",
    }),
};
