import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | TMI Support & Helpdesk",
    default: "Support & Help Center | Tauqeer Mustafa Inc.",
  },
  description:
    "Official customer support, technical helpdesk, incident escalation, knowledge base, and live system status for Tauqeer Mustafa Inc.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function SupportSubdomainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-canvas text-ink">{children}</div>;
}


