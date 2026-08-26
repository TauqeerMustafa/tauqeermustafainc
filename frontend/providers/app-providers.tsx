"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

import { AppConfigProvider } from "@/contexts/app-config-context";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppConfigProvider>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </AppConfigProvider>
    </ThemeProvider>
  );
}
