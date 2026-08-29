import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.ZOHO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "ZOHO_CLIENT_ID missing" }, { status: 500 });
  }

  // Use the production URL if available, otherwise fallback to localhost for dev
  const redirectUri = process.env.NEXT_PUBLIC_SITE_URL 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/zoho/callback`
    : "http://localhost:3000/api/auth/zoho/callback";

  // Scopes needed for Zoho Mail
  // ZohoMail.messages.READ allows reading emails
  // ZohoMail.messages.CREATE allows sending emails
  // VirtualOffice.profile.READ for user info
  const scope = "ZohoMail.messages.ALL,ZohoMail.accounts.READ";

  const zohoAuthUrl = new URL("https://accounts.zoho.com/oauth/v2/auth");
  zohoAuthUrl.searchParams.set("response_type", "code");
  zohoAuthUrl.searchParams.set("client_id", clientId);
  zohoAuthUrl.searchParams.set("scope", scope);
  zohoAuthUrl.searchParams.set("redirect_uri", redirectUri);
  zohoAuthUrl.searchParams.set("access_type", "offline");
  zohoAuthUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(zohoAuthUrl.toString());
}


