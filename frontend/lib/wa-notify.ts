/**
 * WhatsApp Lead Triage & Human Handoff Notification Layer.
 *
 * Pluggable notifier for CRM webhooks, Slack/Discord, and portal lead tracking.
 */

import { getKV } from "@/lib/kv";

export interface NotificationPayload {
  title: string;
  customer: string;
  reason: string;
  service?: string;
  scope?: string;
  timeline?: string;
  channel?: string;
}

export async function notify(
  channel: string,
  payload: NotificationPayload
): Promise<void> {
  console.log(`[wa-notify] Rep Notification (${channel}):`, payload);

  // Store in KV / memory for /leads and administrative audit
  const kv = getKV();
  const leadEntry = {
    id: `LEAD-${Date.now().toString().slice(-6)}`,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  if (kv) {
    try {
      const existing = (await kv.get<any[]>("portal:qualified_leads")) ?? [];
      existing.unshift(leadEntry);
      await kv.set("portal:qualified_leads", existing.slice(0, 100));
    } catch (err) {
      console.error("[wa-notify] Error saving qualified lead:", err);
    }
  }

  // If a webhook URL is configured (e.g. SLACK_WEBHOOK_URL or CRM_WEBHOOK_URL), dispatch it
  const webhookUrl = process.env.LEAD_NOTIFY_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*${payload.title}*\n• Customer: +${payload.customer}\n• Service: ${payload.service || "General"}\n• Scope: ${payload.scope || "—"}\n• Timeline: ${payload.timeline || "—"}\n• Details: ${payload.reason}`,
        }),
      }).catch(() => {});
    } catch {}
  }
}
