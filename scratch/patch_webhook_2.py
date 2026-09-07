import sys

with open("frontend/app/api/whatsapp/webhook/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_code = """  async function handleAutoReply(
    channel: string,
    waId: string,
    incomingText: string,
    choiceId: string | null
  ) {
    const token         = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = isKnownNumber(channel) ? channel : primaryNumberId();
    if (!token || !phoneNumberId) return;"""

new_code = """  async function handleAutoReply(
    channel: string,
    waId: string,
    incomingText: string,
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
else:
    print("WARNING: handleAutoReply not found or didn't match perfectly.")

# Add waNumbers to import if missing
if 'waNumbers' not in content:
    content = content.replace('isKnownNumber, primaryNumberId }', 'isKnownNumber, primaryNumberId, waNumbers }')

with open("frontend/app/api/whatsapp/webhook/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("done")
