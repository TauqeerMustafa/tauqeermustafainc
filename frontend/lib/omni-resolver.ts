import dns from "node:dns";
import dnsPromises from "node:dns/promises";
import { generateProfessionalClientReply } from "@/lib/owner-copilot";

// Configure reliable public DNS resolvers
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

export interface TriageResult {
  category: "EMAIL_BOUNCE" | "CREDENTIALS" | "TASK_ASSIGNMENT" | "CONTACT_FORM" | "GENERAL_SUPPORT" | "BUTTON_CLICK" | "UNKNOWN";
  diagnosis: string;
  actionTaken: string;
  replyText: string;
  buttons?: { id: string; title: string }[];
  list?: {
    header: string;
    buttonText: string;
    rows: { id: string; title: string; description?: string }[];
  };
  emailDetails?: {
    addresses: string[];
    mxChecks: Record<string, { valid: boolean; exchange?: string; error?: string }>;
  };
}

function getShortName(name?: string): string {
  if (!name || !name.trim()) return "";
  const cleaned = name.replace(/[^a-zA-Z\s]/g, "").trim().split(" ")[0];
  return cleaned ? ` ${cleaned}` : "";
}

function extractEmails(text: string): string[] {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches ? Array.from(new Set(matches.map((e) => e.toLowerCase()))) : [];
}

async function checkEmailDomains(emails: string[]) {
  const results: Record<string, { valid: boolean; exchange?: string; error?: string }> = {};

  for (const email of emails) {
    const domain = email.split("@")[1];
    if (!domain) {
      results[email] = { valid: false, error: "Invalid domain" };
      continue;
    }

    try {
      const records = await dnsPromises.resolveMx(domain);
      if (records && records.length > 0) {
        records.sort((a, b) => a.priority - b.priority);
        results[email] = { valid: true, exchange: records[0].exchange };
      } else {
        results[email] = { valid: false, error: "No MX record" };
      }
    } catch (err: any) {
      results[email] = { valid: false, error: err?.code || "Unreachable" };
    }
  }

  return results;
}

/**
 * Handle quick interactive button taps (Short, conversational, direct)
 */
