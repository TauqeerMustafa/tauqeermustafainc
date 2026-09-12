import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  AgentActionRequest,
  AgentActionResponse,
  AgentChatRequest,
  AgentChatResponse,
  CompanyAuditRunResponse,
  CompanyPulseMetrics,
  ExecutiveBriefing,
} from "@/types";

export const agentService = {
  getPulse: () =>
    apiRequest<CompanyPulseMetrics>({
      url: API_ENDPOINTS.agent.pulse,
      method: "GET",
    }),

  getBriefing: () =>
    apiRequest<ExecutiveBriefing>({
      url: API_ENDPOINTS.agent.briefing,
      method: "GET",
    }),

  runAudit: () =>
    apiRequest<CompanyAuditRunResponse>({
      url: API_ENDPOINTS.agent.runAudit,
      method: "POST",
    }),

  chat: (payload: AgentChatRequest) =>
    apiRequest<AgentChatResponse>({
      url: API_ENDPOINTS.agent.chat,
      method: "POST",
      data: payload,
    }),

  executeAction: (payload: AgentActionRequest) =>
    apiRequest<AgentActionResponse>({
      url: API_ENDPOINTS.agent.action,
      method: "POST",
      data: payload,
    }),
};
