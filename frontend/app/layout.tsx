import type { Metadata } from "next";
import "./globals.css";

import { AppProviders } from "@/providers";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config/app";
import { company } from "@/data/company";
import CookieConsent from "@/components/common/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: "Tauqeer Mustafa Inc. | Enterprise Software, Security & AI",
    template: "%s | Tauqeer Mustafa Inc.",
  },
  description:
    "Tauqeer Mustafa Inc. delivers enterprise web development, cybersecurity, AI automation, cloud engineering, and product design for growing organizations.",
  keywords: [
    "enterprise web development",
    "cybersecurity consulting",
    "AI automation",
    "cloud engineering",
    "product design",
    "Tauqeer Mustafa",
  ],
  authors: [{ name: company.name, url: appConfig.siteUrl }],
  applicationName: company.name,
  icons: {
    icon: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
  openGraph: {
    type: "website",
    siteName: company.name,
    locale: "en_US",
    url: appConfig.siteUrl,
    title: "Tauqeer Mustafa Inc. | Enterprise Software, Security & AI",
    description:
      "Enterprise web development, cybersecurity, AI automation, cloud engineering, and product design.",
    images: [{ url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tauqeer Mustafa Inc.",
    description:
      "Enterprise web development, cybersecurity, AI automation, cloud engineering, and product design.",
    images: ["https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"],
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  url: appConfig.siteUrl,
  logo: "/logo-mark.svg",
  email: company.email,
  telephone: company.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: company.headquarters,
  },
  sameAs: [company.social.github, company.social.linkedin].filter(Boolean),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full scroll-smooth antialiased", "font-sans")}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-white text-[#0A0A0A]">
        <AppProviders>
          {children}
          <CookieConsent />
        </AppProviders>
      </body>
    </html>
  );
}
