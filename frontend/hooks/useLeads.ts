"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { leadService } from "@/services";
import type {
  CreateLeadActivityPayload,
  CreateLeadPayload,
  LeadListParams,
  UpdateLeadPayload,
} from "@/services";

/** Stable cache key for a filter set — object identity would miss every hit. */
function serialize(params: LeadListParams) {
  return JSON.stringify(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(serialize(params)),
    queryFn: () => leadService.list(params),
    select: (response) => response.data,
  });
}

export function useLeadPipeline() {
  return useQuery({
    queryKey: queryKeys.leads.pipeline,
    queryFn: leadService.pipeline,
    select: (response) => response.data,
    staleTime: 60 * 1000,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id ?? ""),
    queryFn: () => leadService.byId(id as string),
    select: (response) => response.data,
    enabled: Boolean(id),
  });
}

/** A lead write moves money between funnel stages, so the aggregate goes stale
 *  alongside every list and the record itself. */
function invalidateLeads(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.leads.pipeline });
  if (id) queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(id) });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => leadService.create(payload),
    onSuccess: () => invalidateLeads(queryClient),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeadPayload }) =>
      leadService.update(id, payload),
    onSuccess: (_result, variables) => invalidateLeads(queryClient, variables.id),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadService.remove(id),
    onSuccess: () => invalidateLeads(queryClient),
  });
}

export function useLogLeadActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateLeadActivityPayload }) =>
      leadService.addActivity(id, payload),
    onSuccess: (_result, variables) => invalidateLeads(queryClient, variables.id),
  });
}
