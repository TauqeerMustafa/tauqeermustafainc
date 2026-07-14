import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, Blog, PaginatedResponse } from "@/types";

export const blogService = {
  list() {
    return apiRequest<ApiResponse<PaginatedResponse<Blog>>>({
      method: "GET",
      url: API_ENDPOINTS.blogs,
    });
  },
  detail(slug: string) {
    return apiRequest<ApiResponse<Blog>>({
      method: "GET",
      url: `${API_ENDPOINTS.blogs}/${slug}`,
    });
  },
};
