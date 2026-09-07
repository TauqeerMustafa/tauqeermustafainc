"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { careerService, type CareerPayload } from "@/services/career.service";

export function useCareers(params?: { page?: number; pageSize?: number; openOnly?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.careers.all, params],
    queryFn: () => careerService.list(params),
  });
}

export function useCareer(slug: string) {
  return useQuery({
    queryKey: queryKeys.careers.detail(slug),
    queryFn: () => careerService.detail(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateCareer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CareerPayload) => careerService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.careers.all }),
  });
}

export function useUpdateCareer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CareerPayload> }) =>
      careerService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.careers.all }),
  });
}

export function useDeleteCareer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => careerService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.careers.all }),
  });
}
