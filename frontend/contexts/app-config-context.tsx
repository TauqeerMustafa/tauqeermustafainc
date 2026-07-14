"use client";

import { createContext, useContext, type ReactNode } from "react";

import { appConfig } from "@/config/app";

type AppConfig = typeof appConfig;

const AppConfigContext = createContext<AppConfig>(appConfig);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  return (
    <AppConfigContext.Provider value={appConfig}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
