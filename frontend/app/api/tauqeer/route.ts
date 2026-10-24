import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  Buffer.from("QVEuQWI4Uk42SjZYcmhCNlo2OFBWcmlNOVJzR3AySnRCUUh2eUN6a0pOWkg4Y1NJRnJtT0E=", "base64").toString("utf-8");

const OPENEMAIL_API_KEY =
  process.env.OPENEMAIL_TECH_API_KEY || process.env.OPENEMAIL_API_KEY || "oek_QvxyNrk1tAOyYzAlisEuyRa5mP3LRxSJmaZc_vaJ7es";

const TAUQEER_MAILBOX_ID = "01M17137MJNRTDR5N92QCAND0P";
const PIPELINE_KEY = "tauqeer_personal_pipeline_v1";

let inMemoryPipeline: any[] = [];

async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
  const models = [
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
  ];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (err) {
      console.error(`Gemini model ${model} error:`, err);
    }
  }
  throw new Error("Gemini API rate limit or service busy");
}

function getCuratedProspects(niche: string, location: string): any[] {
  return [
    {
      id: "prospect_omnipulse",
      companyName: "OmniPulse Logistics",
      domain: "omnipulsetech.co.uk",
      industry: "Supply Chain & Logistics SaaS",
      targetRole: "Chief Technology Officer / VP Engineering",
      keyPainPoint: "Real-time fleet telemetry sync latency and bloated cloud microservice costs",
      valueAngle: "High-performance distributed event streaming & database optimization by Tauqeer Mustafa",
      estimatedDealSize: "£8,000 - £18,000"
    },
    {
      id: "prospect_vellum",
      companyName: "Vellum Capital Partners",
      domain: "vellumcapital.com",
      industry: "Fintech & Private Asset Management",
      targetRole: "Managing Director & Founder",
      keyPainPoint: "Manual investor onboarding and fragmented portfolio reporting workflows",
      valueAngle: "Automated institutional investor portal and autonomous AI reporting pipelines",
      estimatedDealSize: "£12,000 - £25,000"
    },
    {
      id: "prospect_aura_health",
      companyName: "Aura Digital Therapeutics",
      domain: "aurahealth.io",
      industry: "HealthTech & Telehealth SaaS",
      targetRole: "Founder & CEO",
      keyPainPoint: "HIPAA/GDPR compliance bottlenecks and slow mobile API response times",
      valueAngle: "Zero-trust backend modernization and low-latency API architecture refactoring",
      estimatedDealSize: "£10,000 - £22,000"
    },
    {
      id: "prospect_stride",
      companyName: "Stride Commerce Group",
      domain: "stridecommerce.co.uk",
      industry: "Direct-to-Consumer & Omnichannel Retail",
      targetRole: "Head of Digital Operations",
      keyPainPoint: "High customer acquisition costs coupled with legacy ERP sync bottlenecks during peak sales",
      valueAngle: "Headless Next.js edge storefront architecture and automated inventory sync pipelines",
      estimatedDealSize: "£7,500 - £16,000"
    },
    {
      id: "prospect_nexus_ai",
      companyName: "Nexus Legal Automation",
      domain: "nexuslegal.ai",
      industry: "LegalTech & Enterprise SaaS",
      targetRole: "Founding Partner / Head of Tech",
      keyPainPoint: "Unreliable off-the-shelf LLM wrappers causing document hallucination and security concerns",
      valueAngle: "Private enterprise RAG deployment with strict data governance engineered directly by Tauqeer",
      estimatedDealSize: "£14,000 - £30,000"
    }
  ];
}

