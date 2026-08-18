/**
 * GET /api/whatsapp/rules
 * PUT /api/whatsapp/rules
 * Auto-reply rules storage (Upstash Redis when configured, otherwise defaults)
 */
import { NextResponse } from "next/server";
import { kv, KEYS, isKVConfigured } from "@/lib/kv";

const DEFAULT_RULES = [
  {
    id: "welcome",
    keyword: "hi, hello, hey, salam, assalam o alaikum, assalamualaikum",
    mode: "contains",
    reply: "👋 *Welcome to Tauqeer Mustafa Inc!*\n\nThank you for reaching out. How can we help you today?\n\nQuick options:\n• Reply *services* to see what we offer\n• Reply *pricing* for our rates\n• Reply *contact* to speak with our team\n• Reply *hours* for business hours",
    enabled: true,
  },
  {
    id: "services",
    keyword: "services, what do you do, what do you offer, products",
    mode: "contains",
    reply: "🚀 *Our Services*\n\nWe specialize in:\n\n✓ *Web Development* - Custom websites & web apps\n✓ *Mobile Apps* - iOS & Android development\n✓ *UI/UX Design* - Beautiful, user-friendly interfaces\n✓ *E-commerce* - Online stores & payment integration\n✓ *API Development* - Backend systems & integrations\n\nReply *pricing* for rates or *contact* to discuss your project!",
    enabled: true,
  },
  {
    id: "pricing",
    keyword: "price, pricing, cost, how much, rates, budget, quote",
    mode: "contains",
    reply: "💰 *Pricing & Quotes*\n\nOur pricing is tailored to your specific needs:\n\n📱 *Mobile Apps* - Starting from $5,000\n🌐 *Websites* - Starting from $2,000\n🎨 *Design Projects* - Starting from $1,000\n⚡ *Hourly Rate* - $50-150/hour\n\nEvery project is unique! Share your requirements and we'll send you a detailed quote within 24 hours.\n\nReady to start? Reply *yes* or send us your project details!",
    enabled: true,
  },
  {
    id: "hours",
    keyword: "hours, timing, open, schedule, available, when",
    mode: "contains",
    reply: "🕒 *Business Hours*\n\n📅 Monday - Friday: 9:00 AM - 6:00 PM (PKT)\n📅 Saturday: 10:00 AM - 4:00 PM (PKT)\n📅 Sunday: Closed\n\n⚡ *Response Time*\nWe typically respond within 2-4 hours during business hours.\n\nFor urgent matters, reply *urgent* and we'll prioritize your request!",
    enabled: true,
  },
  {
    id: "contact",
    keyword: "contact, reach, call, email, phone, speak, talk",
    mode: "contains",
    reply: "📞 *Get in Touch*\n\n*Tauqeer Mustafa Inc*\n\n📧 Email: contact@tauqeermustafa.tech\n🌐 Website: https://tauqeermustafa.tech\n💼 LinkedIn: tauqeer-mustafa\n\n*Prefer a call?*\nSend us your best time and phone number, and we'll call you within 24 hours!\n\nOr simply continue chatting here - we're here to help! 💬",
    enabled: true,
  },
  {
    id: "portfolio",
    keyword: "portfolio, work, projects, examples, past work, cases",
    mode: "contains",
    reply: "🎨 *Our Portfolio*\n\nWe've built amazing projects for clients worldwide!\n\n✨ Check out our work:\n👉 https://tauqeermustafa.tech\n\nOur specialties:\n• E-commerce platforms\n• SaaS applications\n• Mobile apps (iOS & Android)\n• Corporate websites\n• Custom integrations\n\nInterested in something similar? Reply *yes* and let's discuss your vision!",
    enabled: true,
  },
  {
    id: "urgent",
    keyword: "urgent, emergency, asap, immediately, now, critical",
    mode: "contains",
    reply: "🚨 *Urgent Request Received*\n\nWe've flagged your message as HIGH PRIORITY.\n\nA team member will respond within the next 30 minutes during business hours.\n\nIf this is outside business hours, we'll contact you first thing in the morning.\n\nPlease share:\n1️⃣ Brief description of the issue\n2️⃣ Your contact number\n3️⃣ Best time to reach you\n\nThank you for your patience! 🙏",
    enabled: true,
  },
  {
    id: "thanks",
    keyword: "thank, thanks, appreciate, grateful",
    mode: "contains",
    reply: "😊 You're very welcome!\n\nIs there anything else we can help you with?\n\n• Reply *services* to see what we offer\n• Reply *pricing* for rates\n• Reply *contact* to get in touch\n\nWe're here whenever you need us! 💙",
    enabled: true,
  },
];

export async function GET() {
  try {
    if (!isKVConfigured) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_RULES,
        notice: "Using default rules — KV not configured",
      });
    }

    let rules = await kv!.get<any[]>(KEYS.rules);

    // Initialize with defaults if empty
    if (!rules || rules.length === 0) {
      rules = DEFAULT_RULES;
      await kv!.set(KEYS.rules, rules);
    }

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error("[rules] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load rules", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rules } = body;

    if (!Array.isArray(rules)) {
      return NextResponse.json(
        { success: false, error: "Rules must be an array" },
        { status: 400 }
      );
    }

    if (!isKVConfigured) {
      return NextResponse.json({
        success: true,
        notice: "KV not configured — rules not persisted",
      });
    }

    await kv!.set(KEYS.rules, rules);
    return NextResponse.json({
      success: true,
      message: "Rules saved successfully",
    });
  } catch (error) {
    console.error("[rules] PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save rules", detail: String(error) },
      { status: 500 }
    );
  }
}
