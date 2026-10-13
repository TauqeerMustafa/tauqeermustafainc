import type { Metadata } from "next";
import SupportHubClient from "../SupportHubClient";

export const metadata: Metadata = {
  title: "Submit a Support Ticket | Qorlune Helpdesk",
  description:
    "Open an enterprise service ticket with guaranteed SLA commitments from Qorlune.",
};

export default function TicketPage() {
  return <SupportHubClient initialTab="ticket" />;
}
