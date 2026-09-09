"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { projectService, type ProjectListParams } from "@/services/project.service";
import type {
  BulkUpdateProjectPayload,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/types/domain";

export function useAdminProjects(params?: ProjectListParams, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.admin.projects, params],
    queryFn: () => projectService.list(params),
    select: (res) => res.data,
    enabled,
  });
}

export function useAdminProject(id: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.admin.projects, id],
    queryFn: () => projectService.get(id),
    select: (res) => res.data,
    enabled: Boolean(id) && enabled,
  });
}

function invalidateProjects(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.admin.projects });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.projects });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.myProjects });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.management });
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.create(payload),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useBulkCreateProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projects: CreateProjectPayload[]) => projectService.bulkCreate(projects),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectService.update(id, payload),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useBulkDeleteProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => projectService.bulkDelete(ids),
    onSuccess: () => invalidateProjects(queryClient),
  });
}

export function useBulkUpdateProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkUpdateProjectPayload) => projectService.bulkUpdate(payload),
    onSuccess: () => invalidateProjects(queryClient),
  });
}
