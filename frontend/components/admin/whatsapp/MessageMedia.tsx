"use client";

/**
 * Inline media for a WhatsApp message bubble.
 *
 * Media can't be pointed at `/api/whatsapp/media/<id>` directly: `proxy.ts` gates
 * every /api/whatsapp/* path behind the admin bearer token, and a browser sends
 * no headers with `<img src>` or `<audio src>`, so the element would just get a
 * 401. `useAuthedMedia` fetches the bytes with the session token and hands back a
 * blob URL instead.
 */

import { Download, FileText, Mic, Play } from "lucide-react";

import { useAuthedMedia, type WAMessage } from "@/hooks/useWhatsApp";

export type BubbleMedia = "image" | "video" | "audio" | "document" | "sticker";

/** Which media element this message needs, if any. */
export function mediaKindOf(message: WAMessage): BubbleMedia | null {
  if (!message.mediaId) return null;
  const type = message.type.toLowerCase();
  if (type === "image") return "image";
  if (type === "video") return "video";
  if (type === "audio" || type === "voice" || message.voice) return "audio";
  if (type === "sticker") return "sticker";
  if (type === "document") return "document";
  // An unexpected type that still carries media is better offered as a file
  // than dropped on the floor.
  return "document";
}

function Shell({ children, height }: { children: React.ReactNode; height: number }) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-md px-3 text-[12.5px]"
      style={{ minHeight: height, background: "rgba(11,20,26,0.05)", color: "#667781" }}
    >
      {children}
    </div>
  );
}

export function MessageMedia({
  message,
  caption,
  outbound,
}: {
  message: WAMessage;
  /** Rendered under the media when the message carries text of its own. */
  caption?: React.ReactNode;
  outbound: boolean;
}) {
  const kind = mediaKindOf(message);
  const { url, error } = useAuthedMedia(message.mediaId);

  if (!kind) return null;

  if (error) {
    return (
      <Shell height={kind === "audio" ? 44 : 96}>
        <span>{error}</span>
      </Shell>
    );
  }

  if (!url) {
    return (
      <Shell height={kind === "audio" ? 44 : 96}>
        <span className="animate-pulse">Loading…</span>
      </Shell>
    );
  }

  if (kind === "image") {
    return (
      <div className="relative">
        <a href={url} target="_blank" rel="noreferrer" title="Open full size">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={message.filename || "Photo"}
            className="max-h-[320px] w-full rounded-md object-cover"
          />
        </a>
        {caption}
      </div>
    );
  }

  if (kind === "sticker") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="Sticker" className="max-h-[140px] w-[140px] object-contain" />
    );
  }

  if (kind === "video") {
    return (
      <div className="relative">
        <video src={url} controls preload="metadata" className="max-h-[320px] w-full rounded-md" />
        {caption}
      </div>
    );
  }

  if (kind === "audio") {
    // Voice notes get the mic badge; a music/audio file gets a play glyph. The
    // native <audio> control carries the seek bar, duration and keyboard support.
    return (
      <div className="flex min-w-[210px] items-center gap-2 py-0.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: outbound ? "#00a884" : "#6b7c85" }}
        >
          {message.voice ? <Mic size={16} /> : <Play size={16} />}
        </span>
        <audio src={url} controls preload="metadata" className="h-9 max-w-[240px] flex-1" />
      </div>
    );
  }

  const name = message.filename || "Document";
  return (
    <a
      href={url}
      download={name}
      className="flex min-w-[200px] items-center gap-2.5 rounded-md px-2 py-2 transition hover:bg-black/5"
      style={{ background: "rgba(11,20,26,0.04)" }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: "#8696a0" }}
      >
        <FileText size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium" style={{ color: "#111b21" }}>
          {name}
        </span>
        <span className="block text-[11.5px]" style={{ color: "#667781" }}>
          {(message.mimeType || "file").split("/").pop()?.toUpperCase()} · tap to download
        </span>
      </span>
      <Download size={16} style={{ color: "#54656f" }} />
    </a>
  );
}
