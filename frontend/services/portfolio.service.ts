import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, Portfolio } from "@/types";

export const portfolioService = {
  list() {
    return apiRequest<ApiResponse<PaginatedResponse<Portfolio>>>({
      method: "GET",
      url: API_ENDPOINTS.portfolio,
    });
  },
  detail(slug: string) {
    return apiRequest<ApiResponse<Portfolio>>({
      method: "GET",
      url: `${API_ENDPOINTS.portfolio}/${slug}`,
    });
  },
};
