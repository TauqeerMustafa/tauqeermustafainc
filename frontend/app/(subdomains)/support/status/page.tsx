import type { Metadata } from "next";
import SupportHubClient from "../SupportHubClient";

export const metadata: Metadata = {
  title: "Live System Status & SLA Metrics | Qorlune Helpdesk",
  description:
    "Real-time operational status, service latencies, scheduled maintenance, and 99.98% uptime SLA telemetry for Qorlune.",
};

export default function StatusPage() {
  return <SupportHubClient initialTab="status" />;
}
