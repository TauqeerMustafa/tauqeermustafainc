import type { Metadata } from "next";
import ClientAuthForm from "@/components/client/ClientAuthForm";

export const metadata: Metadata = { title: "Create Client Account | Qorlune LLC", description: "Create a verified Qorlune client workspace." };

export default function ClientRegisterPage() {
  return <ClientAuthForm mode="register" />;
}
