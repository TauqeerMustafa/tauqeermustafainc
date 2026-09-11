import { NextRequest, NextResponse } from "next/server";
import { getPaddleServerInstance } from "@/lib/paddle-server";
import { getKV } from "@/lib/kv";
import { appConfig } from "@/config/app";

const API_BASE_URL = appConfig.apiBaseUrl;

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature") || "";
  const rawBody = await request.text();
  const secret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || "";

  if (!signature || !rawBody) {
    return NextResponse.json({ error: "Missing signature or body" }, { status: 400 });
  }

  const paddle = getPaddleServerInstance();
  let eventData: unknown = null;

  try {
    if (paddle && secret && !secret.includes("YOUR_")) {
      eventData = await paddle.webhooks.unmarshal(rawBody, secret, signature);
    } else {
      // Fallback for development if secret not yet provided in sandbox
      console.warn("PADDLE_NOTIFICATION_WEBHOOK_SECRET not configured. Parsing raw JSON body in dev mode.");
      eventData = JSON.parse(rawBody);
    }
  } catch (err) {
    console.error("Paddle webhook signature verification failed:", err);
    // Return non-2xx so Paddle retries as per delivery contract
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const event = eventData as {
    eventType?: string;
    eventId?: string;
    data?: {
      id?: string;
      status?: string;
      details?: {
        totals?: {
          total?: string;
          currencyCode?: string;
        };
      };
      currencyCode?: string;
      customData?: {
        clientName?: string;
        clientEmail?: string;
        invoiceNumber?: string;
        service?: string;
      };
      customer?: {
        id?: string;
        email?: string;
        name?: string;
      };
    };
  };

  const eventType = event.eventType;
  const data = event.data;

  // Process transaction completion
  if (eventType === "transaction.completed" || eventType === "transaction.paid") {
    const txId = data?.id || `TMI-TXN-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = data?.customData?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
    const clientName = data?.customData?.clientName || data?.customer?.name || "Client";
    const clientEmail = data?.customData?.clientEmail || data?.customer?.email || "";
    const rawTotal = data?.details?.totals?.total || "0";
    const currency = data?.currencyCode || data?.details?.totals?.currencyCode || "USD";
    const amount = Number(rawTotal) > 0 ? Number(rawTotal) / 100 : 0;
    const service = data?.customData?.service || "Technical Services Settlement";

    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const receipt = {
      transactionId: txId,
      invoiceNumber,
      clientName,
      clientEmail,
      amount,
      currency,
      service,
      method: "Paddle Global Checkout (Card / Apple Pay / Google Pay / Wire)",
      status: "VERIFIED_SETTLED",
      timestamp,
      paddleTransactionId: txId,
      paddleCustomerId: data?.customer?.id,
    };

    // 1. Store in Upstash Redis KV if available
    try {
      const kv = getKV();
      if (kv) {
        await kv.set(`payment:${txId}`, JSON.stringify(receipt), { ex: 60 * 60 * 24 * 365 });
        if (invoiceNumber) {
          await kv.set(`invoice:${invoiceNumber}`, JSON.stringify(receipt), { ex: 60 * 60 * 24 * 365 });
        }
      }
    } catch (kvErr) {
      console.error("Failed to store Paddle receipt in KV:", kvErr);
    }

    // 2. Notify corporate backend
    try {
      await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          company: "Paddle Webhook Settlement",
          message: `[PADDLE SETTLEMENT CONFIRMED: ${txId}]\nAmount: ${currency} ${amount}\nInvoice: ${invoiceNumber}\nCustomer: ${clientName} (${clientEmail})`,
        }),
      });
    } catch {
      // Non-blocking
    }
  }

  // Acknowledge event with 200 OK
  return NextResponse.json({ success: true, eventId: event.eventId });
}
