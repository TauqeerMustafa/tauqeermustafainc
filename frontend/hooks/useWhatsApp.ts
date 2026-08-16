/**
 * React hooks for WhatsApp message management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api/whatsapp";

// ── Fetch WhatsApp Messages ──────────────────────────────────────────────────

export function useWhatsAppMessages() {
  return useQuery({
    queryKey: ["whatsapp-messages"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/messages`);
      if (!res.ok) throw new Error("Failed to fetch WhatsApp messages");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

// ── Send WhatsApp Message ────────────────────────────────────────────────────

type SendMessagePayload = {
  type: "text" | "buttons" | "template";
  to: string;
  message?: string;
  bodyText?: string;
  footerText?: string;
  buttons?: Array<{ id: string; title: string }>;
  template?: string;
  language?: string;
  components?: any[];
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
      } catch (parseError) {
        const text = await res.text();
        throw new Error(`Server error: ${text.substring(0, 200)}`);
      }

      if (!res.ok) {
        // Extract detailed error message from backend
        const errorMsg = data.error || data.detail || "Failed to send message";
        throw new Error(errorMsg);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate messages query to refresh inbox
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
    },
  });
}

// ── Get WhatsApp Statistics ──────────────────────────────────────────────────

export function useWhatsAppStats() {
  const { data } = useWhatsAppMessages();
  const messages = data?.data ?? [];

  const inboundCount = messages.filter((m: any) => m.direction === "inbound").length;
  const outboundCount = messages.filter((m: any) => m.direction === "outbound").length;
  const todayCount = messages.filter(
    (m: any) =>
      new Date(m.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return {
    total: messages.length,
    inbound: inboundCount,
    outbound: outboundCount,
    today: todayCount,
  };
}
