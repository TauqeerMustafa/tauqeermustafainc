import { AxiosError } from "axios";

import type { ApiError } from "@/types";

/**
 * A real `Error` subclass that also carries the structured `ApiError` fields.
 *
 * The response interceptor in `lib/api-client.ts` rejects every failed request
 * with this. Returning a plain object (the previous behaviour) meant
 * `error instanceof Error` was always `false`, so every screen that renders
 * `error instanceof Error ? error.message : "…fallback…"` showed its generic
 * fallback and never the real cause — which is exactly why a backend 500 on
 * `/dashboard/admin` surfaced only as "Could not load the dashboard."
 *
 * It still satisfies the `ApiError` interface (`message`/`status`/`code`/
 * `details`), so the two `as ApiError` consumers — `providers/query-provider`
 * and `components/auth/LoginForm` — keep reading `.status`/`.message` unchanged.
 */
export class ApiRequestError extends Error implements ApiError {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export function normalizeApiError(error: unknown): ApiRequestError {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as
      | { message?: string; detail?: string; code?: string }
      | undefined;

    return new ApiRequestError(
      responseData?.message ??
        responseData?.detail ??
        error.message ??
        "Request failed",
      {
        status: error.response?.status,
        code: responseData?.code ?? error.code,
        details: error.response?.data,
      },
    );
  }

  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError("Unexpected request error", { details: error });
}
