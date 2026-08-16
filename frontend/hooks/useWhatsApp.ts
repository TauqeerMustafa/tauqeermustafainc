/**
 * React hooks for the self-hosted WhatsApp bot (Baileys).
 * All calls go through the Next.js /api/whatsapp/* proxy routes.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api/whatsapp";

async function getJSON(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
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
};

export type WAConnection = {
  status: "connecting" | "qr" | "open" | "close" | "logged_out";
  qr: string | null;
  me: { id: string; number: string } | null;
  connected: boolean;
};

export type AutoReplyRule = {
  id: string;
  keyword: string;
  mode: "contains" | "equals" | "starts";
  reply: string;
  enabled: boolean;
};

export type WATemplate = { name: string; text: string };

// ── Connection / QR ────────────────────────────────────────────────────────

/** Polls the bot connection + login QR (data URL). */
export function useWhatsAppConnection() {
  return useQuery<WAConnection>({
    queryKey: ["whatsapp-connection"],
    queryFn: () => getJSON("/qr"),
    refetchInterval: 3000,
  });
}

/** Log out / re-pair — clears the session so a fresh QR is generated. */
export function useWhatsAppLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/qr`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to log out");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-connection"] }),
  });
}

// ── Messages ─────────────────────────────────────────────────────────────────

export function useWhatsAppMessages() {
  return useQuery<{ success: boolean; data: WAMessage[]; count: number }>({
    queryKey: ["whatsapp-messages"],
    queryFn: () => getJSON("/messages"),
    refetchInterval: 5000,
  });
}

type SendMessagePayload = {
  type: "text" | "buttons" | "template";
  to: string;
  message?: string;
  bodyText?: string;
  footerText?: string;
  buttons?: Array<{ id: string; title: string }>;
  template?: string;
};

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

// ── Stats (derived from messages) ─────────────────────────────────────────────

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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`${API_BASE}/templates?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] }),
  });
}
