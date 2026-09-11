import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | TMI Billing & Treasury",
    default: "Billing & Treasury Portal | Tauqeer Mustafa Inc.",
  },
  description:
    "Official corporate billing, client payments, contractor payouts, and financial settlement policies.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function BillingSubdomainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-canvas text-ink">{children}</div>;
}