export function handleButtonClick(choiceId: string, name?: string): TriageResult | null {
  const shortName = getShortName(name);

  switch (choiceId) {
    // ─── SERVICES ───────────────────────────────────────────────
    case "ai":
    case "ai_automation":
    case "ai_copilot":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Client selected AI & Automation.",
        actionTaken: "Shared AI scope options.",
        replyText:
          `Hey${shortName}! We build custom AI copilots, autonomous agents, and enterprise search workflows.\n\n` +
          `What delivery timeline are you looking at?`,
        buttons: [
          { id: "time_immediate", title: "< 2 Weeks" },
          { id: "time_quarterly", title: "1–3 Months" },
          { id: "human", title: "Talk to Engineer" },
        ],
      };

    case "web":
    case "web_new":
    case "web_migration":
    case "web_perf":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Client selected Web & Platforms.",
        actionTaken: "Shared Web scope options.",
        replyText:
          `Hey${shortName}! We build modern web apps, SaaS platforms, and APIs.\n\n` +
          `When are you planning to kick off?`,
        buttons: [
          { id: "time_immediate", title: "Immediately" },
          { id: "time_quarterly", title: "1–3 Months" },
          { id: "human", title: "Talk to Engineer" },
        ],
      };

    case "cybersecurity":
    case "sec_audit":
    case "sec_incident":
    case "sec_access":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Client selected Cybersecurity.",
        actionTaken: "Shared security options.",
        replyText:
          `Hey${shortName}! We handle penetration testing, security posture reviews, and incident response.\n\n` +
          `How urgent is your security review?`,
        buttons: [
          { id: "time_immediate", title: "Urgent Review" },
          { id: "human", title: "Talk to Sec Lead" },
        ],
      };

    case "cloud":
    case "cloud_arch":
    case "cloud_cicd":
    case "cloud_iac":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Client selected Cloud & DevOps.",
        actionTaken: "Shared cloud options.",
        replyText:
          `Hey${shortName}! We design AWS/GCP cloud infrastructure, CI/CD pipelines, and Terraform setups.\n\n` +
          `When do you need to start?`,
        buttons: [
          { id: "time_immediate", title: "Right Away" },
          { id: "human", title: "Talk to Architect" },
        ],
      };

    case "uiux":
    case "ux_design":
    case "ux_research":
    case "ux_proto":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Client selected UI/UX.",
        actionTaken: "Shared UI/UX options.",
        replyText:
          `Hey${shortName}! We design intuitive user interfaces, design systems, and clickable prototypes.\n\n` +
          `What timeline do you have in mind?`,
        buttons: [
          { id: "time_immediate", title: "< 2 Weeks" },
          { id: "human", title: "Talk to Designer" },
        ],
      };

    case "client_services":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Client selected Client Desk.",
        actionTaken: "Connected to Client Desk.",
        replyText:
          `Welcome to our Client Desk! We assist with active contracts, invoices, and portal access.\n\n` +
          `Drop your company name or contract details right here and our desk will pull up your records to help immediately.`,
        buttons: [
          { id: "human", title: "Speak to Manager" },
          { id: "restart", title: "Main Menu" },
        ],
      };

    case "careers":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "User selected Careers.",
        actionTaken: "Shared careers link.",
        replyText:
          `We're actively hiring engineers and interns! 🚀\n\n` +
          `Check open roles and apply here:\n` +
          `👉 *https://tauqeermustafa.com/careers*\n\n` +
          `Our technical team reviews all applications directly.`,
        buttons: [
          { id: "human", title: "Message HR" },
          { id: "restart", title: "Main Menu" },
        ],
      };

    case "human":
    case "cat_human":
    case "hum_brief":
    case "hum_call":
    case "hum_back":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Direct consultation requested.",
        actionTaken: "Connected to Principal.",
        replyText:
          `You're through to Tauqeer Mustafa's direct engineering desk. 👋\n\n` +
          `Please share your project vision, scope, or drop a voice note right here in this chat.\n\n` +
          `Every brief is reviewed with care, and our principal will reply directly to you right here!`,
      };

    case "time_immediate":
    case "time_quarterly":
    case "time_advisory":
    case "immediate":
    case "planned":
    case "exploration":
    case "timeline":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Timeline selected.",
        actionTaken: "Prompted for project details.",
        replyText:
          `Got it! Turnaround timeline noted. ⚡\n\n` +
          `Please share a brief note:\n` +
          `1. *Company / Project Name*\n` +
          `2. *What you need built or solved*\n\n` +
          `You can type your reply or send a voice note here. Our lead engineer will review and reply with an estimate!`,
      };

    case "incident":
    case "incident_fast":
    case "inc_outage":
    case "inc_breach":
    case "inc_call":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Emergency incident alert.",
        actionTaken: "Dispatched emergency contact instructions.",
        replyText:
          `🚨 *Priority Incident Logged*\n\n` +
          `Our on-call engineering team has been alerted immediately.\n\n` +
          `Please reply with your affected service/URL, IP address, and incident symptoms right here:`,
        buttons: [
          { id: "human", title: "Message Lead" },
          { id: "restart", title: "Main Menu" },
        ],
      };

    // ─── STAFF ACTIONS ──────────────────────────────────────────
    case "staff_tasks":
    case "week2_tasks":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Staff requested tasks.",
        actionTaken: "Sent task summary.",
        replyText:
          `Hey${shortName}! Here is your task briefing:\n\n` +
          `• *Target:* 30–50 verified outreaches daily\n` +
          `• *Tracker:* Check your assigned B2B Google Sheet\n` +
          `• *Deadline:* Log all entries by 6:00 PM PKT daily\n\n` +
          `What do you need?`,
        buttons: [
          { id: "submit_progress", title: "Submit Report" },
          { id: "staff_next_batch", title: "Request Leads" },
          { id: "human", title: "Ask Lead" },
        ],
      };

    case "staff_next_batch":
    case "submit_progress":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Staff submitting report.",
        actionTaken: "Prompted for sheet link.",
        replyText:
          `Great progress! 🚀\n\n` +
          `Please reply with your *Google Sheet link* and *number of verified emails sent today*.\n\n` +
          `We'll verify and allocate your next batch.`,
        buttons: [
          { id: "staff_tasks", title: "Task Rules" },
          { id: "human", title: "Talk to Lead" },
        ],
      };

    case "open_webmail":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Webmail portal link requested.",
        actionTaken: "Shared portal link.",
        replyText:
          `Log into your corporate email here:\n` +
          `🌐 *https://webmail.tauqeermustafa.tech*\n\n` +
          `Use your full company email and assigned password.`,
        buttons: [
          { id: "reset_pw", title: "Reset Password" },
          { id: "human", title: "IT Help" },
        ],
      };

    case "reset_pw":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Password reset requested.",
        actionTaken: "Prompted for verification info.",
        replyText:
          `To reset your password, reply here with:\n\n` +
          `• *Your Full Name*\n` +
          `• *Employee / Intern ID*\n\n` +
          `We'll verify and send new credentials to this chat.`,
        buttons: [
          { id: "open_webmail", title: "Try Login Again" },
          { id: "human", title: "Talk to IT" },
        ],
      };

    case "restart":
    case "start":
    case "menu":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "User requested main menu.",
        actionTaken: "Dispatched main menu.",
        replyText: `How can we help you today? Tap below to explore:`,
        list: {
          header: "Tauqeer Mustafa Inc",
          buttonText: "Menu Options",
          rows: [
            { id: "web", title: "Web & Platforms", description: "Web apps, SaaS portals & APIs" },
            { id: "ai", title: "AI & Automation", description: "Copilots, agents & automated workflows" },
            { id: "cybersecurity", title: "Cybersecurity", description: "Security audits & incident defense" },
            { id: "cloud", title: "Cloud & DevOps", description: "Cloud infrastructure, scaling & CI/CD" },
            { id: "uiux", title: "UI/UX & Product", description: "Product design & design systems" },
            { id: "client_services", title: "Client Desk", description: "Retainers, deliverables & billing" },
            { id: "careers", title: "Careers & Internships", description: "Open positions & engineering roles" },
            { id: "human", title: "Speak to Principal", description: "Direct consultation with a lead engineer" },
          ],
        },
      };

    default:
      return null;
  }
}

