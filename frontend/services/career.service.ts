import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, Career, PaginatedResponse } from "@/types";

export const careerService = {
  list() {
    return apiRequest<ApiResponse<PaginatedResponse<Career>>>({
      method: "GET",
      url: API_ENDPOINTS.careers,
    });
  },
  detail(slug: string) {
    return apiRequest<ApiResponse<Career>>({
      method: "GET",
      url: `${API_ENDPOINTS.careers}/${slug}`,
    });
  },
};
