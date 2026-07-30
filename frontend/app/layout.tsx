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
    icon: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-logo-badge_cfkewe.jpg",
    apple: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-logo-badge_cfkewe.jpg",
  },
  openGraph: {
    type: "website",
    siteName: company.name,
    locale: "en_US",
    url: appConfig.siteUrl,
    title: "Tauqeer Mustafa Inc. | Enterprise Software, Security & AI",
    description:
      "Enterprise web development, cybersecurity, AI automation, cloud engineering, and product design.",
    images: [{ url: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tauqeer Mustafa Inc.",
    description:
      "Enterprise web development, cybersecurity, AI automation, cloud engineering, and product design.",
    images: ["https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg"],
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  url: appConfig.siteUrl,
  logo: "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-logo-badge_cfkewe.jpg",
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
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-white text-[#0A1628]">
        <AppProviders>
          {children}
          <CookieConsent />
        </AppProviders>
      </body>
    </html>
  );
}
