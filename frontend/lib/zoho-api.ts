import { getKV } from "@/lib/kv";

export async function getValidZohoToken() {
  const kv = getKV();
  if (!kv) throw new Error("KV not configured");
  
  const accessToken = await kv.get("zoho_access_token") as string;
  const refreshToken = await kv.get("zoho_refresh_token") as string;
  const expiresAt = await kv.get("zoho_token_expires_at") as number;

  if (!accessToken) return null;

  // If token expires within 5 minutes, refresh it
  if (Date.now() > expiresAt - 5 * 60 * 1000) {
    if (!refreshToken) return null;

    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) throw new Error("Zoho credentials missing");

    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("Zoho refresh error:", data);
      return null;
    }

    await kv.set("zoho_access_token", data.access_token);
    await kv.set("zoho_token_expires_at", Date.now() + data.expires_in * 1000);
    return data.access_token as string;
  }

  return accessToken;
}

export async function fetchZohoAccounts(token: string) {
  const res = await fetch("https://mail.zoho.com/api/accounts", {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) throw new Error(`Zoho Accounts Error: ${res.statusText}`);
  return res.json();
}

export async function fetchZohoMessages(token: string, accountId: string, folderId: string = "0", limit: number = 20) {
  // folderId 0 is usually INBOX
  const res = await fetch(`https://mail.zoho.com/api/accounts/${accountId}/messages/view?folderId=${folderId}&limit=${limit}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) throw new Error(`Zoho Messages Error: ${res.statusText}`);
  return res.json();
}

