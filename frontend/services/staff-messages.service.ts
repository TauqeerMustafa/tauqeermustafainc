import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  StaffMessage,
  StaffMessageCreatePayload,
  StaffMessageReplyPayload,
  StaffThread,
  StaffUnreadCount,
} from "@/types/staff-message";

export const staffMessageService = {
  /** Get current employee's thread (optionally filtered by desk channel). */
  getMyThread: (channel?: string) =>
    apiRequest<StaffMessage[]>({
      url: API_ENDPOINTS.staffMessages.myThread,
      method: "GET",
      params: channel ? { channel } : undefined,
    }),

  /** Send a message from employee to a leadership desk. */
  sendMessage: (payload: StaffMessageCreatePayload) =>
    apiRequest<StaffMessage>({
      url: API_ENDPOINTS.staffMessages.myThread,
      method: "POST",
      data: payload,
    }),

  /** List all staff conversation threads for Admin Inbox. */
  getThreads: (params?: { channel?: string; urgentOnly?: boolean; unreadOnly?: boolean }) =>
    apiRequest<StaffThread[]>({
      url: API_ENDPOINTS.staffMessages.threads,
      method: "GET",
      params: {
        channel: params?.channel || undefined,
        urgent_only: params?.urgentOnly ? "true" : undefined,
        unread_only: params?.unreadOnly ? "true" : undefined,
      },
    }),

  /** Get specific employee thread and mark inbound messages as read. */
  getThreadDetail: (userId: string) =>
    apiRequest<StaffThread>({
      url: API_ENDPOINTS.staffMessages.threadDetail(userId),
      method: "GET",
    }),

  /** Reply from leadership to a staff member. */
  replyToStaff: (userId: string, payload: StaffMessageReplyPayload) =>
    apiRequest<StaffMessage>({
      url: API_ENDPOINTS.staffMessages.reply(userId),
      method: "POST",
      data: payload,
    }),

  /** Get total unread count for badge counters. */
  getUnreadCount: () =>
    apiRequest<StaffUnreadCount>({
      url: API_ENDPOINTS.staffMessages.unreadCount,
      method: "GET",
    }),
};
