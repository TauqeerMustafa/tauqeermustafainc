import axios, { type AxiosRequestConfig } from "axios";

import { appConfig } from "@/config/app";
import { normalizeApiError } from "@/utils/api-error";

type AuthTokenGetter = () => string | null;

let authTokenGetter: AuthTokenGetter | null = null;

export function setAuthTokenGetter(getter: AuthTokenGetter | null) {
  authTokenGetter = getter;
}

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authTokenGetter?.();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
);

export async function apiRequest<TData>(config: AxiosRequestConfig) {
  const response = await apiClient.request<TData>(config);
  return response.data;
}
