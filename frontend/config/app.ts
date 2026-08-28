import { env } from "@/config/env";

export const appConfig = {
  name: "Tauqeer Mustafa Inc.",
  siteUrl: "https://tauqeermustafa.tech",
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
  apiTimeoutMs: 60000,
} as const;
