import sys
import re

with open("frontend/app/api/whatsapp/webhook/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r"const\s+token\s*=\s*process\.env\.WHATSAPP_TOKEN;\s*const\s+phoneNumberId\s*=\s*isKnownNumber\(channel\)\s*\?\s*channel\s*:\s*primaryNumberId\(\);\s*if\s*\(!token\s*\|\|\s*!phoneNumberId\)\s*return;",
    "const phoneNumberId = isKnownNumber(channel) ? channel : primaryNumberId();\n    if (!phoneNumberId) return;\n    const numberDef = waNumbers().find((n) => n.id === phoneNumberId);\n    const account = accountAt(numberDef?.slot ?? 1);\n    const token = account.token;\n    if (!token) return;",
    content
)

if 'waNumbers' not in content:
    content = content.replace('isKnownNumber, primaryNumberId }', 'isKnownNumber, primaryNumberId, waNumbers }')
if 'accountAt' not in content:
    content = content.replace('import { createHmac, timingSafeEqual } from "node:crypto";', 'import { createHmac, timingSafeEqual } from "node:crypto";\nimport { accountAt } from "@/lib/wa-accounts";')

with open("frontend/app/api/whatsapp/webhook/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
