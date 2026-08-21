/**
 * Server-only helpers for resolving which WhatsApp Business number to use.
 *
 * We support up to two numbers under the same WhatsApp Business Account (WABA):
 *   WHATSAPP_PHONE_NUMBER_ID    – primary   (required)
 *   WHATSAPP_PHONE_NUMBER_ID_2  – secondary (optional, e.g. 941042809039791)
 * Optional friendly labels:
 *   WHATSAPP_PHONE_LABEL, WHATSAPP_PHONE_LABEL_2
 */

export type WaNumber = { id: string; label: string; primary: boolean };

/** All configured sending numbers, primary first. */
export function getWaNumbers(): WaNumber[] {
  const list: WaNumber[] = [];
  const p1 = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const p2 = process.env.WHATSAPP_PHONE_NUMBER_ID_2?.trim();
  if (p1) list.push({ id: p1, label: process.env.WHATSAPP_PHONE_LABEL?.trim() || "Primary", primary: true });
  if (p2 && p2 !== p1)
    list.push({ id: p2, label: process.env.WHATSAPP_PHONE_LABEL_2?.trim() || "Secondary", primary: false });
  return list;
}

/**
 * Resolve the phone-number-id to send from. If the caller requested a specific
 * id that we recognise, use it; otherwise fall back to the primary number.
 */
export function resolveNumberId(requested?: string | null): string | undefined {
  const numbers = getWaNumbers();
  if (requested) {
    const match = numbers.find((n) => n.id === String(requested).trim());
    if (match) return match.id;
  }
  return numbers[0]?.id ?? process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
}
