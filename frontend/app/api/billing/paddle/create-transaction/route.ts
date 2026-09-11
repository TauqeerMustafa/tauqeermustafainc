import { NextResponse } from "next/server";
import { createPaddleTransaction, isPaddleServerConfigured } from "@/lib/paddle-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      amount,
      currency = "USD",
      service = "Technical Services Deposit",
      invoiceNumber,
      projectRef,
    } = body;

    if (!clientName || !clientEmail || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid client name, email, and amount are required." },
        { status: 400 }
      );
    }

    if (!isPaddleServerConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "Paddle API key (PADDLE_API_KEY) is not yet configured in server environment.",
        },
        { status: 503 }
      );
    }

    const transaction = await createPaddleTransaction({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      amount: Number(amount),
      currency: String(currency).toUpperCase(),
      service: String(service).trim(),
      invoiceNumber: invoiceNumber ? String(invoiceNumber).trim() : undefined,
      projectRef: projectRef ? String(projectRef).trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      transaction,
    });
  } catch (error) {
    console.error("Error creating Paddle transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create Paddle transaction",
      },
      { status: 500 }
    );
  }
}
