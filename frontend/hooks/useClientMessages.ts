"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { clientMessageService } from "@/services";

/**
 * Staff side of the client portal's "Direct line" — see `clientMessageService`.
 *
 * Manager-gated server-side, so only mount these behind a surface an admin,
 * exec or team lead reaches; a member would get a 403.
 */
export function useClientThreads(clientId?: string) {
  return useQuery({
    queryKey: [...queryKeys.clients.threads, clientId ?? "all"],
    queryFn: () => clientMessageService.threads(clientId),
    staleTime: 30 * 1000,
  });
}

export function useReplyToClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, body }: { clientId: string; body: string }) =>
      clientMessageService.reply(clientId, body),
    onSuccess: () => {
      // Refetch rather than patch: a reply changes the thread's `awaitingReply`
      // count and its position in the queue, both computed server-side.
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.threads });
    },
  });
}
