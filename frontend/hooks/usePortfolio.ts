"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { portfolioService, type PortfolioPayload } from "@/services/portfolio.service";

export function usePortfolio(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...queryKeys.portfolio.all, params],
    queryFn: () => portfolioService.list(params),
  });
}

export function usePortfolioProject(slug: string) {
  return useQuery({
    queryKey: queryKeys.portfolio.detail(slug),
    queryFn: () => portfolioService.detail(slug),
    enabled: Boolean(slug),
  });
}

export function useCreatePortfolioProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PortfolioPayload) => portfolioService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all }),
  });
}

export function useUpdatePortfolioProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PortfolioPayload> }) =>
      portfolioService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all }),
  });
}

export function useDeletePortfolioProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portfolioService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all }),
  });
}
