import { env } from "@/config/env";

export const appConfig = {
  name: "Tauqeer Mustafa Inc.",
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
  apiTimeoutMs: 15000,
} as const;
