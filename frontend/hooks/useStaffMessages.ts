import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffMessageService } from "@/services/staff-messages.service";
import type {
  StaffMessageCreatePayload,
  StaffMessageReplyPayload,
} from "@/types/staff-message";

export function useMyStaffThread(channel?: string) {
  return useQuery({
    queryKey: ["staff-messages", "my-thread", channel],
    queryFn: () => staffMessageService.getMyThread(channel),
    refetchInterval: 3000,
  });
}

export function useSendStaffMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StaffMessageCreatePayload) =>
      staffMessageService.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-messages", "my-thread"] });
      queryClient.invalidateQueries({ queryKey: ["staff-messages", "threads"] });
      queryClient.invalidateQueries({ queryKey: ["staff-messages", "unread-count"] });
    },
  });
}

export function useStaffThreads(params?: {
  channel?: string;
  urgentOnly?: boolean;
  unreadOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["staff-messages", "threads", params?.channel, params?.urgentOnly, params?.unreadOnly],
    queryFn: () => staffMessageService.getThreads(params),
    refetchInterval: 4000,
  });
}

export function useStaffThreadDetail(userId: string | null) {
  return useQuery({
    queryKey: ["staff-messages", "thread", userId],
    queryFn: () => (userId ? staffMessageService.getThreadDetail(userId) : null),
    enabled: Boolean(userId),
    refetchInterval: 3000,
  });
}

export function useReplyToStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: StaffMessageReplyPayload;
    }) => staffMessageService.replyToStaff(userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff-messages", "thread", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["staff-messages", "threads"] });
      queryClient.invalidateQueries({ queryKey: ["staff-messages", "unread-count"] });
    },
  });
}

export function useStaffUnreadCount() {
  return useQuery({
    queryKey: ["staff-messages", "unread-count"],
    queryFn: () => staffMessageService.getUnreadCount(),
    refetchInterval: 10000,
  });
}
