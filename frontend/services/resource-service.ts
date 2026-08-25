import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse } from "@/types";

type ListParams = {
  page?: number;
  pageSize?: number;
  publishedOnly?: boolean;
  openOnly?: boolean;
  unreadOnly?: boolean;
};

type ResourceEndpoint =
  | typeof API_ENDPOINTS.services
  | typeof API_ENDPOINTS.blogs
  | typeof API_ENDPOINTS.portfolio
  | typeof API_ENDPOINTS.careers
  | typeof API_ENDPOINTS.announcements;

export function toApiListParams(params?: ListParams) {
  if (!params) return undefined;

  return {
    page: params.page,
    page_size: params.pageSize,
    published_only: params.publishedOnly,
    open_only: params.openOnly,
    unread_only: params.unreadOnly,
  };
}

export function createResourceService<TItem, TPayload>(endpoint: ResourceEndpoint) {
  return {
    list: (params?: ListParams) =>
      apiRequest<ApiResponse<PaginatedResponse<TItem>>>({
        url: endpoint,
        method: "GET",
        params: toApiListParams(params),
      }),
    detail: (slug: string) =>
      apiRequest<ApiResponse<TItem>>({
        url: `${endpoint}/${slug}`,
        method: "GET",
      }),
    create: (payload: TPayload) =>
      apiRequest<ApiResponse<TItem>>({
        url: endpoint,
        method: "POST",
        data: payload,
      }),
    update: (id: string, payload: Partial<TPayload>) =>
      apiRequest<ApiResponse<TItem>>({
        url: `${endpoint}/${id}`,
        method: "PUT",
        data: payload,
      }),
    remove: (id: string) =>
      apiRequest<ApiResponse<{ id: string }>>({
        url: `${endpoint}/${id}`,
        method: "DELETE",
      }),
  };
}
