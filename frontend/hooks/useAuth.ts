"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { authService } from "@/services";
import type { LoginCredentials } from "@/types";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginCredentials) => authService.login(payload),
  });
}

export function useCurrentUser(enabled = false) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.me,
    enabled,
  });
}