/**
 * OmniAssistant Resolver: Short, human, and direct
 */
export async function resolveStaffOrCustomerQuery(params: {
  text: string;
  senderName?: string;
  channel: "whatsapp" | "email" | "contact_form";
  extraData?: Record<string, any>;
  allowFallback?: boolean;
}): Promise<TriageResult> {
  const { text, senderName, channel, allowFallback = false } = params;
  const lower = text.toLowerCase().trim();
  const shortName = getShortName(senderName);
  const extractedEmails = extractEmails(text);

  // 0. Check if user sent text matching a capability
  const serviceMatches: Record<string, string> = {
    "ai & automation": "ai",
    "custom copilots": "ai",
    "web & platforms": "web",
    "cybersecurity": "cybersecurity",
    "cloud & devops": "cloud",
    "ui/ux": "uiux",
    "client desk": "client_services",
    "client account": "client_services",
    "careers & internships": "careers",
    "careers": "careers",
    "speak to principal": "human",
    "talk to a principal": "human",
  };

  for (const [phrase, key] of Object.entries(serviceMatches)) {
    if (lower === phrase || lower.startsWith(phrase)) {
      const matched = handleButtonClick(key, senderName);
      if (matched) return matched;
    }
  }

  // Check for explicit staff/intern requests
  const isExplicitStaff =
    lower.startsWith("/staff") ||
    lower.startsWith("staff:") ||
    lower.startsWith("/task") ||
    lower.includes("intern quota") ||
    lower.includes("b2b sheet") ||
    lower.includes("webmail login") ||
    lower.includes("daily quota");

  // 1. Detect Email Delivery / Mailer Daemon failures (Explicit staff only)
  const isEmailBounce =
    lower.includes("mailer-daemon") ||
    lower.includes("delivery status notification") ||
    (isExplicitStaff && (lower.includes("bounced") || lower.includes("mail not sending") || lower.includes("failed")));

  if (isEmailBounce) {
    let mxChecks: Record<string, { valid: boolean; exchange?: string; error?: string }> = {};
    if (extractedEmails.length > 0) {
      mxChecks = await checkEmailDomains(extractedEmails);
    }

    const emailSummary = Object.entries(mxChecks)
      .map(([em, res]) => {
        if (!res.valid) {
          return `• *${em}*: Mailbox invalid or domain inactive`;
        }
        if (res.exchange?.includes("ppe-hosted") || res.exchange?.includes("proofpoint")) {
          return `• *${em}*: Blocked by corporate Proofpoint firewall`;
        }
        if (res.exchange?.includes("hostinger")) {
          return `• *${em}*: Hostinger mailbox does not exist`;
        }
        return `• *${em}*: Server rejected message`;
      })
      .join("\n");

    const reply =
      `Hey${shortName}! Looked into those bounced emails:\n\n` +
      (emailSummary ? `${emailSummary}\n\n` : "") +
      `*What to do:*\n` +
      `1. *Don't retry* these addresses (it hurts our domain reputation).\n` +
      `2. *Mark them Invalid* in your spreadsheet.\n` +
      `3. *No attachments* on first cold emails (filters drop them).\n` +
      `4. *Keep going* with the rest of your list!`;

    return {
      category: "EMAIL_BOUNCE",
      diagnosis: `Hard bounce detected for ${extractedEmails.join(", ") || "reported emails"}`,
      actionTaken: "Inspected MX gateway and shared concise instructions.",
      replyText: reply,
      buttons: [
        { id: "staff_tasks", title: "View Tasks" },
        { id: "staff_next_batch", title: "Report Progress" },
        { id: "human", title: "Talk to Lead" },
      ],
      emailDetails: { addresses: extractedEmails, mxChecks },
    };
  }

  // 2. Credentials & Login Support (Explicit staff webmail only)
  const isCredentialIssue =
    lower.includes("webmail.tauqeermustafa") ||
    (isExplicitStaff && (lower.includes("password") || lower.includes("credentials") || lower.includes("webmail") || lower.includes("login")));

  if (isCredentialIssue) {
    const reply =
      `Hey${shortName}! To log into your company email:\n\n` +
      `🌐 *Webmail:* https://webmail.tauqeermustafa.tech\n\n` +
      `Use your full email and onboarding password.\n` +
      `Need a password reset? Tap below:`;

    return {
      category: "CREDENTIALS",
      diagnosis: "Login/credential assistance.",
      actionTaken: "Provided portal links and reset options.",
      replyText: reply,
      buttons: [
        { id: "open_webmail", title: "Open Webmail" },
        { id: "reset_pw", title: "Reset Password" },
        { id: "human", title: "Talk to IT" },
      ],
    };
  }

  // 3. Task Management & B2B Progress (Explicit staff only)
  const isTaskIssue =
    lower.startsWith("/task") ||
    (isExplicitStaff && (lower.includes("task") || lower.includes("quota") || lower.includes("assignment") || lower.includes("submission")));

  if (isTaskIssue) {
    const reply =
      `Hey${shortName}! Here's your task summary:\n\n` +
      `• *Daily Quota:* 30–50 verified outreaches\n` +
      `• *Log Deadline:* By 6:00 PM PKT in your Google Sheet\n` +
      `• Always verify leads before sending!`;

    return {
      category: "TASK_ASSIGNMENT",
      diagnosis: "Task allocation or progress check.",
      actionTaken: "Sent quick task summary.",
      replyText: reply,
      buttons: [
        { id: "submit_progress", title: "Submit Report" },
        { id: "week2_tasks", title: "Next Batch" },
        { id: "human", title: "Ask Lead" },
      ],
    };
  }

  // 4. Contact Form Inquiries
  if (channel === "contact_form") {
    const serviceRequested = params.extraData?.service || "Engineering & Systems";
    const reply =
      `Hello ${senderName || "there"}!\n\n` +
      `Thanks for reaching out to *Tauqeer Mustafa Inc* regarding *${serviceRequested}*.\n\n` +
      `We've received your note and our technical team is reviewing it. We'll reply within 2 business hours.\n\n` +
      `Best regards,\n` +
      `*Tauqeer Mustafa Inc*`;

    return {
      category: "CONTACT_FORM",
      diagnosis: `Website inquiry from ${senderName || "visitor"} for ${serviceRequested}`,
      actionTaken: "Acknowledged inquiry.",
      replyText: reply,
    };
  }

  // 5. Explicit Greeting / Initial Visitor Contact (Exact matches only)
  const isGreeting =
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "salam" ||
    lower === "aoa" ||
    lower === "assalam o alaikum" ||
    lower === "menu" ||
    lower === "start" ||
    lower === "options" ||
    lower === "help";

  if (isGreeting) {
    const reply =
      `Hi${shortName}! Welcome to *Tauqeer Mustafa Inc*.\n\n` +
      `We build high-performance software, custom AI systems, and cloud architecture.\n\n` +
      `What can we help you build today?`;

    return {
      category: "GENERAL_SUPPORT",
      diagnosis: "Initial greeting.",
      actionTaken: "Dispatched clean options menu.",
      replyText: reply,
      list: {
        header: "Tauqeer Mustafa Inc",
        buttonText: "Explore Options",
        rows: [
          { id: "web", title: "Web & Platforms", description: "Web apps, SaaS portals & APIs" },
          { id: "ai", title: "AI & Automation", description: "Copilots, agents & automated workflows" },
          { id: "cybersecurity", title: "Cybersecurity", description: "Audits, posture & defense" },
          { id: "cloud", title: "Cloud & DevOps", description: "Cloud infrastructure, scaling & CI/CD" },
          { id: "uiux", title: "UI/UX & Product", description: "Product design & design systems" },
          { id: "client_services", title: "Client Desk", description: "Retainers, billing & support" },
          { id: "careers", title: "Careers & Internships", description: "Open roles & engineering positions" },
          { id: "human", title: "Speak to Principal", description: "Direct consultation with lead engineer" },
        ],
      },
    };
  }

  // If allowFallback is false, let custom keyword rules evaluate
  if (!allowFallback) {
    return {
      category: "UNKNOWN",
      diagnosis: "No specialized intent matched; deferring to rules.",
      actionTaken: "Defer to custom keyword rules.",
      replyText: "",
    };
  }

  // 6. Intelligent Generative AI Client Response (Deep, Professional & Prestigious)
  try {
    const aiResponse = await generateProfessionalClientReply(text, senderName);
    if (aiResponse && aiResponse.trim()) {
      return {
        category: "GENERAL_SUPPORT",
        diagnosis: "Generative AI technical consultation dispatched.",
        actionTaken: "Generated authoritative senior architect response via Gemini.",
        replyText: aiResponse.trim(),
      };
    }
  } catch {}

  // Default fallback for custom text/briefings
  const reply =
    `Thanks${shortName}! Received your briefing:\n` +
    `> "${text.slice(0, 120)}${text.length > 120 ? "..." : ""}"\n\n` +
    `Our principal engineering team reviews every brief directly and will reply in this chat shortly.`;

  return {
    category: "GENERAL_SUPPORT",
    diagnosis: "General inquiry.",
    actionTaken: "Sent direct acknowledgement.",
    replyText: reply,
  };
}
