import sys

with open("frontend/app/api/whatsapp/status/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_get = """export async function GET() {
  const token = process.env.WHATSAPP_TOKEN;
  const numbers = waNumbers();

  if (!token || token === "[SENSITIVE]" || numbers.length === 0) {
    return NextResponse.json({
      success: true,
      status: "disconnected",
      reason: !token || token === "[SENSITIVE]"
        ? "WHATSAPP_TOKEN is not configured in environment variables (or is hidden)."
        : "No sending number is configured. Set WHATSAPP_PHONE_NUMBER_ID.",
      numbers: [],
    });
  }

  return NextResponse.json({
    success: true,
    status: "connected",
    provider: "meta_cloud_api",
    phoneNumberId: numbers.find((n) => n.primary)?.id ?? numbers[0].id,
    numbers,
  });
}"""

new_get = """export async function GET() {
  const accounts = usableAccounts();
  const numbers = waNumbers();

  if (accounts.length === 0 || numbers.length === 0) {
    return NextResponse.json({
      success: true,
      status: "disconnected",
      reason: accounts.length === 0
        ? "No usable WhatsApp app credentials (WHATSAPP_TOKEN) configured."
        : "No sending number is configured. Set WHATSAPP_PHONE_NUMBER_ID.",
      numbers: [],
    });
  }

  return NextResponse.json({
    success: true,
    status: "connected",
    provider: "meta_cloud_api",
    phoneNumberId: numbers.find((n) => n.primary)?.id ?? numbers[0].id,
    numbers,
  });
}"""

content = content.replace(old_get, new_get)
if 'usableAccounts' not in content:
    content = content.replace('import { waNumbers } from "@/lib/wa-numbers";', 'import { waNumbers } from "@/lib/wa-numbers";\nimport { usableAccounts } from "@/lib/wa-accounts";')

with open("frontend/app/api/whatsapp/status/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
