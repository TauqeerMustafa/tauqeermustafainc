"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { serviceService } from "@/services";

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: serviceService.list,
  });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(slug),
    queryFn: () => serviceService.detail(slug),
    enabled: Boolean(slug),
  });
}
