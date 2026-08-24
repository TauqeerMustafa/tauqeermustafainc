"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { careerService } from "@/services";

export function useCareers() {
  return useQuery({
    queryKey: queryKeys.careers.all,
    queryFn: careerService.list,
  });
}

export function useCareer(slug: string) {
  return useQuery({
    queryKey: queryKeys.careers.detail(slug),
    queryFn: () => careerService.detail(slug),
    enabled: Boolean(slug),
  });
}
