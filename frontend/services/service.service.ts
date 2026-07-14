import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, Service } from "@/types";

export const serviceService = {
  list() {
    return apiRequest<ApiResponse<PaginatedResponse<Service>>>({
      method: "GET",
      url: API_ENDPOINTS.services,
    });
  },
  detail(slug: string) {
    return apiRequest<ApiResponse<Service>>({
      method: "GET",
      url: `${API_ENDPOINTS.services}/${slug}`,
    });
  },
};
