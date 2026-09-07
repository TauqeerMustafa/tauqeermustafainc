import sys

with open("frontend/app/api/whatsapp/numbers/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the GET function
old_get = """export async function GET(request: Request) {
  const numbers = waNumbers();
  const token = process.env.WHATSAPP_TOKEN?.trim();

  if (!token || token === "[SENSITIVE]") {
    return NextResponse.json({
      success: true,
      data: numbers.map((n) => ({ ...n, canSend: false, error: "WHATSAPP_TOKEN is not configured." })),
    });
  }

  const fresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ success: true, data: cache.data, cached: true });
  }

  const data = await Promise.all(numbers.map((n) => describe(n, token)));
  cache = { at: Date.now(), data };

  return NextResponse.json({ success: true, data });
}"""

new_get = """export async function GET(request: Request) {
  const numbers = waNumbers();

  const fresh = new URL(request.url).searchParams.get("refresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ success: true, data: cache.data, cached: true });
  }

  const data = await Promise.all(
    numbers.map(async (n) => {
      const account = accountAt(n.slot ?? 1);
      const token = account.token?.trim();
      if (!token || token === "[SENSITIVE]") {
        return { ...n, canSend: false, error: `Token for this number's app (Slot ${account.slot}) is not configured.` };
      }
      return describe(n, token);
    })
  );
  cache = { at: Date.now(), data };

  return NextResponse.json({ success: true, data });
}"""

content = content.replace(old_get, new_get)
if 'accountAt' not in content:
    content = content.replace('import { waNumbers, type WANumber } from "@/lib/wa-numbers";', 'import { waNumbers, type WANumber } from "@/lib/wa-numbers";\nimport { accountAt } from "@/lib/wa-accounts";')

with open("frontend/app/api/whatsapp/numbers/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("done")
