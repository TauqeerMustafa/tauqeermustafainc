const fs = require('fs');

// 1. app/api/whatsapp/diagnose/route.ts
let diag = fs.readFileSync('app/api/whatsapp/diagnose/route.ts', 'utf8');
diag = diag.replace('import { waNumbers } from "@/lib/wa-numbers";', 'import { waNumbers } from "@/lib/wa-numbers";\nimport { usableAccounts, WAAccount } from "@/lib/wa-accounts";');
diag = diag.replace('const account = usableAccounts().find(a => a.slot === slot) || usableAccounts()[0];', 'const account = usableAccounts().find((a: WAAccount) => a.slot === slot) || usableAccounts()[0];');
fs.writeFileSync('app/api/whatsapp/diagnose/route.ts', diag);

// 2. app/api/whatsapp/meta-templates/route.ts
let meta = fs.readFileSync('app/api/whatsapp/meta-templates/route.ts', 'utf8');
meta = meta.replace('export async function GET() {', 'export async function GET(request: Request) {');
fs.writeFileSync('app/api/whatsapp/meta-templates/route.ts', meta);

// 3. app/api/whatsapp/numbers/route.ts
let num = fs.readFileSync('app/api/whatsapp/numbers/route.ts', 'utf8');
if (!num.includes('import { accountAt }')) {
  num = num.replace('import { waNumbers } from "@/lib/wa-numbers";', 'import { waNumbers } from "@/lib/wa-numbers";\nimport { accountAt } from "@/lib/wa-accounts";');
}
fs.writeFileSync('app/api/whatsapp/numbers/route.ts', num);

// 4. app/api/whatsapp/send/route.ts
let send = fs.readFileSync('app/api/whatsapp/send/route.ts', 'utf8');
const badBlock = `

    const numberDef = waNumbers().find((n) => n.id === phoneNumberId);
    const account = accountAt(numberDef?.slot ?? 1);
    const token = account.token;

    if (!token) {
      return NextResponse.json(
        { success: false, error: \`WHATSAPP_TOKEN not configured for this sender's app (Slot \${account.slot})\` },
        { status: 500 }
      );
    }
`;
send = send.replace(badBlock, '');
send = send.replace('    const phoneNumberId = sender.id;', '    const phoneNumberId = sender.id;\n' + badBlock);
fs.writeFileSync('app/api/whatsapp/send/route.ts', send);

// 5. app/api/whatsapp/status/route.ts
let stat = fs.readFileSync('app/api/whatsapp/status/route.ts', 'utf8');
if (!stat.includes('import { usableAccounts }')) {
  stat = stat.replace('import { waNumbers } from "@/lib/wa-numbers";', 'import { waNumbers } from "@/lib/wa-numbers";\nimport { usableAccounts } from "@/lib/wa-accounts";');
}
fs.writeFileSync('app/api/whatsapp/status/route.ts', stat);

// 6. app/api/whatsapp/upload/route.ts
let upl = fs.readFileSync('app/api/whatsapp/upload/route.ts', 'utf8');
if (!upl.includes('import { usableAccounts }')) {
  upl = upl.replace('import { resolveNumberId } from "@/lib/wa-numbers";', 'import { resolveNumberId } from "@/lib/wa-numbers";\nimport { usableAccounts } from "@/lib/wa-accounts";');
}
fs.writeFileSync('app/api/whatsapp/upload/route.ts', upl);

// 7. app/api/whatsapp/webhook/route.ts
let web = fs.readFileSync('app/api/whatsapp/webhook/route.ts', 'utf8');
if (!web.includes('import { accountAt }')) {
  web = web.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { accountAt } from "@/lib/wa-accounts";');
}
fs.writeFileSync('app/api/whatsapp/webhook/route.ts', web);

console.log("Fixed files!");
