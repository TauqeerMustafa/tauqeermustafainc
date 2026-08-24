import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, LoginCredentials, User } from "@/types";

interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  login(payload: LoginCredentials) {
    return apiRequest<ApiResponse<LoginResponse>>({
      method: "POST",
      url: API_ENDPOINTS.auth.login,
      data: payload,
    });
  },
  me() {
    return apiRequest<ApiResponse<User>>({
      method: "GET",
      url: API_ENDPOINTS.auth.me,
    });
  },
};
