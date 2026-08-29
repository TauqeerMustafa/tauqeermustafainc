import { NextResponse } from "next/server";
import { getValidZohoToken, fetchZohoAccounts, fetchZohoMessages } from "@/lib/zoho-api";

export async function GET() {
  try {
    const token = await getValidZohoToken();
    if (!token) {
      return NextResponse.json({ error: "Zoho not connected or token expired" }, { status: 401 });
    }

    const accountsData = await fetchZohoAccounts(token);
    if (!accountsData.data || accountsData.data.length === 0) {
      return NextResponse.json({ error: "No Zoho Mail accounts found" }, { status: 404 });
    }

    const accountId = accountsData.data[0].accountId;
    const messagesData = await fetchZohoMessages(token, accountId);

    return NextResponse.json({
      account: accountsData.data[0],
      messages: messagesData.data || [],
    });
  } catch (error: any) {
    console.error("Mail fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

