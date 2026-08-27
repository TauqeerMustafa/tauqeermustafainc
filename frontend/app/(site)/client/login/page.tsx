import type { Metadata } from "next";
import ClientAuthForm from "@/components/client/ClientAuthForm";

export const metadata: Metadata = { title: "Client Sign In | Tauqeer Mustafa Inc.", description: "Sign in to your secure TMI client workspace." };

export default function ClientLoginPage() {
  return <ClientAuthForm mode="login" />;
}
