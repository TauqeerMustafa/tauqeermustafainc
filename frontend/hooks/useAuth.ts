"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuthContext } from "@/providers/auth-provider";
import { authService } from "@/services";
import type { UpdateProfilePayload } from "@/services/auth.service";
import type { LoginCredentials } from "@/types";

export function useLogin() {
  const { setToken } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginCredentials) => authService.login(payload),
    onSuccess: (response) => {
      setToken(response.data.accessToken);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useCurrentUser(enabled = true) {
  const { isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.me,
    enabled: enabled && isAuthenticated,
    retry: false,
  });
}

export function useLogout() {
  const { logout } = useAuthContext();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.removeQueries({ queryKey: queryKeys.auth.me });
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}
