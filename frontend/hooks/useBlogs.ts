"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { blogService, type BlogPayload } from "@/services/blog.service";

export function useBlogs(params?: { page?: number; pageSize?: number; publishedOnly?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.blogs.all, params],
    queryFn: () => blogService.list(params),
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: () => blogService.detail(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BlogPayload) => blogService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all }),
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BlogPayload> }) =>
      blogService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all }),
  });
}
