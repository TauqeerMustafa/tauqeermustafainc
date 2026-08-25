/**
 * GET    /api/whatsapp/templates
 * POST   /api/whatsapp/templates
 * DELETE /api/whatsapp/templates
 * Saved message templates (Upstash Redis when configured, otherwise defaults)
 */
import { NextResponse } from "next/server";
import { kv, KEYS, isKVConfigured } from "@/lib/kv";

const DEFAULT_TEMPLATES = [
  {
    name: "welcome_new_lead",
    text: "👋 Hi there!\n\nThank you for your interest in *Tauqeer Mustafa Inc*!\n\nWe're excited to learn about your project. To help us serve you better, could you please share:\n\n1️⃣ What type of project are you planning? (Website, App, Design, etc.)\n2️⃣ Your timeline\n3️⃣ Your approximate budget\n\nLooking forward to working with you! 🚀"
  },
  {
    name: "quote_sent",
    text: "✅ *Quote Sent Successfully*\n\nThank you for your patience!\n\nWe've sent a detailed proposal to your email. Please check your inbox (and spam folder just in case).\n\n📋 The quote includes:\n• Project scope & deliverables\n• Timeline & milestones\n• Pricing breakdown\n• Payment terms\n\nQuestions? Reply here or call us directly!\n\n*Valid for 30 days*"
  },
  {
    name: "project_started",
    text: "🎉 *Project Kickoff - Welcome Aboard!*\n\nWe're thrilled to start working on your project!\n\n✅ *Next Steps:*\n1. You'll receive access to our project portal\n2. Kickoff meeting scheduled (check your email)\n3. Weekly progress updates every Friday\n\n📞 *Your Project Manager:*\nYou'll be assigned a dedicated PM within 24 hours.\n\nExciting times ahead! Let's build something amazing together! 💪"
  },
  {
    name: "payment_reminder",
    text: "💳 *Payment Reminder*\n\nHi there!\n\nThis is a friendly reminder that payment for [PROJECT_NAME] is due.\n\n💰 *Amount Due:* $[AMOUNT]\n📅 *Due Date:* [DATE]\n\n*Payment Methods:*\n• Bank Transfer\n• PayPal\n• Credit Card\n\nOnce payment is confirmed, we'll proceed with the next milestone!\n\nQuestions? We're here to help! 😊"
  },
  {
    name: "milestone_complete",
    text: "✨ *Milestone Completed!*\n\n🎯 We've completed [MILESTONE_NAME] for your project!\n\n👀 *Review & Feedback:*\nPlease check the deliverables and share your feedback:\n🔗 [PREVIEW_LINK]\n\n✅ Once approved, we'll move to the next phase\n📝 Need changes? Let us know - revisions are included!\n\n*Typical response time: 24-48 hours*\n\nThank you for being an amazing client! 🙏"
  },
  {
    name: "project_delivered",
    text: "🚀 *Project Successfully Delivered!*\n\nCongratulations! Your project is now LIVE! 🎉\n\n✅ *What's Included:*\n• Complete source code\n• Documentation\n• 30-day free support\n• Training materials\n\n📦 *Access Details:*\nCheck your email for login credentials and hosting information.\n\n💙 *We'd Love Your Feedback!*\nYour review helps us serve you better.\n\nThank you for trusting us with your project! 🙏"
  },
  {
    name: "meeting_reminder",
    text: "📅 *Meeting Reminder*\n\nHi!\n\nFriendly reminder about our upcoming meeting:\n\n🕐 *Date & Time:* [DATE] at [TIME]\n📍 *Platform:* [ZOOM/GOOGLE_MEET/etc.]\n🔗 *Link:* [MEETING_LINK]\n\n📋 *Agenda:*\n• [TOPIC_1]\n• [TOPIC_2]\n• [TOPIC_3]\n\nSee you soon! 👋"
  },
  {
    name: "follow_up",
    text: "👋 *Following Up*\n\nHi there!\n\nI wanted to check in regarding [TOPIC/PROJECT].\n\nAre you still interested in moving forward? We're here to answer any questions you might have!\n\n💬 *Let's discuss:*\n• Your requirements\n• Timeline\n• Budget\n• Next steps\n\nLooking forward to hearing from you! 😊"
  },
  {
    name: "out_of_office",
    text: "🏖️ *Out of Office*\n\nThank you for your message!\n\nWe're currently out of office and will return on [DATE].\n\n🚨 *For urgent matters:*\nEmail: urgent@tauqeermustafa.tech\nPhone: [EMERGENCY_NUMBER]\n\nWe'll respond to all messages within 24 hours of our return.\n\nThank you for your understanding! 🙏"
  },
  {
    name: "thank_you",
    text: "🙏 *Thank You!*\n\nWe truly appreciate your business and trust in *Tauqeer Mustafa Inc*!\n\n✨ *It's been a pleasure working with you.*\n\n💡 *Future Projects?*\nWe're here whenever you need:\n• Updates or maintenance\n• New features\n• Additional projects\n\n📞 Stay in touch:\n🌐 tauqeermustafa.tech\n📧 contact@tauqeermustafa.tech\n\nWishing you continued success! 🚀"
  },
  {
    name: "support_ticket",
    text: "🎫 *Support Ticket Created*\n\n✅ We've received your support request!\n\n*Ticket #[TICKET_NUMBER]*\n*Issue:* [BRIEF_DESCRIPTION]\n*Priority:* [HIGH/MEDIUM/LOW]\n\n⏱️ *Response Time:*\n• High Priority: 2-4 hours\n• Medium: 24 hours\n• Low: 48 hours\n\nWe'll keep you updated on progress!\n\nThank you for your patience! 🙏"
  },
  {
    name: "hours",
    text: "🕒 *Business Hours*\n\n📅 Monday - Friday: 9:00 AM - 6:00 PM (PKT)\n📅 Saturday: 10:00 AM - 4:00 PM (PKT)\n📅 Sunday: Closed\n\n⚡ We typically respond within 2-4 hours during business hours.\n\nFor urgent matters, please mention 'URGENT' in your message!"
  },
];

