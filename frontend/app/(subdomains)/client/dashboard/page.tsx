import type { Metadata } from "next";
import ClientDashboard from "@/components/client/ClientDashboard";

export const metadata: Metadata = { title: "Client Workspace | Qorlune LLC", description: "Your private TMI project workspace." };

export default function ClientDashboardPage() {
  return <ClientDashboard />;
}
