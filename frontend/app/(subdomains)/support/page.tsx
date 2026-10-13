import type { Metadata } from "next";
import SupportHubClient, { type SupportTab } from "./SupportHubClient";

export const metadata: Metadata = {
  title: "Support & Help Center | Qorlune",
  description:
    "Official corporate helpdesk, ticket submission, system status, live SLA monitoring, and 24/7 technical assistance for Qorlune.",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawTab = params.tab;
  const validTabs: SupportTab[] = ["overview", "ticket", "tracker", "faq", "status"];
  const initialTab: SupportTab =
    rawTab && validTabs.includes(rawTab as SupportTab)
      ? (rawTab as SupportTab)
      : "overview";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Qorlune Support & Helpdesk",
            description:
              "Official corporate support, ticket tracking, emergency incident response, and live system status.",
            url: "https://support.qorlune.com",
            mainEntity: {
              "@type": "CustomerService",
              telephone: "+92 335 6701199",
              email: "support@qorlune.com",
              contactType: "technical support",
              availableLanguage: ["English", "Urdu"],
            },
          }),
        }}
      />
      <SupportHubClient initialTab={initialTab} />
    </>
  );
}
