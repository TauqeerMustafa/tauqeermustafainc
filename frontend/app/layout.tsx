import type { Metadata } from "next";
import "./globals.css";

import { AppProviders } from "@/providers";
import { cn } from "@/lib/utils";
import { appConfig } from "@/config/app";
import { company } from "@/data/company";
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: "Qorlune — Enterprise Digital Engineering, Cybersecurity & AI Systems",
    template: "%s | Qorlune",
  },
  description:
    "Qorlune is a premier digital technology firm delivering enterprise web platforms, cybersecurity consulting, custom AI automation, and resilient cloud engineering worldwide.",
  keywords: [
    "Qorlune",
    "Qorlune LLC",
    "Qorlune Technologies",
    "enterprise web development",
    "cybersecurity consulting",
    "AI automation solutions",
    "cloud infrastructure engineering",
    "DevSecOps consulting",
    "custom software development",
    "high-assurance platforms",
  ],
  authors: [{ name: "Qorlune", url: appConfig.siteUrl }],
  creator: "Qorlune",
  publisher: company.name,
  applicationName: "Qorlune Portals",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Qorlune Portals",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: company.name,
    locale: "en_US",
    url: appConfig.siteUrl,
    title: "Qorlune | Web Development, Cybersecurity & AI Services",
    description:
      "Full-stack web development, cybersecurity consulting, AI automation, and cloud engineering. Security-first engineering, delivered globally.",
    images: [{ url: "/og-qorlune.png", width: 1200, height: 630, alt: "Qorlune - Digital Technology Firm" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qorlune | Web Development, Cybersecurity & AI",
    description:
      "Full-stack web development, cybersecurity, AI automation, and cloud engineering — security-first, globally delivered.",
    images: ["/og-qorlune.png"],
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
      suppressHydrationWarning
      className={cn("h-full scroll-smooth antialiased", "font-sans")}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />
      </head>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-canvas text-ink">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
