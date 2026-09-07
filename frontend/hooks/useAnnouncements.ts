"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { announcementService, type AnnouncementPayload } from "@/services/announcement.service";

export function useAnnouncements(params?: { page?: number; pageSize?: number; publishedOnly?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.announcements.all, params],
    queryFn: () => announcementService.list(params),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnnouncementPayload) => announcementService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all }),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AnnouncementPayload> }) =>
      announcementService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all }),
  });
}
