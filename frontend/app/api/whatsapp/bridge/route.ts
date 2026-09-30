import { NextResponse } from "next/server";
import { resolveStaffOrCustomerQuery } from "@/lib/omni-resolver";
import { appendMessage, type WAMessage } from "@/lib/wa-store";
import { sendMessage, sendButtonMessage, sendListMessage } from "@/lib/wa-flow";

/**
 * POST /api/whatsapp/bridge
 * Universal Inbound Bridge for Simple WhatsApp Business, WhatsApp Web, and Cloud API
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const from = String(body.from || body.sender || "").replace(/[^0-9]/g, "");
    const name = String(body.name || body.senderName || from || "Staff Member").trim();
    const text = String(body.text || body.message || body.body || "").trim();
    const channel = String(body.channel || body.line || "simple_business").trim();
    const shouldSendViaApi = Boolean(body.autoReply ?? true);

    if (!from || !text) {
      return NextResponse.json(
        { success: false, error: "Both 'from' (phone number) and 'text' (message content) are required." },
        { status: 400 }
      );
    }

    const msgId = `bridge_${from}_${Date.now()}`;

    // 1. Store the incoming message in unified WhatsApp store
    const storedInbound: WAMessage = {
      id: msgId,
      from,
      to: channel,
      jid: `${from}@s.whatsapp.net`,
      channel,
      department: "support",
      name,
      type: "text",
      body: text,
      timestamp: new Date().toISOString(),
      direction: "inbound",
      status: "received",
    };
    await appendMessage(storedInbound);

    // 2. Run OmniAssistant Diagnostic & Resolution Engine
    const analysis = await resolveStaffOrCustomerQuery({
      text,
      senderName: name,
      channel: "whatsapp",
      extraData: body.extraData,
    });

    let sentViaCloudApi = false;
    let apiError: string | undefined;

    // 3. If requested and Cloud API credentials exist, dispatch directly with buttons/list
    if (shouldSendViaApi && analysis.replyText) {
      try {
        if (analysis.buttons && analysis.buttons.length > 0) {
          await sendButtonMessage(from, { body: analysis.replyText, buttons: analysis.buttons }, channel);
        } else if (analysis.list) {
          await sendListMessage(
            from,
            {
              header: analysis.list.header,
              body: analysis.replyText,
              buttonText: analysis.list.buttonText,
              rows: analysis.list.rows,
            },
            channel
          );
        } else {
          await sendMessage(from, analysis.replyText, channel);
        }
        sentViaCloudApi = true;
      } catch (err: any) {
        apiError = String(err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      inboundId: msgId,
      sender: { name, phone: from },
      category: analysis.category,
      diagnosis: analysis.diagnosis,
      actionTaken: analysis.actionTaken,
      replyText: analysis.replyText,
      buttons: analysis.buttons,
      list: analysis.list,
      emailDetails: analysis.emailDetails,
      sentViaCloudApi,
      apiError,
    });
  } catch (error) {
    console.error("[whatsapp/bridge] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
