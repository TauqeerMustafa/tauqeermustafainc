/**
 * Paddle Billing configuration and helper definitions for Tauqeer Mustafa Inc.
 * Supports sandbox and production environments, client tokens, and preset service tiers.
 */

export type PaddleEnvironment = "sandbox" | "production";

export interface PaddleConfig {
  environment: PaddleEnvironment;
  clientToken: string;
  isConfigured: boolean;
  isSandbox: boolean;
  dashboardUrl: string;
}

const envString = (process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox").toLowerCase();
export const PADDLE_ENV: PaddleEnvironment =
  envString === "production" || envString === "live" ? "production" : "sandbox";

export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";

export const isPaddleClientConfigured =
  Boolean(PADDLE_CLIENT_TOKEN) &&
  !PADDLE_CLIENT_TOKEN.includes("YOUR_") &&
  !PADDLE_CLIENT_TOKEN.includes("test_client_token_here");

export const paddleConfig: PaddleConfig = {
  environment: PADDLE_ENV,
  clientToken: PADDLE_CLIENT_TOKEN,
  isConfigured: isPaddleClientConfigured,
  isSandbox: PADDLE_ENV === "sandbox",
  dashboardUrl:
    PADDLE_ENV === "sandbox"
      ? "https://sandbox-vendors.paddle.com"
      : "https://vendors.paddle.com",
};

/**
 * Standard preset milestone / retainer tiers available for quick checkout
 */
export const PRESET_MILESTONES = [
  {
    id: "discovery-deposit",
    title: "Discovery & Architecture Sprint",
    amount: 1500,
    currency: "USD",
    description: "Initial technical discovery, system architecture, database schema, and project roadmap.",
  },
  {
    id: "development-retainer-starter",
    title: "Dedicated Engineering Retainer (Starter)",
    amount: 3500,
    currency: "USD",
    description: "Bi-weekly dedicated engineering sprint tranche (frontend, backend, cloud infrastructure).",
  },
  {
    id: "development-retainer-growth",
    title: "Full-Stack Scale Retainer",
    amount: 6000,
    currency: "USD",
    description: "Comprehensive monthly dedicated engineering and architectural lead commitment.",
  },
];
