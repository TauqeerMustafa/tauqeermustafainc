/**
 * Server-side helper to validate Bearer tokens against the backend /auth/me endpoint.
 * Provides unified identity and authorization checking across API route handlers.
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export async function resolveAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  const token = match?.[1]?.trim();
  if (!token) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = await res.json().catch(() => null);
    const data = body?.data ?? body ?? {};
    const email = String(data.email ?? "").toLowerCase();
    const role = String(data.role ?? "").toLowerCase();
    const id = String(data.id ?? "");

    if (!email) return null;
    return {
      id,
      email,
      role,
      isAdmin: role === "admin" || Boolean(data.is_superuser),
    };
  } catch {
    return null;
  }
}
