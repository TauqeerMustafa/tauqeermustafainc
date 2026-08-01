const TOKEN_KEY = "tmi_admin_token";
const TOKEN_COOKIE = "tmi_admin_token";
const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setTokenCookie(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(
    token,
  )}; path=/; max-age=${TOKEN_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  setTokenCookie(token);
  notify();
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  clearTokenCookie();
  notify();
}

export function subscribeToToken(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}