export async function GET(req: NextRequest) {
  try {
    const kv = getKV();
    let data: any[] = [];
    if (kv) {
      data = (await kv.get<any[]>(PIPELINE_KEY)) || [];
    } else {
      data = inMemoryPipeline;
    }
    return NextResponse.json({ success: true, prospects: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. DISCOVER / GENERATE PROSPECTS
    if (action === "discover_prospects") {
      const { niche, location, count = 5 } = body;

      const systemPrompt = `You are an elite B2B sales researcher and executive talent partner for Qorlune (qorlune.co.uk).
Tauqeer Mustafa is a Senior Software Engineer, Technology Architect, and AI Operations Consultant specializing in:
- High-performance web and cloud architectures (Next.js, Python, PostgreSQL, Distributed Systems)
- Enterprise AI Workflows & Automation
- Reducing technical debt, replacing overpriced agency contracts, and scaling digital infrastructure.

Your task is to identify realistic, high-impact target companies and decision-maker roles in the specified niche and generate structured prospect profiles.
You MUST reply with ONLY valid JSON (an array of objects). Do NOT wrap in markdown fences if possible.`;

      const userPrompt = `Generate ${count} high-probability target client prospects in the niche: "${niche || "UK & US High-Growth B2B Startups & E-commerce"}", operating in "${location || "United Kingdom / Europe / North America"}".
For each prospect, return an object with:
- id: unique string
- companyName: Company Name
- domain: e.g. company.com
- industry: Specific sector
- targetRole: e.g. "Founder & CEO", "Chief Technology Officer"
- keyPainPoint: Specific technical or operational bottleneck
- valueAngle: The precise hook Tauqeer Mustafa brings to solve it
- estimatedDealSize: e.g. "£8,000 - £20,000"

Return as JSON array.`;

      let parsed: any[] = [];
      try {
        const raw = await callGemini(userPrompt, systemPrompt);
        const cleanJson = raw.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("Using curated fallback prospects:", e);
        parsed = getCuratedProspects(niche || "UK B2B Startups", location || "UK");
      }

      return NextResponse.json({ success: true, prospects: parsed });
    }

    // 2. DRAFT BESPOKE EMAIL VIA GEMINI
    if (action === "compose_email") {
      const { prospect, senderEmail = "admin@qorlune.co.uk" } = body;

      const systemPrompt = `You are Tauqeer Mustafa, Founder & Executive at Qorlune writing from your corporate executive email (${senderEmail}).
Tone: Sharp, respectful, founder-to-founder, concise (under 110 words), zero marketing fluff, zero buzzwords.
Value proposition: You build robust scalable software architectures, AI automated pipelines, and resolve critical bottlenecks without bloated agency overhead.
Goal: Offer a brief 10-minute diagnostic exchange or tailored architectural teardown.

Return ONLY a JSON object with:
{
  "subject": "Clear, curiosity-inducing subject line",
  "html": "Clean HTML formatted email body with paragraphs and professional signature",
  "text": "Plain text email body"
}`;

      const userPrompt = `Write an outreach email to:
Company: ${prospect.companyName} (${prospect.domain})
Target Decision Maker: ${prospect.targetRole} (${prospect.contactName || "Decision Maker"})
Pain Point: ${prospect.keyPainPoint}
Value Angle: ${prospect.valueAngle}
Sender: Tauqeer Mustafa | Qorlune (qorlune.co.uk)`;

      let emailContent = {
        subject: `Quick thought regarding ${prospect.companyName}'s engineering roadmap`,
        html: `<p>Hi there,</p><p>I've been closely following ${prospect.companyName} and your trajectory in ${prospect.industry}.</p><p>Given your focus on scaling, many teams run into friction around ${prospect.keyPainPoint}. As an independent software architect and AI engineer, I partner directly with founders to streamline high-throughput systems and eliminate technical bottlenecks without agency bloat.</p><p>Would you be open to a brief 10-minute conversation this Thursday to see if there is an angle worth exploring?</p><p>Best regards,<br><strong>Tauqeer Mustafa</strong><br>Founder &amp; Principal Architect<br><a href="https://qorlune.co.uk">qorlune.co.uk</a></p>`,
        text: `Hi there,\n\nI've been closely following ${prospect.companyName} and your trajectory in ${prospect.industry}.\n\nGiven your focus on scaling, many teams run into friction around ${prospect.keyPainPoint}. As an independent software architect and AI engineer, I partner directly with founders to streamline high-throughput systems and eliminate technical bottlenecks without agency bloat.\n\nWould you be open to a brief 10-minute conversation this Thursday to see if there is an angle worth exploring?\n\nBest regards,\nTauqeer Mustafa\nFounder & Principal Architect\ntauqeermustafa.com`
      };

      try {
        const raw = await callGemini(userPrompt, systemPrompt);
        const clean = raw.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
        emailContent = JSON.parse(clean);
      } catch (e) {
        console.warn("Using bespoke template draft:", e);
      }

      return NextResponse.json({ success: true, email: emailContent });
    }

    // 3. SEND DIRECTLY FROM TAUQEERMUSTAFA.COM MAILBOX
    if (action === "send_email") {
      const { toEmail, toName, subject, html, text, fromEmail = "admin@qorlune.co.uk", prospectId } = body;

      if (!toEmail) {
        return NextResponse.json({ success: false, error: "Recipient email is required" }, { status: 400 });
      }

      const payload = {
        from: {
          email: fromEmail,
          name: "Tauqeer Mustafa | Qorlune"
        },
        to: [{
          email: toEmail,
          name: toName || toEmail
        }],
        subject: subject,
        text: text,
        html: html
      };

      const url = `https://api.open.email/api/v1/mailboxes/${TAUQEER_MAILBOX_ID}/send?save=true`;
      const openEmailRes = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENEMAIL_API_KEY}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resText = await openEmailRes.text();
      let resJson: any = {};
      try { resJson = JSON.parse(resText); } catch {}

      if (!openEmailRes.ok) {
        return NextResponse.json({
          success: false,
          error: resJson?.error || `Open.email error (${openEmailRes.status}): ${resText}`
        }, { status: openEmailRes.status });
      }

      // Record in Pipeline
      const record = {
        id: prospectId || `lead_${Date.now()}`,
        toEmail,
        toName: toName || toEmail,
        subject,
        sentFrom: fromEmail,
        sentAt: new Date().toISOString(),
        deliveryId: resJson?.deliveryId || "queued",
        status: "sent"
      };

      const kv = getKV();
      if (kv) {
        const existing = (await kv.get<any[]>(PIPELINE_KEY)) || [];
        existing.unshift(record);
        await kv.set(PIPELINE_KEY, existing.slice(0, 200));
      } else {
        inMemoryPipeline.unshift(record);
      }

      return NextResponse.json({
        success: true,
        deliveryId: resJson?.deliveryId,
        record
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
