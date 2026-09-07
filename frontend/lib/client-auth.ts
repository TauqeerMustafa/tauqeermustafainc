const CLIENT_TOKEN_KEY = "tmi_client_token";

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLIENT_TOKEN_KEY);
}

export function setClientToken(token: string): void {
  window.localStorage.setItem(CLIENT_TOKEN_KEY, token);
}

export function clearClientToken(): void {
  window.localStorage.removeItem(CLIENT_TOKEN_KEY);
}

export function clientApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function clientFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getClientToken();
  const response = await fetch(clientApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "The client portal request failed.");
  }
  return payload?.data ?? payload;
}
