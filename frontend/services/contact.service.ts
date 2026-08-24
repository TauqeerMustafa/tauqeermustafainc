import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, Contact, RequestMeta } from "@/types";

export const contactService = {
  submit(payload: Contact) {
    return apiRequest<ApiResponse<RequestMeta>>({
      method: "POST",
      url: API_ENDPOINTS.contact,
      data: payload,
    });
  },
};
