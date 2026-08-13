"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

import { setAuthTokenGetter } from "@/lib/api-client";
import { clearStoredToken, getStoredToken, setStoredToken, subscribeToToken } from "@/lib/auth-storage";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Register the token getter with the API client once, at module load. This is
// idempotent and safe on the server (getStoredToken returns null there), so it
// doesn't need to run inside an effect.
setAuthTokenGetter(getStoredToken);

export function AuthProvider({ children }: { children: ReactNode }) {
  // The token lives in localStorage — an external store — so we read it with
  // useSyncExternalStore rather than syncing it into state from an effect. The
  // server snapshot is null and matches the first client render, which avoids a
  // hydration mismatch and the cascading renders that setState-in-effect causes.
  const token = useSyncExternalStore(subscribeToToken, getStoredToken, () => null);

  const value: AuthContextValue = {
    token,
    isAuthenticated: Boolean(token),
    setToken: setStoredToken,
    logout: clearStoredToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
