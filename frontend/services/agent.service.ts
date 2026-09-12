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
  LeadToCashCycleRequest,
  LeadToCashCycleResponse,
  PaymentGenerationRequest,
  PaymentLinkInfo,
  ProjectProvisionRequest,
  ProposalDossier,
  ProposalGenerationRequest,
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

  runLeadToCashCycle: (payload: LeadToCashCycleRequest) =>
    apiRequest<LeadToCashCycleResponse>({
      url: API_ENDPOINTS.agent.leadToCashRun,
      method: "POST",
      data: payload,
    }),

  prospectLead: (payload: LeadToCashCycleRequest) =>
    apiRequest<LeadToCashCycleResponse>({
      url: API_ENDPOINTS.agent.leadToCashProspect,
      method: "POST",
      data: payload,
    }),

  generateProposal: (payload: ProposalGenerationRequest) =>
    apiRequest<ProposalDossier>({
      url: API_ENDPOINTS.agent.leadToCashProposal,
      method: "POST",
      data: payload,
    }),

  provisionProject: (payload: ProjectProvisionRequest) =>
    apiRequest<LeadToCashCycleResponse>({
      url: API_ENDPOINTS.agent.leadToCashProvision,
      method: "POST",
      data: payload,
    }),

  generatePaymentLink: (payload: PaymentGenerationRequest) =>
    apiRequest<PaymentLinkInfo>({
      url: API_ENDPOINTS.agent.leadToCashPayment,
      method: "POST",
      data: payload,
    }),
};

