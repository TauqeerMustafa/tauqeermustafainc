/**
 * React hooks for WhatsApp Business (Meta Cloud API).
 * All calls go through the Next.js /api/whatsapp/* proxy routes.
 */

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getStoredToken } from "@/lib/auth-storage";

const API_BASE = "/api/whatsapp";

/**
 * Every /api/whatsapp/* route is gated by the proxy (see frontend/proxy.ts),
 * so all calls must carry the admin's bearer token. Read it per-request so we
 * stay current across login/logout without re-rendering.
 */
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = { ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function getJSON(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

// ── Types ────────────────────────────────────────────────────────────────────

export type WAMessage = {
  id: string;
  from: string;
  to: string;
  jid?: string;
  name?: string;
  type: string;
  body: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  status?: string;
  /** Meta media reference for non-text messages (image, video, audio, doc, sticker). */
  mediaId?: string;
  mimeType?: string;
  filename?: string;
  /** Voice notes are audio recorded in-app or sent with `voice: true`. */
  voice?: boolean;
  /** Id of the message this one replies to (Meta `context.id`). */
  replyTo?: string;
  /** For type "reaction": the message the emoji was applied to. */
  reactionTo?: string;
};

export type AutoReplyRule = {
  id: string;
  keyword: string;
  mode: "contains" | "equals" | "starts" | "regex" | (string & {});
  reply: string;
  enabled: boolean;
};

export type WATemplate = { name: string; text: string };

export type MetaTemplate = {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION" | (string & {});
  language: string;
  header?: string;
  body: string;
  bodyExample?: string[];
  footer?: string;
  buttons?: string[];
  status: string; // APPROVED | PENDING | REJECTED | NOT_SUBMITTED | ...
  source?: "predefined" | "meta"; // "meta" = pulled in automatically from Meta
};

export type MediaKind = "image" | "video" | "audio" | "document" | "sticker";

// ── Messages ─────────────────────────────────────────────────────────────────

export function useWhatsAppMessages() {
  return useQuery<{ success: boolean; data: WAMessage[]; count: number }>({
    queryKey: ["whatsapp-messages"],
    queryFn: () => getJSON("/messages"),
    refetchInterval: 5000,
  });
}

type SendMessagePayload = {
  type: "text" | "media" | "buttons" | "template" | "meta_template" | "reaction";
  to: string;
  message?: string;
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  buttons?: string[];
  template?: string;
  templateText?: string;
  metaTemplateName?: string;
  templateVars?: string[];
  templateLanguage?: string;
  // media
  mediaType?: MediaKind;
  mediaId?: string;
  mediaLink?: string;
  caption?: string;
  filename?: string;
  /** Marks an audio upload as a voice note rather than a music file. */
  voice?: boolean;
  markReadMessageId?: string;
  /** Post as a threaded reply to this Meta message id. */
  replyTo?: string;
  // reaction
  emoji?: string;
  reactionTo?: string;
};

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(`Server error: ${text.substring(0, 200)}`);
      }
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to send message");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] }),
  });
}

// ── Media upload (returns a Meta media id to send with type: "media") ─────────

export type UploadedMedia = {
  success: boolean;
  id: string;
  mediaType: MediaKind;
  filename: string;
  mimeType: string;
  error?: string;
};

export async function uploadWhatsAppMedia(file: File): Promise<UploadedMedia> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form, headers: authHeaders() });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.error || "Upload failed");
  return data;
}

/**
 * Object URL for one Meta media id (image, voice note, video, document).
 *
 * `/api/whatsapp/media/*` is admin-gated by the proxy, and a browser cannot put
 * an `Authorization` header on `<img src>` or `<audio src>` — pointing those at
 * the route directly returns 401. So fetch the bytes with the session token and
 * hand the element a blob URL instead. The URL is revoked on unmount.
 */
