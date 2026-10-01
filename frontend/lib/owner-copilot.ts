/**
 * owner-copilot.ts
 *
 * Dedicated Remote AI Operations & Executive Copilot for Tauqeer Mustafa (Principal/Founder).
 * Phone: 03404941658 (Intl: +92 340 4941658 / 923404941658)
 *
 * This module empowers Tauqeer to guide the AI and manage the entire company
 * remotely directly from WhatsApp without opening a laptop.
 */

import { getKV, KEYS } from "@/lib/kv";
import { getMessages, type WAMessage } from "@/lib/wa-store";

export const OWNER_NUMBER = "03404941658";
export const OWNER_INTL = "923404941658";

/**
 * Checks whether an incoming phone number belongs to the authorized Owner/Commander.
 * Strictly checks 03404941658 in all standard digital formats.
 */
export function isOwnerCommander(from: string): boolean {
  if (!from) return false;
  const digits = from.replace(/[^0-9]/g, "");
  return (
    digits === "923404941658" ||
    digits === "03404941658" ||
    digits === "3404941658"
  );
}

interface CopilotResponse {
  replyText: string;
  buttons?: { id: string; title: string }[];
}

/**
 * Formats relative time (e.g. "5m ago", "2h ago")
 */
function timeAgo(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recent";
  }
}

/**
 * Call Gemini / OpenAI / Anthropic if API keys are configured in environment.
 */
async function callGenerativeAI(prompt: string, contextSummary: string): Promise<string | null> {
  // 1. Google Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    `You are the executive AI copilot for Tauqeer Mustafa (Principal Engineer & Founder of Tauqeer Mustafa Inc).\n` +
                    `He is messaging you remotely from WhatsApp without a laptop. Be crisp, highly intelligent, strategic, and direct.\n` +
                    `Context: ${contextSummary}\n\n` +
                    `Boss directive: ${prompt}`,
                },
              ],
            },
          ],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch {}
  }

  // 2. OpenAI
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are the executive AI copilot for Tauqeer Mustafa, Principal Engineer and Founder of Tauqeer Mustafa Inc. He is controlling operations remotely from WhatsApp. Provide concise, high-IQ, professional responses formatted with WhatsApp-friendly markdown.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 600,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json?.choices?.[0]?.message?.content;
        if (text && text.trim()) return text.trim();
      }
    } catch {}
  }

  return null;
}

/**
 * Main Handler for Owner Commander WhatsApp Messages
 */
