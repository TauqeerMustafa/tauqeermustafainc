"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { setAuthTokenGetter } from "@/lib/api-client";
import { clearStoredToken, getStoredToken, setStoredToken, subscribeToToken } from "@/lib/auth-storage";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    setAuthTokenGetter(getStoredToken);

    const unsubscribe = subscribeToToken(() => setTokenState(getStoredToken()));
    return () => {
      unsubscribe();
      setAuthTokenGetter(null);
    };
  }, []);

  const value: AuthContextValue = {
    token,
    isAuthenticated: Boolean(token),
    setToken: setStoredToken,
    logout: () => {
      clearStoredToken();
    },
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