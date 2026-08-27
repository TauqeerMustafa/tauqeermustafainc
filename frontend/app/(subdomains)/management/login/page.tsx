import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Management Login",
  description: "Sign in to the Management Portal.",
  path: "/management/login",
  noIndex: true,
});

export default function ManagementLoginPage() {
  return <LoginForm />;
}
