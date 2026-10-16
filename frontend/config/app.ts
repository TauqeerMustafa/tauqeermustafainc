import { env } from "@/config/env";

export const appConfig = {
  name: "Qorlune",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://qorlune.co.uk",
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
  apiTimeoutMs: 60000,
} as const;
