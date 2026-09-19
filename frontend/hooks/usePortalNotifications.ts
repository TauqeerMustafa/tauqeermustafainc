"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import { queryKeys } from "@/constants/query-keys";
import { contactService, dashboardService, staffMessageService } from "@/services";
import { PORTAL, type PortalId } from "@/lib/rbac";

/**
 * A single, honestly-derived portal notification.
 *
 * There is no notifications backend, so nothing here is fabricated: every item
 * is composed from a live data hook with a real title, a real destination, and
 * (where a source timestamp exists) a real time. The header overlays read /
 * dismissed state on top of these by `id`.
 */
export type PortalNotification = {
  /**
   * Stable id for client-side read/dismiss state. Count-bearing items fold the
   * count into the id (`contact-unread-3`) so that when the count changes the
   * item reads as genuinely new rather than staying dismissed forever.
   */
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** ISO timestamp when the source has one, else null (→ no relative time). */
  createdAt: string | null;
};

const LEAVE_CAP = 5;
const ANNOUNCE_CAP = 4;
const TASK_CAP = 5;

const TASK_STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "In review",
  done: "Done",
};

function shortDate(value: string | null | undefined): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function leaveDescription(leaveType: string | null, start: string | null, end: string | null): string {
  const range = start && end ? `${shortDate(start)} – ${shortDate(end)}` : "";
  const parts = [leaveType, range].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Awaiting your approval";
}

function taskDescription(status: string, dueDate: string | null | undefined): string {
  if (dueDate) {
    const due = shortDate(dueDate);
    if (due) return `Due ${due}`;
  }
  return TASK_STATUS_LABEL[status] ?? "Assigned to you";
}

/**
 * The header mounts on every portal, so admin-only reads (the admin dashboard,
 * the contact inbox, staff-message counts) must not fire for a member, exec, or
 * client — they would 403. Each source is declared unconditionally (hook rules)
 * but gated with react-query's `enabled` keyed off `portal`, the same pattern
 * `useMyProjects`/`useManagementProjects` use in useDashboard. Query keys mirror
 * the real hooks so the cache is shared and no request is duplicated.
 *
 * Management and client portals return an empty feed on purpose: management has
 * no announcements destination yet and clients have no internal feed, so an
 * honest "all caught up" beats a link that goes nowhere. (Roadmap: extend once
 * those routes exist.)
 */
export function usePortalNotifications(portal: PortalId): PortalNotification[] {
  const isAdmin = portal === PORTAL.ADMIN;
  const isEmployees = portal === PORTAL.EMPLOYEES;

  const adminDash = useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: dashboardService.admin,
    enabled: isAdmin,
    staleTime: 30_000,
  });

  const unreadContact = useQuery({
    queryKey: [...queryKeys.messages.all, { unreadOnly: true }],
    queryFn: () => contactService.list({ unreadOnly: true }),
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const staffUnread = useQuery({
    queryKey: ["staff-messages", "unread-count"],
    queryFn: () => staffMessageService.getUnreadCount(),
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const employeeDash = useQuery({
    queryKey: queryKeys.dashboard.employee,
    queryFn: dashboardService.employee,
    enabled: isEmployees,
    staleTime: 30_000,
  });

  const rawAdmin = adminDash.data as any;
  const rawEmployee = employeeDash.data as any;
  const adminData = rawAdmin?.data ?? rawAdmin;
  const employeeData = rawEmployee?.data ?? rawEmployee;
  const contactTotal = unreadContact.data?.data?.pagination?.total ?? (unreadContact.data as any)?.pagination?.total ?? 0;
  const staffTotal = (staffUnread.data as any)?.unreadCount ?? (staffUnread.data as any)?.unread_count ?? (staffUnread.data as any)?.data?.unreadCount ?? 0;

  return useMemo(() => {
    const items: PortalNotification[] = [];

    if (isAdmin && adminData) {
      const pendingList = Array.isArray(adminData.pendingLeave)
        ? adminData.pendingLeave
        : Array.isArray(adminData.pending_leave)
        ? adminData.pending_leave
        : [];
      for (const leave of pendingList.slice(0, LEAVE_CAP)) {
        if (!leave) continue;
        items.push({
          id: `leave-${leave.id ?? Math.random()}`,
          title: `Leave · ${leave.employee ?? "Staff"}`,
          description: leaveDescription(leave.leaveType ?? leave.leave_type ?? null, leave.startDate ?? leave.start_date ?? null, leave.endDate ?? leave.end_date ?? null),
          href: "/admin/leave",
          icon: CalendarDays,
          createdAt: null,
        });
      }

      if (contactTotal > 0) {
        items.push({
          id: `contact-unread-${contactTotal}`,
          title: `${contactTotal} unread ${contactTotal === 1 ? "message" : "messages"}`,
          description: "New enquiries in Contact Messages",
          href: "/admin/messages",
          icon: MessagesSquare,
          createdAt: null,
        });
      }

      if (staffTotal > 0) {
        items.push({
          id: `staff-unread-${staffTotal}`,
          title: `${staffTotal} unread staff ${staffTotal === 1 ? "message" : "messages"}`,
          description: "Replies waiting in Staff Messages",
          href: "/admin/staff-messages",
          icon: MessageSquare,
          createdAt: null,
        });
      }

      const announcementsList = Array.isArray(adminData.announcements) ? adminData.announcements : [];
      for (const ann of announcementsList.slice(0, ANNOUNCE_CAP)) {
        if (!ann) continue;
        items.push({
          id: `ann-${ann.id ?? Math.random()}`,
          title: ann.title ?? "Announcement",
          description: "Company announcement",
          href: "/admin/announcements",
          icon: Bell,
          createdAt: ann.publishedAt ?? ann.published_at ?? null,
        });
      }
    }

    if (isEmployees && employeeData) {
      const pendingLeave = employeeData?.leave?.pendingCount ?? employeeData?.leave?.pending_count ?? 0;
      if (pendingLeave > 0) {
        items.push({
          id: `myleave-${pendingLeave}`,
          title: `${pendingLeave} leave ${pendingLeave === 1 ? "request" : "requests"} pending`,
          description: "Awaiting a manager decision",
          href: "/employees/leave",
          icon: CalendarDays,
          createdAt: null,
        });
      }

      const taskList = Array.isArray(employeeData.tasks) ? employeeData.tasks : [];
      const openTasks = taskList.filter((task: any) => task && task.status !== "done").slice(0, TASK_CAP);
      for (const task of openTasks) {
        items.push({
          id: `task-${task.id ?? Math.random()}`,
          title: task.title ?? "Task",
          description: taskDescription(task.status ?? "todo", task.dueDate ?? task.due_date ?? null),
          href: "/employees/tasks",
          icon: CheckSquare,
          createdAt: null,
        });
      }

      const empAnnouncements = Array.isArray(employeeData.announcements) ? employeeData.announcements : [];
      for (const ann of empAnnouncements.slice(0, ANNOUNCE_CAP)) {
        if (!ann) continue;
        items.push({
          id: `ann-${ann.id ?? Math.random()}`,
          title: ann.title ?? "Announcement",
          description: "Company announcement",
          href: "/employees/announcements",
          icon: Bell,
          createdAt: ann.publishedAt ?? ann.published_at ?? null,
        });
      }
    }

    return items;
  }, [isAdmin, isEmployees, adminData, employeeData, contactTotal, staffTotal]);
}
