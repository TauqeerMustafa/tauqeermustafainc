import type { Metadata } from "next";

import LoginForm from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/metadata";
import { PORTAL } from "@/lib/rbac";

export const metadata: Metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the Tauqeer Mustafa Inc. admin workspace.",
  path: "/admin/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginForm portal={PORTAL.ADMIN} />;
}
