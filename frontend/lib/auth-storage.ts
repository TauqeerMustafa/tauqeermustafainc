const TOKEN_KEY = "tmi_admin_token";

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  notify();
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  notify();
}

export function subscribeToToken(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
