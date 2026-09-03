/**
 * POST /api/whatsapp/upload — upload a media file to Meta and return its media
 * id. WhatsApp requires media to be either a public https link or an uploaded
 * media id; this route handles the file-upload path.
 *
 * Accepts multipart/form-data:
 *   file – the media file (required)
 *   from – Phone Number ID to upload against (optional; defaults to the primary)
 *
 * A media id belongs to the number that uploaded it. With two numbers on the
 * account, uploading against one and sending from the other fails inside Meta
 * with an unhelpful "media id not found", so the sender has to be named here as
 * well as on /send. Ids are validated against lib/wa-numbers.
 *
 * Returns: { success, id, mediaType, filename, mimeType, from }
 */
import { NextResponse } from "next/server";
import { resolveNumberId } from "@/lib/wa-numbers";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

/** Map a MIME type to the WhatsApp media category used in the send payload. */
function mediaKindFromMime(mime: string): "image" | "video" | "audio" | "document" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}

export async function POST(request: Request) {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    return NextResponse.json({ success: false, error: "WHATSAPP_TOKEN not configured" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  const requestedFrom = form.get("from") ?? form.get("phoneNumberId");
  const sender = resolveNumberId(typeof requestedFrom === "string" ? requestedFrom : null);
  if (!sender.ok) {
    return NextResponse.json(
      { success: false, error: sender.error },
      { status: typeof requestedFrom === "string" && requestedFrom ? 400 : 500 }
    );
  }
  const phoneNumberId = sender.id;

  // WhatsApp media size caps (MB): image 5, video/audio 16, document 100.
  const mime = file.type || "application/octet-stream";
  const kind = mediaKindFromMime(mime);

  const metaForm = new FormData();
  metaForm.append("messaging_product", "whatsapp");
  metaForm.append("type", mime);
  metaForm.append("file", file, file.name || "upload");

  try {
    const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: metaForm,
      cache: "no-store",
    });
    const json = await res.json();

    if (!res.ok || !json?.id) {
      return NextResponse.json(
        { success: false, error: json?.error?.message || "Upload to Meta failed", detail: json },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: json.id,
      mediaType: kind,
      filename: file.name || "file",
      mimeType: mime,
      // Echo the number the id belongs to so the send that follows uses the same one.
      from: phoneNumberId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
