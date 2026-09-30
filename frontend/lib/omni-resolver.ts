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

/**
 * Friendly humanized greeting based on time of day and sender
 */
function getHumanGreeting(name?: string): string {
  const hour = new Date().getHours();
  let timeSalutation = "Good day";
  if (hour >= 5 && hour < 12) timeSalutation = "Good morning";
  else if (hour >= 12 && hour < 17) timeSalutation = "Good afternoon";
  else if (hour >= 17 && hour < 22) timeSalutation = "Good evening";

  if (name && name.trim()) {
    const cleanName = name.replace(/[^a-zA-Z\s]/g, "").trim().split(" ")[0] || name.trim();
    return `Hi ${cleanName}! 😊 ${timeSalutation}.`;
  }
  return `Hello there! 😊 ${timeSalutation}.`;
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
      results[email] = { valid: false, error: "Invalid email structure" };
      continue;
    }

    try {
      const records = await dnsPromises.resolveMx(domain);
      if (records && records.length > 0) {
        records.sort((a, b) => a.priority - b.priority);
        results[email] = { valid: true, exchange: records[0].exchange };
      } else {
        results[email] = { valid: false, error: "No MX records found for domain" };
      }
    } catch (err: any) {
      results[email] = { valid: false, error: err?.code || "Domain cannot receive mail" };
    }
  }

  return results;
}

/**
 * Handle quick interactive button taps
 */
export function handleButtonClick(choiceId: string, name?: string): TriageResult | null {
  const greeting = getHumanGreeting(name);

  switch (choiceId) {
    case "staff_tasks":
    case "week2_tasks":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Staff requested active task queue.",
        actionTaken: "Shared task sheet protocol and assignment links.",
        replyText:
          `${greeting}\n\n` +
          `Here is your active task briefing:\n` +
          `• *Task Spreadsheet:* Please refer to your assigned B2B Tracker in the group description.\n` +
          `• *Quota Target:* 30–50 verified outreaches daily.\n` +
          `• *Submissions:* Log your daily completed entries by 6:00 PM PKT.\n\n` +
          `What would you like to do next?`,
        buttons: [
          { id: "submit_progress", title: "Submit Report" },
          { id: "staff_next_batch", title: "Request Leads" },
          { id: "human", title: "Speak to Lead" },
        ],
      };

    case "staff_next_batch":
    case "submit_progress":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Staff reporting progress or requesting next lead allocation.",
        actionTaken: "Prompted for spreadsheet link and confirmation.",
        replyText:
          `${greeting}\n\n` +
          `Great work keeping up the momentum! 🚀\n\n` +
          `Please reply with your *Google Sheet link* and *number of verified emails sent today*.\n\n` +
          `Our team will review your batch and allocate your next queue right away.`,
        buttons: [
          { id: "staff_tasks", title: "View Guidelines" },
          { id: "human", title: "Talk with Lead" },
        ],
      };

    case "open_webmail":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "Staff requested webmail link.",
        actionTaken: "Provided direct portal link and guidance.",
        replyText:
          `${greeting}\n\n` +
          `You can log into your official corporate inbox anytime here:\n` +
          `🌐 *Webmail Portal:* https://webmail.tauqeermustafa.tech\n\n` +
          `Use your full email (e.g. yourname@tauqeermustafa.tech) and your provided password.`,
        buttons: [
          { id: "reset_pw", title: "Reset Password" },
          { id: "human", title: "Need IT Help" },
        ],
      };

    case "reset_pw":
      return {
        category: "BUTTON_CLICK",
        diagnosis: "User requested password reset assistance.",
        actionTaken: "Provided password reset instructions.",
        replyText:
          `${greeting}\n\n` +
          `No worries at all! Let's get your access restored.\n\n` +
          `Please reply with your *Full Name* and *Employee/Intern ID*, and our IT desk will verify and send your temporary credentials directly to this chat.`,
        buttons: [
          { id: "open_webmail", title: "Try Login Again" },
          { id: "human", title: "Talk to IT Lead" },
        ],
      };

    default:
      return null;
  }
}

