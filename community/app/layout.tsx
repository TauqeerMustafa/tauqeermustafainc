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
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#14181d" },
  ],
};

// Runs before hydration so the correct theme paints on the very first frame.
// Priority: explicit user choice (localStorage) > device preference > light
// (BMW corporate default). Kept tiny and inline to avoid a render-blocking
// request just for this.
const themeInitScript = `(function(){try{var s=localStorage.getItem("community-theme");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
