import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000"),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsedEnv.success) {
  throw new Error("Invalid frontend environment configuration");
}

export const env = parsedEnv.data;

export type FrontendEnv = typeof env;
