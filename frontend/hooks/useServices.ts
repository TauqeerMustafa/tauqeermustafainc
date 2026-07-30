"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { serviceService, type ServicePayload } from "@/services/service.service";

export function useServices(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...queryKeys.services.all, params],
    queryFn: () => serviceService.list(params),
  });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(slug),
    queryFn: () => serviceService.detail(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServicePayload) => serviceService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.services.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ServicePayload> }) =>
      serviceService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.services.all }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.services.all }),
  });
}
