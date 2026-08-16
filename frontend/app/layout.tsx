import type { Metadata } from "next";
import "./globals.css";

import { AppProviders } from "@/providers";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config/app";
import { company } from "@/data/company";
import CookieConsent from "@/components/common/CookieConsent";
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: "Tauqeer Mustafa Inc. | Web Development, Cybersecurity & AI Services",
    template: "%s | TMI",
  },
  description:
    "Full-stack web development, cybersecurity consulting, AI automation, and cloud engineering for businesses in Pakistan and worldwide. Security-first digital agency based in Islamabad.",
  keywords: [
    "web development Pakistan",
    "cybersecurity consulting Islamabad",
    "AI automation services",
    "cloud engineering Pakistan",
    "digital agency Islamabad",
    "full stack development",
    "security-first development",
    "Tauqeer Mustafa",
  ],
  authors: [{ name: "Tauqeer Mustafa", url: appConfig.siteUrl }],
  creator: "Tauqeer Mustafa",
  publisher: company.name,
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
    title: "Tauqeer Mustafa Inc. | Web Development, Cybersecurity & AI Services",
    description:
      "Full-stack web development, cybersecurity consulting, AI automation, and cloud engineering. Security-first digital agency in Islamabad, Pakistan.",
    images: [{ url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80", width: 1200, height: 630, alt: "Tauqeer Mustafa Inc. - Digital Agency" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tauqeer Mustafa Inc. | Digital Agency Islamabad",
    description:
      "Full-stack web development, cybersecurity, AI automation, and cloud engineering services.",
    images: ["https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80"],
  },
  robots: { index: true, follow: true },
  verification: {
    // Add when you get these from Google/Bing
    // google: 'your-google-site-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

const jsonLdSchemas = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema(),
    localBusinessSchema(),
    websiteSchema(),
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
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
