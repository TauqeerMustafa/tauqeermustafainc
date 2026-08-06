import type { Metadata } from "next";

import LoginForm from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the Tauqeer Mustafa Inc. admin workspace.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <LoginForm />;
}
