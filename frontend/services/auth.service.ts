import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, LoginCredentials, User } from "@/types";

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  title?: string;
  skills?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  emergencyContact?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const authService = {
  login: (payload: LoginCredentials) =>
    apiRequest<ApiResponse<LoginResponse>>({
      url: API_ENDPOINTS.auth.login,
      method: "POST",
      data: payload,
    }),
  me: () =>
    apiRequest<ApiResponse<User>>({
      url: API_ENDPOINTS.auth.me,
      method: "GET",
    }),
  updateProfile: (payload: UpdateProfilePayload) =>
    apiRequest<ApiResponse<User>>({
      url: API_ENDPOINTS.auth.me,
      method: "PUT",
      data: payload,
    }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<ApiResponse<User>>({
      url: `${API_ENDPOINTS.auth.me}/avatar`,
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