export async function GET() {
  try {
    if (!isKVConfigured) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_TEMPLATES,
        notice: "Using default templates — KV not configured",
      });
    }

    let templates = await kv!.get<any[]>(KEYS.templates);

    // Initialize with defaults if empty
    if (!templates || templates.length === 0) {
      templates = DEFAULT_TEMPLATES;
      await kv!.set(KEYS.templates, templates);
    }

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("[templates] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load templates", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, text } = body;

    if (!name || !text) {
      return NextResponse.json(
        { success: false, error: "Name and text required" },
        { status: 400 }
      );
    }

    if (!isKVConfigured) {
      return NextResponse.json({
        success: true,
        notice: "KV not configured — template not persisted",
      });
    }

    const templates = (await kv!.get<any[]>(KEYS.templates)) || [];

    // Check if template exists, update or add
    const existingIndex = templates.findIndex((t) => t.name === name);
    if (existingIndex >= 0) {
      templates[existingIndex] = { name, text };
    } else {
      templates.push({ name, text });
    }

    await kv!.set(KEYS.templates, templates);
    return NextResponse.json({
      success: true,
      message: "Template saved successfully",
    });
  } catch (error) {
    console.error("[templates] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save template", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name required" },
        { status: 400 }
      );
    }

    if (!isKVConfigured) {
      return NextResponse.json({
        success: true,
        notice: "KV not configured — template not deleted",
      });
    }

    const templates = (await kv!.get<any[]>(KEYS.templates)) || [];
    const filtered = templates.filter((t) => t.name !== name);

    await kv!.set(KEYS.templates, filtered);
    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("[templates] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template", detail: String(error) },
      { status: 500 }
    );
  }
}
