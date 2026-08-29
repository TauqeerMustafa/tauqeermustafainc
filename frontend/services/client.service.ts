import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export const clientService = {
  list: () =>
    apiRequest<ApiResponse<PaginatedResponse<any>>>({
      url: API_ENDPOINTS.admin.client + "/leads",
      method: "GET",
    }),
};
