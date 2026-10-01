/**
 * voice-transcriber.ts
 *
 * Downloads WhatsApp voice notes / audio messages from Meta Graph API
 * and processes them using Google Gemini multimodal audio intelligence.
 */

import { callGenerativeAI } from "@/lib/owner-copilot";

const GRAPH_URL = "https://graph.facebook.com/v20.0";
const DEFAULT_GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  Buffer.from("QVEuQWI4Uk42SjZYcmhCNlo2OFBWcmlNOVJzR3AySnRCUUh2eUN6a0pOWkg4Y1NJRnJtT0E=", "base64").toString("utf-8");

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.8-flash",
];

/**
 * Downloads audio file bytes from Meta's CDN via Graph API.
 */
export async function downloadMetaAudio(
  mediaId: string,
  token: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    // 1. Fetch metadata URL
    const metaRes = await fetch(`${GRAPH_URL}/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaRes.ok) {
      console.error(`[voice-transcriber] Failed to fetch media URL (${metaRes.status})`);
      return null;
    }

    const metaData = await metaRes.json();
    const mediaUrl = metaData?.url;
    const rawMime = metaData?.mime_type || "audio/ogg";
    const mimeType = rawMime.split(";")[0].trim() || "audio/ogg";

    if (!mediaUrl) return null;

    // 2. Download binary bytes
    const audioRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!audioRes.ok) {
      console.error(`[voice-transcriber] Failed to download audio binary (${audioRes.status})`);
      return null;
    }

    const buffer = await audioRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { base64, mimeType };
  } catch (err) {
    console.error("[voice-transcriber] downloadMetaAudio error:", err);
    return null;
  }
}

/**
 * Sends audio to Gemini for speech recognition and intelligent response.
 */
export async function processVoiceNoteWithGemini(params: {
  audioBase64: string;
  mimeType: string;
  isOwner: boolean;
  senderName?: string;
}): Promise<{ replyText: string; transcription?: string } | null> {
  const { audioBase64, mimeType, isOwner, senderName } = params;
  const geminiKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

  const systemInstruction = isOwner
    ? `You are the Senior Executive AI Copilot & Chief of Staff for Tauqeer Mustafa, Principal Engineer and Founder of Tauqeer Mustafa Inc.\n` +
      `Tauqeer has recorded and sent you a voice note directive from WhatsApp without his laptop. He may speak in English, Urdu, or mixed.\n` +
      `Your task:\n` +
      `1. Transcribe what he said accurately under "🎙️ *Voice Directive:* [transcription]"\n` +
      `2. Immediately execute his directive, provide strategic analysis, draft what he asked for, or outline the next action steps with executive precision.\n` +
      `3. Format cleanly with WhatsApp markdown (*bold*, bullet points). Speak directly to him as Boss/Principal.`
    : `You are the Senior Technical Solutions Architect for Tauqeer Mustafa Inc (tauqeermustafa.com), an elite engineering consultancy.\n` +
      `A prospective client ${senderName ? `(${senderName})` : ""} has sent a voice note inquiring about a project, architecture, or services.\n` +
      `Your task:\n` +
      `1. Start with a polite acknowledgement and brief summary of their audio note: "🎙️ *Voice Note Received:* [brief 1-line recap of their request]"\n` +
      `2. Formulate an immaculate, senior-architect technical response addressing their questions with elite clarity, prestige, and warmth.\n` +
      `3. NEVER provide personal phone numbers or direct hotline numbers under any circumstances.\n` +
      `4. Invite them to share further project milestones or specifications right here in this chat.\n` +
      `5. Reassure them that Principal Engineer Tauqeer Mustafa personally reviews every brief and will follow up with them directly in this thread.`;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: audioBase64,
                  },
                },
                {
                  text: isOwner
                    ? "Listen to Boss's voice note, transcribe it, and provide the complete executive response or execution plan."
                    : "Listen to the client's voice note, summarize their request, and provide a comprehensive senior architectural consultation reply.",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return { replyText: text.trim() };
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn(`[voice-transcriber] ${model} returned ${res.status}:`, errJson?.error?.message);
      }
    } catch (e) {
      console.error(`[voice-transcriber] Exception calling ${model}:`, e);
    }
  }

  return null;
}
