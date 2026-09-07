import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, Contact, ContactMessage, PaginatedResponse } from "@/types";

import { toApiListParams } from "./resource-service";

export const contactService = {
  submit: (payload: Contact) =>
    apiRequest<ApiResponse<{ requestId: string }>>({
      url: API_ENDPOINTS.contact,
      method: "POST",
      data: payload,
    }),
  list: (params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) =>
    apiRequest<ApiResponse<PaginatedResponse<ContactMessage>>>({
      url: API_ENDPOINTS.contact,
      method: "GET",
      params: toApiListParams(params),
    }),
  markRead: (id: string, isRead: boolean) =>
    apiRequest<ApiResponse<ContactMessage>>({
      url: `${API_ENDPOINTS.contact}/${id}`,
      method: "PUT",
      data: { isRead },
    }),
  remove: (id: string) =>
    apiRequest<ApiResponse<{ id: string }>>({
      url: `${API_ENDPOINTS.contact}/${id}`,
      method: "DELETE",
    }),
};
