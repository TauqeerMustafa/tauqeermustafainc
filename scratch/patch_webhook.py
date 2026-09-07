import sys

with open("frontend/app/api/whatsapp/webhook/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Fix GET function for WEBHOOK_VERIFY_TOKEN
content = content.replace(
    '  const expected = process.env.WEBHOOK_VERIFY_TOKEN;',
    '  const { verifyTokens } = await import("@/lib/wa-accounts");\n  const expectedTokens = verifyTokens();'
)
content = content.replace(
    '  if (!expected) {',
    '  if (expectedTokens.length === 0) {'
)
content = content.replace(
    '  if (mode === "subscribe" && token === expected) {',
    '  if (mode === "subscribe" && token && expectedTokens.includes(token)) {'
)

# Fix signatureValid for WHATSAPP_APP_SECRET
old_sig = """function signatureValid(raw: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    console.warn("[webhook] WHATSAPP_APP_SECRET unset ?" skipping signature check");
    return true;
  }
  if (!header || !header.startsWith("sha256=")) return false;

  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}"""
new_sig = """import { appSecrets } from "@/lib/wa-accounts";
function signatureValid(raw: string, header: string | null): boolean {
  const secrets = appSecrets();
  if (secrets.length === 0) {
    console.warn("[webhook] No WHATSAPP_APP_SECRET set ?" skipping signature check");
    return true;
  }
  if (!header || !header.startsWith("sha256=")) return false;

  const b = Buffer.from(header);
  
  for (const secret of secrets) {
    const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
    const a = Buffer.from(expected);
    if (a.length !== b.length) continue;
    try {
      if (timingSafeEqual(a, b)) return true;
    } catch {
      continue;
    }
  }
  return false;
}"""
content = content.replace(old_sig, new_sig)

# Fix the WHATSAPP_TOKEN usage for auto-replies
# Let's see how WHATSAPP_TOKEN is used in webhook/route.ts
# It probably uses process.env.WHATSAPP_TOKEN somewhere in POST.
# I will just write a small replacement for handleAutoReply if needed.
with open("frontend/app/api/whatsapp/webhook/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
