export interface StaffMessage {
  id: string;
  userId: string;
  authorId: string;
  authorName: string;
  authorEmail?: string | null;
  isFromStaff: boolean;
  channel: string;
  body: string;
  isUrgent: boolean;
  attachmentName?: string | null;
  attachmentSize?: string | null;
  attachmentUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface StaffThread {
  userId: string;
  employeeName: string;
  employeeEmail: string;
  jobTitle?: string | null;
  departmentName?: string | null;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  awaitingReply: number;
  hasUrgent: boolean;
  channels: string[];
  messages: StaffMessage[];
}

export interface StaffMessageCreatePayload {
  channel?: string;
  body: string;
  isUrgent?: boolean;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentUrl?: string;
}

export interface StaffMessageReplyPayload {
  channel?: string;
  body: string;
  isUrgent?: boolean;
}

export interface StaffUnreadCount {
  unreadCount: number;
}
