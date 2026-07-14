"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { blogService } from "@/services";

export function useBlogs() {
  return useQuery({
    queryKey: queryKeys.blogs.all,
    queryFn: blogService.list,
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: () => blogService.detail(slug),
    enabled: Boolean(slug),
  });
}