/**
 * OmniAssistant Resolver: Humanized with Interactive Buttons & Lists
 */
export async function resolveStaffOrCustomerQuery(params: {
  text: string;
  senderName?: string;
  channel: "whatsapp" | "email" | "contact_form";
  extraData?: Record<string, any>;
}): Promise<TriageResult> {
  const { text, senderName, channel } = params;
  const lower = text.toLowerCase();
  const greeting = getHumanGreeting(senderName);
  const extractedEmails = extractEmails(text);

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
          return `• *${em}*: ❌ Domain is inactive or has no mail exchange (${res.error})`;
        }
        if (res.exchange?.includes("ppe-hosted") || res.exchange?.includes("proofpoint")) {
          return `• *${em}*: 🛡️ Protected by Proofpoint Firewall (Strict enterprise filter dropped unverified/cold mail)`;
        }
        if (res.exchange?.includes("hostinger")) {
          return `• *${em}*: ⚠️ Hostinger Mailbox rejected (Mailbox does not exist or disabled)`;
        }
        return `• *${em}*: ⚠️ Recipient server rejected delivery (${res.exchange})`;
      })
      .join("\n");

    const reply =
      `${greeting}\n\n` +
      `I've looked into this mail delivery notice for you right away! 🔍\n\n` +
      (emailSummary ? `${emailSummary}\n\n` : "") +
      `*What happened:* Those emails ran into a *Permanent Hard Bounce*. The recipient mail servers refused them because the mailboxes do not exist, were closed, or are blocked by enterprise security firewalls.\n\n` +
      `*Simple steps for you right now:*\n` +
      `1. *Do NOT retry* those specific addresses (repeated attempts hurt our domain reputation).\n` +
      `2. *Mark as Invalid* in your sheet so your stats remain clean.\n` +
      `3. *No attachments* on first cold emails (enterprise firewalls instantly flag them).\n` +
      `4. *Keep going!* You can safely continue sending to the rest of your list.\n\n` +
      `How would you like to proceed?`;

    return {
      category: "EMAIL_BOUNCE",
      diagnosis: `Hard bounce detected for ${extractedEmails.join(", ") || "reported emails"}`,
      actionTaken: "Extracted recipient addresses, inspected live MX gateway, and provided humanized guidelines.",
      replyText: reply,
      buttons: [
        { id: "staff_tasks", title: "View My Tasks" },
        { id: "staff_next_batch", title: "Report Progress" },
        { id: "human", title: "Speak to Lead" },
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
      `${greeting}\n\n` +
      `I'm here to help you access your accounts quickly!\n\n` +
      `• *Webmail:* Log into your official inbox at https://webmail.tauqeermustafa.tech\n` +
      `• *Format:* Enter your full email address and the password assigned during onboarding.\n\n` +
      `If you're still locked out, tap an option below:`;

    return {
      category: "CREDENTIALS",
      diagnosis: "User requested login/credential assistance.",
      actionTaken: "Provided direct portal links and reset options.",
      replyText: reply,
      buttons: [
        { id: "open_webmail", title: "Open Webmail" },
        { id: "reset_pw", title: "Reset Password" },
        { id: "human", title: "Talk to IT Lead" },
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
      `${greeting}\n\n` +
      `Hope your tasks are going smoothly today! 💼\n\n` +
      `Here is a quick overview:\n` +
      `• *Target Quota:* 30–50 verified outreach emails daily.\n` +
      `• *Reporting:* Update your batch logs by 6:00 PM PKT.\n` +
      `• *Quality Check:* Filter every email through a verification tool before sending.\n\n` +
      `Select what you'd like to do:`;

    return {
      category: "TASK_ASSIGNMENT",
      diagnosis: "Staff inquired about task allocation, progress, or guidelines.",
      actionTaken: "Dispatched humanized operations summary with action buttons.",
      replyText: reply,
      buttons: [
        { id: "submit_progress", title: "Submit Progress" },
        { id: "week2_tasks", title: "Next Batch" },
        { id: "human", title: "Ask Manager" },
      ],
    };
  }

  // 4. Contact Form Inquiries
  if (channel === "contact_form") {
    const serviceRequested = params.extraData?.service || "Custom Software & Systems";
    const reply =
      `Hello ${senderName || "there"}!\n\n` +
      `Thank you for reaching out to *Tauqeer Mustafa Inc* regarding *${serviceRequested}*.\n\n` +
      `Our technical advisory team has received your brief and is currently reviewing your specifications.\n\n` +
      `• *Summary of your request:* "${text.slice(0, 140)}${text.length > 140 ? "..." : ""}"\n` +
      `• *Expected Review:* Within 2 business hours.\n` +
      `• *Direct Hotline:* +92 335 6701199 (Mon–Sat, 09:00–18:00 PKT)\n\n` +
      `A principal engineer will follow up shortly to arrange a discovery call or deliver a tailored architecture proposal.\n\n` +
      `Warm regards,\n` +
      `*Tauqeer Mustafa Inc — Engineering & Advisory*`;

    return {
      category: "CONTACT_FORM",
      diagnosis: `Website inquiry received from ${senderName || "visitor"} for ${serviceRequested}`,
      actionTaken: "Processed intake review and scheduled discovery follow-up.",
      replyText: reply,
    };
  }

  // 5. General Greeting or Client Inquiries (Interactive List Menu)
  const isGreetingOrGeneral =
    lower.includes("hi") ||
    lower.includes("hello") ||
    lower.includes("hey") ||
    lower.includes("salam") ||
    lower.includes("info") ||
    lower.includes("service") ||
    text.length < 30;

  if (isGreetingOrGeneral) {
    const reply =
      `${greeting}\n\n` +
      `Welcome to *Tauqeer Mustafa Inc*. We build high-performance software, modern AI workflows, and resilient cloud architectures.\n\n` +
      `How can we support you today? Please tap below to explore our core solutions or speak directly with an engineer.`;

    return {
      category: "GENERAL_SUPPORT",
      diagnosis: "General inquiry or visitor greeting.",
      actionTaken: "Dispatched interactive capability menu list.",
      replyText: reply,
      list: {
        header: "Tauqeer Mustafa Inc Services",
        buttonText: "Explore Options",
        rows: [
          { id: "web", title: "Web & Platforms", description: "Modern web platforms, portals, apps & APIs" },
          { id: "ai", title: "AI & Automation", description: "Custom copilots, workflows & AI integrations" },
          { id: "cybersecurity", title: "Cybersecurity", description: "Security reviews, posture & defense" },
          { id: "cloud", title: "Cloud & DevOps", description: "Cloud infrastructure, scaling & CI/CD" },
          { id: "uiux", title: "UI/UX & Product", description: "User research, product design & systems" },
          { id: "client_services", title: "Client Desk", description: "Retainers, deliverables & billing support" },
          { id: "careers", title: "Careers & Internships", description: "Opportunities & engineering roles" },
          { id: "human", title: "Speak to Principal", description: "Direct consultation with a lead engineer" },
        ],
      },
    };
  }

  // Default fallback
  const reply =
    `${greeting}\n\n` +
    `Thanks for getting in touch! We have logged your request:\n` +
    `> "${text.slice(0, 120)}${text.length > 120 ? "..." : ""}"\n\n` +
    `Our engineering & support desk has been alerted and will follow up with you promptly.`;

  return {
    category: "GENERAL_SUPPORT",
    diagnosis: "General support request logged.",
    actionTaken: "Dispatched acknowledgment with quick action buttons.",
    replyText: reply,
    buttons: [
      { id: "human", title: "Speak to Lead" },
      { id: "web", title: "View Services" },
    ],
  };
}
