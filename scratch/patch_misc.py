import sys
import re

# PATCH meta-templates/route.ts
with open("frontend/app/api/whatsapp/meta-templates/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_config = """function config() {
  return {
    token: process.env.WHATSAPP_TOKEN,
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  };
}"""
new_config = """import { usableAccounts } from "@/lib/wa-accounts";
function config(request?: Request) {
  const slotParam = request ? new URL(request.url).searchParams.get("slot") : null;
  const slot = slotParam ? parseInt(slotParam, 10) : 1;
  const account = usableAccounts().find(a => a.slot === slot) || usableAccounts()[0];
  return {
    token: account?.token,
    wabaId: account?.wabaId,
  };
}"""
content = content.replace(old_config, new_config)

# It also uses config() in GET and POST, so replace config() with config(request)
content = re.sub(r"const\s+\{([^}]+)\}\s*=\s*config\(\);", r"const {\1} = config(request);", content)

with open("frontend/app/api/whatsapp/meta-templates/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

# PATCH templates/route.ts
try:
    with open("frontend/app/api/whatsapp/templates/route.ts", "r", encoding="utf-8") as f:
        content = f.read()
    # It probably also uses config()
    content = content.replace(old_config, new_config)
    content = re.sub(r"const\s+\{([^}]+)\}\s*=\s*config\(\);", r"const {\1} = config(request);", content)
    with open("frontend/app/api/whatsapp/templates/route.ts", "w", encoding="utf-8") as f:
        f.write(content)
except FileNotFoundError:
    pass

# PATCH media/[id]/route.ts
with open("frontend/app/api/whatsapp/media/[id]/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_media = """  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "WHATSAPP_TOKEN not configured" }, { status: 500 });
  }"""
new_media = """  const token = usableAccounts()[0]?.token;

  if (!token) {
    return NextResponse.json({ error: "WHATSAPP_TOKEN not configured" }, { status: 500 });
  }"""
content = content.replace(old_media, new_media)
if 'usableAccounts' not in content:
    content = content.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { usableAccounts } from "@/lib/wa-accounts";')
with open("frontend/app/api/whatsapp/media/[id]/route.ts", "w", encoding="utf-8") as f:
    f.write(content)


# PATCH upload/route.ts
with open("frontend/app/api/whatsapp/upload/route.ts", "r", encoding="utf-8") as f:
    content = f.read()
# Let's just do usableAccounts()[0] for media/upload, since usually they share WABA or we just use the first token
content = content.replace('const token = process.env.WHATSAPP_TOKEN;', 'const token = usableAccounts()[0]?.token;')
if 'usableAccounts' not in content:
    content = content.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { usableAccounts } from "@/lib/wa-accounts";')
with open("frontend/app/api/whatsapp/upload/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("done")
