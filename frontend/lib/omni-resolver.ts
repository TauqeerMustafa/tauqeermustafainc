import dns from "node:dns";
import dnsPromises from "node:dns/promises";

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
          `• *Hotline:* +92 335 6701199\n\n` +
          `Drop your company name or contract details here and we'll help you right away.`,
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
          `You're through to Tauqeer Mustafa (Principal Engineer). 👋\n\n` +
          `I'm right here in this chat! Tell me what you're looking to build or solve.\n\n` +
          `• *Direct Hotline:* +92 335 6701199 (Mon–Sat, 09:00–18:00 PKT)\n\n` +
          `Drop your message or send a voice note below, and I'll reply directly!`,
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
          `🚨 *Emergency Alert Received*\n\n` +
          `Our on-call incident team has been alerted.\n\n` +
          `• *Direct 24/7 Hotline:* +92 335 6701199\n\n` +
          `Please share your affected website/IP and symptoms below:`,
        buttons: [
          { id: "human", title: "Call Hotline" },
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

  // 1. Detect Email Delivery / Mailer Daemon failures
  const isEmailBounce =
    lower.includes("error occurs") ||
    lower.includes("delivery status") ||
    lower.includes("permanently rejected") ||
    lower.includes("mailer-daemon") ||
    lower.includes("bounced") ||
    lower.includes("mail not sending") ||
    lower.includes("destination server") ||
    (extractedEmails.length > 0 && (lower.includes("sent") || lower.includes("failed") || lower.includes("last two")));

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

  // 2. Credentials & Login Support
  const isCredentialIssue =
    lower.includes("password") ||
    lower.includes("login") ||
    lower.includes("credentials") ||
    lower.includes("access") ||
    lower.includes("portal") ||
    lower.includes("sign in");

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

  // 3. Task Management & B2B Progress
  const isTaskIssue =
    lower.includes("task") ||
    lower.includes("b2b") ||
    lower.includes("progress") ||
    lower.includes("assignment") ||
    lower.includes("submission") ||
    lower.includes("week 1") ||
    lower.includes("week 2");

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
      `• *Hotline:* +92 335 6701199 (Mon–Sat, 09:00–18:00 PKT)\n\n` +
      `Best regards,\n` +
      `*Tauqeer Mustafa Inc*`;

    return {
      category: "CONTACT_FORM",
      diagnosis: `Website inquiry from ${senderName || "visitor"} for ${serviceRequested}`,
      actionTaken: "Acknowledged inquiry.",
      replyText: reply,
    };
  }

  // 5. Explicit Greeting / Initial Visitor Contact
  const isGreeting =
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "salam" ||
    lower === "menu" ||
    lower === "start" ||
    lower === "options" ||
    lower === "help" ||
    lower.startsWith("hi ") ||
    lower.startsWith("hello ") ||
    lower.startsWith("hey ");

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

  // Default fallback for custom text/briefings
  const reply =
    `Thanks${shortName}! Received your note:\n` +
    `> "${text.slice(0, 120)}${text.length > 120 ? "..." : ""}"\n\n` +
    `Our lead engineer is reviewing this and will reply directly in this chat shortly.\n` +
    `For immediate assistance: +92 335 6701199.`;

  return {
    category: "GENERAL_SUPPORT",
    diagnosis: "General inquiry.",
    actionTaken: "Sent direct acknowledgement.",
    replyText: reply,
  };
}
