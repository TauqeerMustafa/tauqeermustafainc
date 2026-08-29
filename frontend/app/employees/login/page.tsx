import type { Metadata } from "next";

import LoginForm from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Employee Login",
  description: "Sign in to the Tauqeer Mustafa Inc. employee portal.",
  path: "/employees/login",
  noIndex: true,
});

export default function EmployeeLoginPage() {
  return <LoginForm redirectUrl="/employees/dashboard" />;
}
