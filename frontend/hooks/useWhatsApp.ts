/**
 * React hooks for WhatsApp Business (Meta Cloud API).
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

export type AutoReplyRule = {
  id: string;
  keyword: string;
  mode: "contains" | "equals" | "starts";
  reply: string;
  enabled: boolean;
};

export type WATemplate = { name: string; text: string };

export type MetaTemplate = {
  name: string;
  category: "MARKETING" | "UTILITY";
  language: string;
  header?: string;
  body: string;
  bodyExample?: string[];
  footer?: string;
  buttons?: string[];
  status: string; // APPROVED | PENDING | REJECTED | NOT_SUBMITTED | ...
};

// ── Messages ─────────────────────────────────────────────────────────────────

export function useWhatsAppMessages() {
  return useQuery<{ success: boolean; data: WAMessage[]; count: number }>({
    queryKey: ["whatsapp-messages"],
    queryFn: () => getJSON("/messages"),
    refetchInterval: 5000,
  });
}

type SendMessagePayload = {
  type: "text" | "buttons" | "template" | "meta_template";
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

// ── Meta-approved templates (business-initiated) ─────────────────────────────

export function useMetaTemplates() {
  return useQuery<{ success: boolean; data: MetaTemplate[]; configured?: boolean; notice?: string }>({
    queryKey: ["whatsapp-meta-templates"],
    queryFn: () => getJSON("/meta-templates"),
    refetchInterval: 30000, // approval status changes over time
  });
}

export function useSubmitMetaTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name?: string; all?: boolean }) => {
      const res = await fetch(`${API_BASE}/meta-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit template");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-meta-templates"] }),
  });
}
