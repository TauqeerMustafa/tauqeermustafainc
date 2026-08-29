import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: "Zoho authorization failed", detail: error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code provided" }, { status: 400 });
  }

  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  
  const redirectUri = process.env.NODE_ENV === "production"
    ? "https://www.tauqeermustafa.tech/api/auth/zoho/callback"
    : "http://localhost:3000/api/auth/zoho/callback";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Zoho credentials not configured" }, { status: 500 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json({ error: "Failed to exchange token", detail: tokenData }, { status: 400 });
    }

    // Securely store the token globally for the admin portal use
    // In a real multi-tenant app, this would be tied to the specific user's ID
    await kv.set("zoho_access_token", tokenData.access_token);
    if (tokenData.refresh_token) {
      await kv.set("zoho_refresh_token", tokenData.refresh_token);
    }
    
    // Calculate expiration timestamp
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    await kv.set("zoho_token_expires_at", expiresAt);

    // Redirect back to the admin settings or mail portal
    return NextResponse.redirect(new URL("/admin/settings?zoho=connected", request.url));
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}

