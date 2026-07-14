import { AxiosError } from "axios";

import type { ApiError } from "@/types";

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as
      | { message?: string; detail?: string; code?: string }
      | undefined;

    return {
      message:
        responseData?.message ??
        responseData?.detail ??
        error.message ??
        "Request failed",
      status: error.response?.status,
      code: responseData?.code ?? error.code,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Unexpected request error",
    details: error,
  };
}
