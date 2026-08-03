import type { Metadata } from "next";

import LoginForm from "@/components/auth/LoginForm";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the Tauqeer Mustafa Inc. admin workspace.",
  path: "/login",
  noIndex: true,
});

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = Array.isArray(params?.next) ? params.next[0] : params?.next;
  return <LoginForm nextPath={nextPath} />;
}