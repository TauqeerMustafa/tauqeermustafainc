import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.ZOHO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "ZOHO_CLIENT_ID missing" }, { status: 500 });
  }

  // Use the production URL if available, otherwise fallback to localhost for dev
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  const redirectUri = `${protocol}://${host}/api/auth/zoho/callback`;

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




