import { NextResponse } from "next/server";
import { assertMailboxAccess, mailErrorStatus, resolveMailUser } from "@/lib/mail-auth";
import { fetchOpenEmailAttachmentPart } from "@/lib/openemail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mailbox = searchParams.get("mailbox") || searchParams.get("accountId");
    const messageId = searchParams.get("id") || searchParams.get("messageId");
    const section = searchParams.get("section") || searchParams.get("part") || "2";
    const inline = searchParams.get("inline") === "true";
    const requestedName = searchParams.get("filename") || "";

    if (!mailbox || !messageId) {
      return NextResponse.json(
        { error: "Missing required parameters: mailbox and id are required" },
        { status: 400 },
      );
    }

    const user = await resolveMailUser(request);
    await assertMailboxAccess(user, mailbox);

    const { buffer, contentType, filename: upstreamFilename } =
      await fetchOpenEmailAttachmentPart(mailbox, messageId, section);

    const safeFilename = requestedName || upstreamFilename || `attachment-${section}`;
    const dispositionType = inline ? "inline" : "attachment";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": `${dispositionType}; filename="${safeFilename}"`,
        "Cache-Control": "private, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: mailErrorStatus(error) },
    );
  }
}
