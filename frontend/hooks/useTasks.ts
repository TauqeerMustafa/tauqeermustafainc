"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { taskService, type TaskListParams } from "@/services";

/** Stable cache key for a filter set — object identity would miss every hit. */
function serialize(params: TaskListParams) {
  return JSON.stringify(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "" && value !== false)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

/**
 * Paginated project tasks. `/tasks` is manager-gated for reads, so this powers
 * the management Delivery page and the admin board. Unwraps the
 * `ApiResponse<PaginatedResult>` envelope to the page's items + pagination.
 *
 * `enabled` lets a caller hold the request back — the shared task board disables
 * it for non-admins so a member never trips the 403 on the manager-only list.
 */
export function useTasks(params: TaskListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.list(serialize(params)),
    queryFn: () => taskService.list(params),
    select: (response) => response.data,
    enabled,
  });
}

/**
 * The signed-in user's own assigned tasks via `/tasks/me`, which any
 * authenticated user may read. Powers the employee portal's task board.
 */
export function useMyTasks(enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.mine,
    queryFn: taskService.mine,
    select: (response) => response.data,
    enabled,
  });
}
