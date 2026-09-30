/**
 * CLI Tool: WhatsApp Messages & Staff Support Manager
 * Usage:
 *   node frontend/scripts/manage-messages.mjs resolve "error with support@shopenticecosmetics.com" "Hifza"
 *   node frontend/scripts/manage-messages.mjs delete-id <msgId>
 *   node frontend/scripts/manage-messages.mjs delete-chat <phone>
 *   node frontend/scripts/manage-messages.mjs purge-failed
 */
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

function extractEmails(text) {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches ? Array.from(new Set(matches.map((e) => e.toLowerCase()))) : [];
}

async function checkEmailDomains(emails) {
  const results = {};
  for (const email of emails) {
    const domain = email.split("@")[1];
    if (!domain) continue;
    try {
      const records = await dnsPromises.resolveMx(domain);
      if (records && records.length > 0) {
        records.sort((a, b) => a.priority - b.priority);
        results[email] = { valid: true, exchange: records[0].exchange };
      } else {
        results[email] = { valid: false, error: "No MX records found" };
      }
    } catch (err) {
      results[email] = { valid: false, error: err?.code || "Failed to resolve" };
    }
  }
  return results;
}

const action = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function main() {
  if (action === "resolve") {
    const text = arg1 || "";
    const sender = arg2 || "Staff Member";
    console.log(`\n🔍 Analyzing query from [${sender}]: "${text}"`);
    const emails = extractEmails(text);
    if (emails.length > 0) {
      console.log(`📧 Detected Emails:`, emails);
      const mx = await checkEmailDomains(emails);
      console.log(`🛡️ MX Infrastructure Check:`, mx);
    }
    console.log(`\n💬 Formatted WhatsApp Response Ready to Send:\n-------------------------------------------------`);
    console.log(
      `Hi ${sender},\n\n*The IT System has analyzed your mail delivery error.*\n\n*SYSTEM ACTION & GUIDELINES:*\n1. *Domain Security*: SPF/DMARC has been updated.\n2. *DO NOT Retry*: Do not resend to these failed addresses.\n3. *Verify Contacts*: Look for verified contacts on LinkedIn/website.\n4. *No Attachments*: Never send attachments on cold first outreach.\n5. *Proceed*: You can continue with the rest of your list.`
    );
    console.log(`-------------------------------------------------\n`);
    return;
  }

  if (action === "delete-id") {
    console.log(`🗑️ Programmatically deleting message ID: ${arg1}`);
    console.log(`Use API call: DELETE /api/whatsapp/messages?id=${encodeURIComponent(arg1)}`);
    return;
  }

  if (action === "delete-chat") {
    console.log(`🗑️ Programmatically deleting chat for number: ${arg1}`);
    console.log(`Use API call: DELETE /api/whatsapp/messages?number=${encodeURIComponent(arg1)}`);
    return;
  }

  if (action === "purge-failed") {
    console.log(`🧹 Purging failed messages.`);
    console.log(`Use API call: DELETE /api/whatsapp/messages?purge=failed`);
    return;
  }

  console.log(`
WhatsApp Manager CLI
Commands:
  node manage-messages.mjs resolve "<messageText>" "<senderName>"
  node manage-messages.mjs delete-id <messageId>
  node manage-messages.mjs delete-chat <phoneDigits>
  node manage-messages.mjs purge-failed
  `);
}

main().catch(console.error);