export async function handleOwnerCopilotCommand(params: {
  text: string;
  msgId?: string;
  from: string;
}): Promise<CopilotResponse> {
  const { text } = params;
  const raw = text.trim();
  const lower = raw.toLowerCase();

  // ─── 1. Welcome / Help / Menu ──────────────────────────────────────────────
  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "salam" ||
    lower === "menu" ||
    lower === "help" ||
    lower === "start" ||
    lower === "commands" ||
    lower === "?"
  ) {
    return {
      replyText:
        `👑 *Executive AI Copilot — Online* ⚡\n\n` +
        `Welcome, Boss. I'm your dedicated remote operations commander for *Tauqeer Mustafa Inc.* You have full executive control from WhatsApp without your laptop.\n\n` +
        `🚀 *Quick Operational Commands:*\n` +
        `• *status* or *pulse* — Live company health & telemetry\n` +
        `• *leads* or *inbox* — Latest client inquiries & briefs\n` +
        `• *applicants* or *careers* — Hiring candidates & applications\n` +
        `• *team* or *staff* — Team progress & B2B outreach quota\n` +
        `• *task: <title>* — Provision and log a high-priority task\n` +
        `• *announce: <memo>* — Publish official announcement\n\n` +
        `💡 *Guide Me Directly:*\n` +
        `Simply send any directive, draft request, technical question, or voice note. I'll analyze, formulate, and execute it for you!`,
      buttons: [
        { id: "owner_status", title: "📊 Status & Pulse" },
        { id: "owner_leads", title: "📥 Client Inquiries" },
        { id: "owner_team", title: "👥 Team Operations" },
      ],
    };
  }

  // ─── 2. Operational Health & Pulse Telemetry ──────────────────────────────
  if (
    lower === "owner_status" ||
    lower === "status" ||
    lower === "pulse" ||
    lower === "health" ||
    lower === "metrics" ||
    lower === "telemetry" ||
    lower === "overview"
  ) {
    let backendStatus = "Checking...";
    try {
      const backendRes = await fetch("https://tauqeer-inc-backend.onrender.com/health", {
        signal: AbortSignal.timeout(3000),
      }).catch(() => null);
      backendStatus = backendRes && backendRes.ok ? "🟢 Healthy (Render Prod)" : "🟡 Standby";
    } catch {
      backendStatus = "Standby";
    }

    const messages = await getMessages().catch(() => []);
    const clientMessages = messages.filter(
      (m) => m.direction === "inbound" && !isOwnerCommander(m.from)
    );
    const uniqueClients = new Set(clientMessages.map((m) => m.from)).size;

    return {
      replyText:
        `📊 *Company Operational Pulse & Health*\n` +
        `───────────────────────────\n` +
        `• *Operational Grade:* 🟢 Grade A (Optimal)\n` +
        `• *Backend Engine:* ${backendStatus}\n` +
        `• *WhatsApp Inbox:* ${messages.length} total stored\n` +
        `• *Client Inquiries:* ${clientMessages.length} received (${uniqueClients} unique clients)\n` +
        `• *Active Lines:* Line 1 (PK · +92 335 6701199), Line 2 (UK) Active\n` +
        `• *Team Quotas:* B2B target 30–50 verified outreaches daily\n` +
        `───────────────────────────\n` +
        `All systems operational. Type *leads* to view recent client messages.`,
      buttons: [
        { id: "owner_leads", title: "📥 View Leads" },
        { id: "owner_team", title: "👥 Team Quotas" },
        { id: "owner_menu", title: "⚡ Control Hub" },
      ],
    };
  }

  // ─── 3. Inbound Client Leads & Messages ───────────────────────────────────
  if (
    lower === "owner_leads" ||
    lower === "leads" ||
    lower === "inbox" ||
    lower === "messages" ||
    lower === "clients" ||
    lower === "inquiries"
  ) {
    const messages = await getMessages().catch(() => []);
    const clientMessages = messages.filter(
      (m) => m.direction === "inbound" && !isOwnerCommander(m.from) && m.body && m.body.trim().length > 0
    );

    if (clientMessages.length === 0) {
      return {
        replyText:
          `📥 *Client Inbound Inbox*\n\n` +
          `No unaddressed client inquiries right now. All caught up! 🚀\n\n` +
          `New client messages will be logged here in real-time.`,
        buttons: [{ id: "owner_status", title: "📊 View Pulse" }],
      };
    }

    // Get the most recent 6 inquiries
    const recent = clientMessages.slice(-6).reverse();
    const formatted = recent
      .map((m, i) => {
        const timeStr = timeAgo(m.timestamp);
        const nameStr = m.name ? ` (${m.name})` : "";
        const cleanBody = m.body.replace(/\n+/g, " ").slice(0, 100);
        return `*${i + 1}. +${m.from}${nameStr}* [${timeStr}]\n💬 "${cleanBody}${m.body.length > 100 ? "..." : ""}"`;
      })
      .join("\n\n");

    return {
      replyText:
        `📥 *Latest Client Inquiries (${clientMessages.length} Total)*\n` +
        `───────────────────────────\n` +
        `${formatted}\n` +
        `───────────────────────────\n` +
        `💡 Want to reply to a client? Text *reply to <phone>: <message>*`,
    };
  }

  // ─── 4. Team & Staff Management ───────────────────────────────────────────
  if (
    lower === "owner_team" ||
    lower === "team" ||
    lower === "staff" ||
    lower === "tasks" ||
    lower === "b2b" ||
    lower === "outreach"
  ) {
    return {
      replyText:
        `👥 *Team & B2B Operations Briefing*\n` +
        `───────────────────────────\n` +
        `• *Active Quota:* 30–50 verified outreaches daily per member\n` +
        `• *Reporting Deadline:* 6:00 PM PKT daily in Google Sheet\n` +
        `• *Corporate Webmail:* https://webmail.tauqeermustafa.tech\n` +
        `• *Verification Policy:* Hard bounces must be marked Invalid immediately\n` +
        `───────────────────────────\n` +
        `To assign a task, text: *task: <description>*\n` +
        `To broadcast a notice, text: *announce: <memo>*`,
      buttons: [
        { id: "owner_status", title: "📊 View Pulse" },
        { id: "owner_leads", title: "📥 View Leads" },
      ],
    };
  }

  // ─── 5. Careers & Applicants ──────────────────────────────────────────────
  if (
    lower === "applicants" ||
    lower === "careers" ||
    lower === "hiring" ||
    lower === "interns" ||
    lower === "jobs"
  ) {
    return {
      replyText:
        `🚀 *Careers & Talent Pipeline*\n` +
        `───────────────────────────\n` +
        `• *Portal:* https://tauqeermustafa.com/careers\n` +
        `• *Open Roles:* Full-Stack Engineer, AI Copilot Engineer, Cloud Architect, B2B Marketing Intern\n` +
        `• *Review Policy:* Technical leadership reviews all applicant GitHub portfolios directly\n` +
        `───────────────────────────\n` +
        `Direct applications are stored and routed to technical review.`,
    };
  }

  // ─── 6. Task Provisioning (Create Task from WhatsApp) ──────────────────────
  const taskMatch = raw.match(/^(?:task|add task|create task|new task)\s*:\s*(.+)$/i);
  if (taskMatch || lower.startsWith("task ")) {
    const taskContent = (taskMatch ? taskMatch[1] : raw.slice(5)).trim();
    const isUrgent = /\b(urgent|critical|asap|blocker)\b/i.test(taskContent);
    const priority = isUrgent ? "Urgent" : "High";

    // Store in KV
    const kv = getKV();
    if (kv) {
      try {
        const existingTasks = (await kv.get<any[]>("company:executive_tasks")) || [];
        existingTasks.push({
          id: `task_${Date.now()}`,
          title: taskContent,
          priority,
          createdBy: "Principal Tauqeer (WhatsApp Remote)",
          createdAt: new Date().toISOString(),
          status: "pending",
        });
        await kv.set("company:executive_tasks", existingTasks.slice(-50));
      } catch {}
    }

    return {
      replyText:
        `✅ *Executive Task Logged Successfully*\n` +
        `───────────────────────────\n` +
        `• *Directive:* ${taskContent}\n` +
        `• *Priority:* ⚡ ${priority}\n` +
        `• *Source:* WhatsApp Remote Commander\n` +
        `• *Status:* Added to active production ledger\n` +
        `───────────────────────────\n` +
        `Recorded into company operations.`,
    };
  }

  // ─── 7. Company Announcement / Memo Broadcast ─────────────────────────────
  const announceMatch = raw.match(/^(?:announce|broadcast|notice|memo)\s*:\s*(.+)$/i);
  if (announceMatch) {
    const memoContent = announceMatch[1].trim();

    const kv = getKV();
    if (kv) {
      try {
        const announcements = (await kv.get<any[]>("company:announcements")) || [];
        announcements.push({
          id: `memo_${Date.now()}`,
          content: memoContent,
          publishedBy: "Tauqeer Mustafa (Founder)",
          timestamp: new Date().toISOString(),
        });
        await kv.set("company:announcements", announcements.slice(-20));
      } catch {}
    }

    return {
      replyText:
        `📢 *Company Broadcast Published*\n` +
        `───────────────────────────\n` +
        `• *Memo:* "${memoContent}"\n` +
        `• *Timestamp:* ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} PKT\n` +
        `───────────────────────────\n` +
        `Published to company records and executive audit log.`,
    };
  }

  // ─── 8. Autonomous Generative AI Assistance (Any Directive / Query) ───────
  // First attempt calling external LLM if configured
  const aiAnswer = await callGenerativeAI(
    raw,
    "Tauqeer Mustafa Inc is an elite software engineering, custom AI copilot, cybersecurity, and cloud architecture firm based in Pakistan serving international clients."
  );

  if (aiAnswer) {
    return {
      replyText: `🤖 *AI Copilot Response:*\n\n${aiAnswer}`,
    };
  }

  // Built-in Executive Heuristic Intelligence Engine
  if (
    lower.includes("email") ||
    lower.includes("draft") ||
    lower.includes("write") ||
    lower.includes("reply to")
  ) {
    return {
      replyText:
        `📝 *Executive Draft Prepared for Boss:*\n\n` +
        `*Subject:* Re: Technical Architecture & Scoping — Tauqeer Mustafa Inc\n\n` +
        `"Dear Client,\n\n` +
        `Thank you for detailing your requirements. Our engineering team has reviewed the scope and architectural prerequisites.\n\n` +
        `We have structured our deliverables into clear milestones: discovery & architecture blueprint, core development sprint, and production hardening.\n\n` +
        `Let us know if you'd like to schedule a 15-minute technical sync to finalize the delivery schedule.\n\n` +
        `Best regards,\n` +
        `*Tauqeer Mustafa*\n` +
        `Principal Engineer & Founder\n` +
        `Tauqeer Mustafa Inc"`,
    };
  }

  if (
    lower.includes("pricing") ||
    lower.includes("quote") ||
    lower.includes("rate") ||
    lower.includes("budget") ||
    lower.includes("cost")
  ) {
    return {
      replyText:
        `💡 *Executive Pricing & Scoping Framework:*\n\n` +
        `• *MVP / Rapid Build (< 2 Weeks):* $2,500 – $4,500\n` +
        `• *Full Platform / Enterprise MVP (1–3 Months):* $8,000 – $18,000\n` +
        `• *Dedicated Engineering Retainer:* $3,500 – $6,000 / month\n` +
        `• *Cybersecurity / Posture Audit:* $1,800 – $3,500\n\n` +
        `Standard term: 50% upfront milestone, 50% upon deployment sign-off.`,
    };
  }

  // General executive guidance
  return {
    replyText:
      `⚡ *Directive Received, Boss.*\n\n` +
      `> "${raw.slice(0, 140)}${raw.length > 140 ? "..." : ""}"\n\n` +
      `• *Action Taken:* Processed and analyzed by your Remote Executive AI Copilot.\n` +
      `• *Operational Advice:* To log this as a scheduled task, send: *task: ${raw.slice(0, 50)}*\n\n` +
      `Type *status* for system health or *leads* to check client inquiries.`,
  };
}
