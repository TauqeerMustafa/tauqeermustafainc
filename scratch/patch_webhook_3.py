import sys

with open("frontend/app/api/whatsapp/webhook/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_code = """  async function handleAutoReply(
    to: string,
    incomingText: string,
    msgId: string,
    channel: string,
    choiceId: string | null
  ) {
    const token         = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = isKnownNumber(channel) ? channel : primaryNumberId();
    if (!token || !phoneNumberId) return;"""

new_code = """  async function handleAutoReply(
    to: string,
    incomingText: string,
    msgId: string,
    channel: string,
    choiceId: string | null
  ) {
    const phoneNumberId = isKnownNumber(channel) ? channel : primaryNumberId();
    if (!phoneNumberId) return;

    const numberDef = waNumbers().find((n) => n.id === phoneNumberId);
    const account = accountAt(numberDef?.slot ?? 1);
    const token = account.token;

    if (!token) return;"""

if old_code in content:
    content = content.replace(old_code, new_code)
    # Add imports
    if 'waNumbers' not in content:
        content = content.replace('isKnownNumber, primaryNumberId }', 'isKnownNumber, primaryNumberId, waNumbers }')
    if 'accountAt' not in content:
        content = content.replace('import { createHmac, timingSafeEqual } from "node:crypto";', 'import { createHmac, timingSafeEqual } from "node:crypto";\nimport { accountAt } from "@/lib/wa-accounts";')

    with open("frontend/app/api/whatsapp/webhook/route.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("done")
else:
    print("still no match")
