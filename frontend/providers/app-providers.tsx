"use client";

import type { ReactNode } from "react";

import { AppConfigProvider } from "@/contexts/app-config-context";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppConfigProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </AppConfigProvider>
  );
}
