import type { Metadata } from "next";
import ClientAuthForm from "@/components/client/ClientAuthForm";

export const metadata: Metadata = { title: "Create Client Account | Tauqeer Mustafa Inc.", description: "Create a verified TMI client workspace." };

export default function ClientRegisterPage() {
  return <ClientAuthForm mode="register" />;
}
