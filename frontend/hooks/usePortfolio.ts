"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { portfolioService } from "@/services";

export function usePortfolio() {
  return useQuery({
    queryKey: queryKeys.portfolio.all,
    queryFn: portfolioService.list,
  });
}

export function usePortfolioProject(slug: string) {
  return useQuery({
    queryKey: queryKeys.portfolio.detail(slug),
    queryFn: () => portfolioService.detail(slug),
    enabled: Boolean(slug),
  });
}
