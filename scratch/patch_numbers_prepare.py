import sys
import re

with open("frontend/app/api/whatsapp/numbers/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the single token check with checking each number's token
old_code = """export async function GET(request: Request) {
  const numbers = waNumbers();
  const token = process.env.WHATSAPP_TOKEN?.trim();

  if (!token || token === "[SENSITIVE]") {
    return NextResponse.json({
      success: true,
      data: numbers.map((n) => ({ ...n, canSend: false, error: "WHATSAPP_TOKEN is not configured." })),
    });
  }"""
new_code = """import { accountAt } from "@/lib/wa-accounts";
export async function GET(request: Request) {
  const numbers = waNumbers();"""

content = content.replace(old_code, new_code)

# Now in the Promise.all(numbers.map(async (n) => ... loop, we need to get the token for the number
# and use it for the fetch.
# Let's find the loop.
# It probably looks like:
# const testUrl = `${GRAPH_URL}/${n.id}/messages`;
# const res = await fetch(testUrl, { ... headers: { Authorization: `Bearer ${token}` } })

# Instead of blindly replacing, let's write a python script to patch it exactly.
