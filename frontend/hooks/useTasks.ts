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
 * the management Delivery page as well as the admin board. Unwraps the
 * `ApiResponse<PaginatedResult>` envelope to the page's items + pagination.
 */
export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(serialize(params)),
    queryFn: () => taskService.list(params),
    select: (response) => response.data,
  });
}
