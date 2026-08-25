import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community | Make your own line",
  description:
    "A precise, generous space for curious people to exchange ideas, sharpen their craft, and build momentum together.",
  metadataBase: new URL("https://community.tauqeermustafa.tech"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Community | Make your own line",
    description:
      "A precise, generous space for curious people to exchange ideas, sharpen their craft, and build momentum together.",
    url: "https://community.tauqeermustafa.tech",
    siteName: "Community",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community | Make your own line",
    description:
      "A precise, generous space for curious people to exchange ideas, sharpen their craft, and build momentum together.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#f3f3f1" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
