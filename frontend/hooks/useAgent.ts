"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { agentService } from "@/services/agent.service";
import type {
  AgentActionRequest,
  AgentChatRequest,
} from "@/types";

export function useAgentPulse(options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.agent.pulse,
    queryFn: agentService.getPulse,
    staleTime: 15 * 1000,
    refetchInterval: options.refetchInterval ?? 30 * 1000,
  });
}

export function useAgentBriefing() {
  return useQuery({
    queryKey: queryKeys.agent.briefing,
    queryFn: agentService.getBriefing,
    staleTime: 60 * 1000,
  });
}

export function useRunAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentService.runAudit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.pulse });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.briefing });
    },
  });
}

export function useAgentChat() {
  return useMutation({
    mutationFn: (payload: AgentChatRequest) => agentService.chat(payload),
  });
}

export function useExecuteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AgentActionRequest) => agentService.executeAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.pulse });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.briefing });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.management });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useRunLeadToCashCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentService.runLeadToCashCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.pulse });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.briefing });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.pipeline });
    },
  });
}

export function useProspectLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentService.prospectLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.pulse });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.pipeline });
    },
  });
}

export function useGenerateProposal() {
  return useMutation({
    mutationFn: agentService.generateProposal,
  });
}

export function useProvisionProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentService.provisionProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.pipeline });
    },
  });
}

export function useGeneratePaymentLink() {
  return useMutation({
    mutationFn: agentService.generatePaymentLink,
  });
}

