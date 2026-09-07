import sys
import re

with open("frontend/app/api/whatsapp/diagnose/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_extract = """  const token = process.env.WHATSAPP_TOKEN?.trim();
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  const configured = waNumbers();"""
new_extract = """  const slotParam = new URL(request.url).searchParams.get("slot");
  const slot = slotParam ? parseInt(slotParam, 10) : 1;
  const account = usableAccounts().find(a => a.slot === slot) || usableAccounts()[0];
  const token = account?.token?.trim();
  const wabaId = account?.wabaId?.trim();
  const configured = waNumbers().filter(n => (n.slot ?? 1) === (account?.slot ?? 1));"""
content = content.replace(old_extract, new_extract)

if 'usableAccounts' not in content:
    content = content.replace('import { waNumbers } from "@/lib/wa-numbers";', 'import { waNumbers } from "@/lib/wa-numbers";\nimport { usableAccounts } from "@/lib/wa-accounts";')

with open("frontend/app/api/whatsapp/diagnose/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("done")
