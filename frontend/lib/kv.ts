/**
 * Upstash Redis client for WhatsApp data storage.
 *
 * Setup:
 * 1. Go to vercel.com/dashboard → your project → Storage → Create Database → Upstash Redis
 * 2. Vercel automatically adds KV_REST_API_URL and KV_REST_API_TOKEN to your env
 * 3. Deploy — no manual env var setup needed
 *
 * Local dev: create .env.local with the two vars (copy from Vercel dashboard)
 */

import { Redis } from "@upstash/redis";

// Check if KV is configured
const isConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Upstash Redis client (reads from env automatically)
export const kv = isConfigured
  ? new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  : null;

export const isKVConfigured = isConfigured;

// Storage keys
export const KEYS = {
  messages: "whatsapp:messages",
  rules: "whatsapp:rules",
  templates: "whatsapp:templates",
  conversations: "whatsapp:conversations",
};
