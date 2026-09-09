"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { teamService } from "@/services/team.service";
import type { CreateTeamPayload, UpdateTeamPayload } from "@/types/domain";

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.admin.teams,
    queryFn: teamService.list,
    select: (res) => res.data,
  });
}

export function useTeam(id: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.admin.teams, id],
    queryFn: () => teamService.get(id),
    select: (res) => res.data,
    enabled: Boolean(id) && enabled,
  });
}

function invalidateTeams(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.teams });
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamService.create(payload),
    onSuccess: () => invalidateTeams(queryClient),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeamPayload }) =>
      teamService.update(id, payload),
    onSuccess: () => invalidateTeams(queryClient),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: () => invalidateTeams(queryClient),
  });
}

export function useBulkDeleteTeams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => teamService.bulkDelete(ids),
    onSuccess: () => invalidateTeams(queryClient),
  });
}