export function useAuthedMedia(mediaId?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId) {
      setUrl(null);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;

    (async () => {
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/media/${mediaId}`, { headers: authHeaders() });
        if (!res.ok) {
          // Meta media ids expire; say so rather than showing a broken element.
          throw new Error(res.status === 404 ? "This attachment has expired." : `Attachment unavailable (${res.status})`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Attachment unavailable");
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId]);

  return { url, error };
}

export function useWhatsAppStats() {
  const { data } = useWhatsAppMessages();
  const messages = data?.data ?? [];
  return {
    total: messages.length,
    inbound: messages.filter((m) => m.direction === "inbound").length,
    outbound: messages.filter((m) => m.direction === "outbound").length,
    today: messages.filter((m) => new Date(m.timestamp).toDateString() === new Date().toDateString()).length,
  };
}

// ── Auto-reply rules ───────────────────────────────────────────────────────

export function useAutoReplyRules() {
  return useQuery<{ success: boolean; data: AutoReplyRule[] }>({
    queryKey: ["whatsapp-rules"],
    queryFn: () => getJSON("/rules"),
  });
}

export function useSaveAutoReplyRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rules: AutoReplyRule[]) => {
      const res = await fetch(`${API_BASE}/rules`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ rules }),
      });
      if (!res.ok) throw new Error("Failed to save rules");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-rules"] }),
  });
}

// ── Saved templates (canned messages) ────────────────────────────────────────

export function useWhatsAppTemplates() {
  return useQuery<{ success: boolean; data: WATemplate[] }>({
    queryKey: ["whatsapp-templates"],
    queryFn: () => getJSON("/templates"),
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tpl: WATemplate) => {
      const res = await fetch(`${API_BASE}/templates`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(tpl),
      });
      if (!res.ok) throw new Error("Failed to save template");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] }),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/templates?name=${encodeURIComponent(name)}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] }),
  });
}

// ── Meta-approved templates (business-initiated) ─────────────────────────────

export function useMetaTemplates() {
  return useQuery<{ success: boolean; data: MetaTemplate[]; configured?: boolean; notice?: string }>({
    queryKey: ["whatsapp-meta-templates"],
    queryFn: () => getJSON("/meta-templates"),
    refetchInterval: 30000, // approval status changes over time
    refetchOnWindowFocus: true, // and refresh the moment the admin tabs back in
  });
}

export function useSubmitMetaTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name?: string; all?: boolean }) => {
      const res = await fetch(`${API_BASE}/meta-templates`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit template");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-meta-templates"] }),
  });
}

// ── Conversation metadata (deal status, notes, archive, pin, read state) ──────

export type ConvMeta = {
  dealStatus?: string;
  notes?: string;
  archived?: boolean;
  pinned?: boolean;
  lastReadAt?: string;
  name?: string;
  tags?: string[];
};

export function useConversationMeta() {
  return useQuery<{ success: boolean; data: Record<string, ConvMeta> }>({
    queryKey: ["whatsapp-conv-meta"],
    queryFn: () => getJSON("/conversation-meta"),
    refetchInterval: 15000,
  });
}

export function useUpdateConversationMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, patch }: { key: string; patch: Partial<ConvMeta> }) => {
      const res = await fetch(`${API_BASE}/conversation-meta`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key, patch }),
      });
      if (!res.ok) throw new Error("Failed to update conversation");
      return res.json();
    },
    // Optimistic: patch the cache immediately so archive/pin/read feel instant.
    onMutate: async ({ key, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["whatsapp-conv-meta"] });
      const prev = queryClient.getQueryData<{ success: boolean; data: Record<string, ConvMeta> }>([
        "whatsapp-conv-meta",
      ]);
      queryClient.setQueryData<{ success: boolean; data: Record<string, ConvMeta> }>(
        ["whatsapp-conv-meta"],
        (old) => {
          const data = { ...(old?.data ?? {}) };
          data[key] = { ...(data[key] ?? {}), ...patch };
          return { success: true, data };
        }
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["whatsapp-conv-meta"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-conv-meta"] }),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ number, key }: { number: string; key: string }) => {
      const params = new URLSearchParams({ number });
      await fetch(`${API_BASE}/messages?${params.toString()}`, { method: "DELETE", headers: authHeaders() });
      await fetch(`${API_BASE}/conversation-meta?key=${encodeURIComponent(key)}`, { method: "DELETE", headers: authHeaders() });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-conv-meta"] });
    },
  });
}
