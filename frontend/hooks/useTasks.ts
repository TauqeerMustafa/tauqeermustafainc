"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  taskService,
  type CreateTaskPayload,
  type TaskListParams,
  type UpdateTaskPayload,
} from "@/services";

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

/**
 * Every board and dashboard a task appears on. `tasks.list` is keyed by filter
 * set, so the whole `["tasks", "list"]` prefix has to go — a new task may belong
 * to any of the cached filter combinations.
 */
function invalidateTasks(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.employee });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.management });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.projects });
}

/** Writes to `/tasks` are admin-only, so these are for the admin board. */
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: () => invalidateTasks(queryClient),
  });
}

/**
 * Create many tasks in one action — a playbook handed to a whole intake.
 *
 * Sequential because the API takes one task per request, and a stop halfway has
 * to leave a visible partial set rather than an unknown one. Nothing is thrown
 * for a single failure: `onResult` reports each request as it lands, so the
 * caller can show which person is done and which one needs a retry, and the run
 * always reaches the end of the list.
 *
 * The cache is invalidated once, after the last request, rather than per task
 * the way `useCreateTask` does it — a thirteen-card playbook across ten people is
 * a hundred and thirty requests, and five invalidated query trees on each would
 * refetch the board the admin is watching a hundred and thirty times over.
 */
export function useCreateTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payloads,
      onResult,
    }: {
      payloads: CreateTaskPayload[];
      onResult?: (index: number, error?: Error) => void;
    }) => {
      let created = 0;
      for (const [index, payload] of payloads.entries()) {
        try {
          await taskService.create(payload);
          created += 1;
          onResult?.(index);
        } catch (error) {
          onResult?.(
            index,
            error instanceof Error ? error : new Error("Could not create this task."),
          );
        }
      }
      return created;
    },
    // Rows exist even when the run ends badly, so the refetch cannot hang off
    // success.
    onSettled: () => invalidateTasks(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      taskService.update(id, payload),
    onSuccess: () => invalidateTasks(queryClient),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => invalidateTasks(queryClient),
  });
}
