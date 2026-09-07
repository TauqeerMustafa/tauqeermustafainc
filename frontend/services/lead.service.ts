import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse, Lead, LeadDetail, LeadPipeline, LeadActivity } from "@/types";

export interface LeadListParams {
  status?: string;
  source?: string;
  assignedExecId?: string;
  q?: string;
  limit?: number;
}

export interface CreateLeadPayload {
  companyName: string;
  contactPerson: string;
  contactTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  source?: string;
  industry?: string | null;
  status?: string;
  estimatedValue?: number | null;
  currency?: string;
  nextFollowUpDate?: string | null;
  /** Ignored unless the caller holds team/all update scope — the API forces
   *  own-scope creators onto themselves. */
  assignedExecId?: string | null;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export interface CreateLeadActivityPayload {
  type?: string;
  body: string;
}

/**
 * Sales pipeline API. Every response is scope-filtered server-side by the
 * caller's `leads.*` permissions, so the client never has to reason about who
 * owns which record — it renders whatever came back.
 */
export const leadService = {
  list: (params: LeadListParams = {}) =>
    apiRequest<ApiResponse<Lead[]>>({ url: API_ENDPOINTS.leads.root, method: "GET", params }),
  pipeline: () =>
    apiRequest<ApiResponse<LeadPipeline>>({ url: API_ENDPOINTS.leads.pipeline, method: "GET" }),
  byId: (id: string) =>
    apiRequest<ApiResponse<LeadDetail>>({ url: API_ENDPOINTS.leads.byId(id), method: "GET" }),
  create: (payload: CreateLeadPayload) =>
    apiRequest<ApiResponse<Lead>>({ url: API_ENDPOINTS.leads.root, method: "POST", data: payload }),
  update: (id: string, payload: UpdateLeadPayload) =>
    apiRequest<ApiResponse<Lead>>({
      url: API_ENDPOINTS.leads.byId(id),
      method: "PATCH",
      data: payload,
    }),
  remove: (id: string) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>({
      url: API_ENDPOINTS.leads.byId(id),
      method: "DELETE",
    }),
  addActivity: (id: string, payload: CreateLeadActivityPayload) =>
    apiRequest<ApiResponse<LeadActivity>>({
      url: API_ENDPOINTS.leads.activities(id),
      method: "POST",
      data: payload,
    }),
};
