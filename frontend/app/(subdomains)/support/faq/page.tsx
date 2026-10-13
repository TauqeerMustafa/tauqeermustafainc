import type { Metadata } from "next";
import SupportHubClient from "../SupportHubClient";

export const metadata: Metadata = {
  title: "Knowledge Base & Frequently Asked Questions | Qorlune Helpdesk",
  description:
    "Self-service guides, corporate SLA response matrix, client portal troubleshooting, and billing policies.",
};

export default function FaqPage() {
  return <SupportHubClient initialTab="faq" />;
}
