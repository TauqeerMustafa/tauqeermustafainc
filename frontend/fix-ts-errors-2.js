const fs = require('fs');

// 1. app/api/whatsapp/numbers/route.ts
let num = fs.readFileSync('app/api/whatsapp/numbers/route.ts', 'utf8');
num = num.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { accountAt } from "@/lib/wa-accounts";');
fs.writeFileSync('app/api/whatsapp/numbers/route.ts', num);

// 2. app/api/whatsapp/send/route.ts
let send = fs.readFileSync('app/api/whatsapp/send/route.ts', 'utf8');
const lines = send.split('\n');
// Find where it says `export async function POST(request: Request) {`
let postIndex = lines.findIndex(l => l.includes('export async function POST(request: Request) {'));

// Then find `const numberDef = waNumbers().find((n) => n.id === phoneNumberId);` after it
let badIndex = -1;
for (let i = postIndex; i < postIndex + 15; i++) {
  if (lines[i] && lines[i].includes('const numberDef = waNumbers().find((n) => n.id === phoneNumberId);')) {
    badIndex = i;
    break;
  }
}

if (badIndex !== -1) {
  // We remove 9 lines: the numberDef, account, token, empty line, if (!token) { return ... }, empty line
  // Let's just remove lines that look like the block until `try {`
  let countToRemove = 0;
  for (let i = badIndex; i < badIndex + 15; i++) {
    if (lines[i].includes('try {')) {
      break;
    }
    countToRemove++;
  }
  lines.splice(badIndex, countToRemove);
  
  // also we already appended it at line 117? 
  // Let's check if the block was added down below.
}
fs.writeFileSync('app/api/whatsapp/send/route.ts', lines.join('\n'));

console.log("Fixed part 2!");
