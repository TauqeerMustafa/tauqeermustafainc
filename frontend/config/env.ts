import { z } from "zod";

// Read the variable through a direct `process.env.NEXT_PUBLIC_API_URL` member
// expression. Next.js inlines NEXT_PUBLIC_* values into the client bundle by
// literal text substitution at build time - dynamic lookups such as
// `process.env[name]` or destructuring `process.env` are NOT inlined.
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

// `next build` runs with NODE_ENV=production, which is also the moment the
// value above is frozen into the browser bundle. If it is missing we must fail
// the build: shipping is the point of no return, because editing the variable
// afterwards does nothing to an already-built site.
if (process.env.NODE_ENV === "production" && !rawApiUrl) {
  throw new Error(
    [
      "NEXT_PUBLIC_API_URL is not set for this production build.",
      "",
      "Without it every browser API call (admin login, dashboard, contact",
      "form) would be hardcoded to http://localhost:8000 and fail with a",
      "network error for real visitors.",
      "",
      "Set it in Vercel -> Settings -> Environment Variables -> Production:",
      "  NEXT_PUBLIC_API_URL=https://tauqeer-inc-backend.onrender.com",
      "",
      "Then redeploy. NEXT_PUBLIC_* values are inlined at build time, so",
      "changing the variable alone will not affect a site that is already",
      "built - a new build is required.",
    ].join("\n"),
  );
}

const envSchema = z.object({
  // The localhost fallback is a development convenience only; the guard above
  // makes sure it can never reach a production bundle. Trailing slashes are
  // stripped so callers can always join paths as `${base}/auth/login` without
  // producing a double slash.
  NEXT_PUBLIC_API_URL: z
    .url()
    .default("http://localhost:8000")
    .transform((value) => value.replace(/\/+$/, "")),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: rawApiUrl,
});

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid frontend environment configuration:\n${details}\n\n` +
      "NEXT_PUBLIC_API_URL must be an absolute URL, e.g. " +
      "https://tauqeer-inc-backend.onrender.com",
  );
}

export const env = parsedEnv.data;

export type FrontendEnv = typeof env;
