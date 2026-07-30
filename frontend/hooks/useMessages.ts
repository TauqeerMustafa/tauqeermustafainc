"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { contactService } from "@/services/contact.service";

export function useMessages(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.messages.all, params],
    queryFn: () => contactService.list(params),
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      contactService.markRead(id, isRead),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages.all }),
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages.all }),
  });
}
