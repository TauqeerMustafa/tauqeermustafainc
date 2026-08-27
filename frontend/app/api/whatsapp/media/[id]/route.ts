import { NextResponse } from "next/server";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "WHATSAPP_TOKEN not configured" }, { status: 500 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
  }

  try {
    // 1. Get the media URL from Meta
    const metaRes = await fetch(`/`, {
      headers: { Authorization: `Bearer ` },
    });
    
    if (!metaRes.ok) {
      return NextResponse.json({ error: "Failed to fetch media metadata from Meta" }, { status: metaRes.status });
    }

    const metaData = await metaRes.json();
    const mediaUrl = metaData.url;
    const mimeType = metaData.mime_type || "application/octet-stream";

    if (!mediaUrl) {
      return NextResponse.json({ error: "No media URL returned by Meta" }, { status: 404 });
    }

    // 2. Download the actual binary data from the media URL
    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ` },
    });

    if (!mediaRes.ok) {
      return NextResponse.json({ error: "Failed to download media bytes" }, { status: mediaRes.status });
    }

    // 3. Stream the response back to the client with the correct content type
    return new NextResponse(mediaRes.body, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    console.error("[whatsapp media] Error fetching media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
