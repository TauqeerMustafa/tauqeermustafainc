import type { Metadata } from "next";

import LoginForm from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/metadata";
import { PORTAL } from "@/lib/rbac";

export const metadata: Metadata = buildMetadata({
  title: "Management Login",
  description: "Sign in to the Tauqeer Mustafa Inc. management portal.",
  path: "/management/login",
  noIndex: true,
});

export default function ManagementLoginPage() {
  return <LoginForm portal={PORTAL.MANAGEMENT} />;
}
