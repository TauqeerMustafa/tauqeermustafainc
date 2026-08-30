"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { dashboardService } from "@/services";

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.employee,
    queryFn: dashboardService.employee,
    staleTime: 30 * 1000,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: dashboardService.admin,
    staleTime: 30 * 1000,
  });
}

/**
 * The management portal's own dashboard. It cannot reuse `useAdminDashboard`:
 * `/dashboard/admin` is admin-gated because it returns the audit trail, so the
 * exec and team-lead users who live in this portal would get a 403.
 */
export function useManagementDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.management,
    queryFn: dashboardService.management,
    staleTime: 30 * 1000,
  });
}

/** Full project book for the Delivery page — see `/dashboard/projects`. */
export function useManagementProjects() {
  return useQuery({
    queryKey: queryKeys.dashboard.projects,
    queryFn: dashboardService.projects,
    staleTime: 30 * 1000,
  });
}
