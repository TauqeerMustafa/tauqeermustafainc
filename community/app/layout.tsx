import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community | Make room for better conversations",
  description:
    "A thoughtful space for curious people to exchange ideas, share skills, and build momentum together.",
  metadataBase: new URL("https://community.tauqeermustafa.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Community | Make room for better conversations",
    description:
      "A thoughtful space for curious people to exchange ideas, share skills, and build momentum together.",
    url: "https://community.tauqeermustafa.tech",
    siteName: "Community",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
