import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AppProviders } from "@/providers";

export const metadata: Metadata = {
  title: "Tauqeer Mustafa Inc.",
  description: "Enterprise Digital Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-screen flex flex-col bg-white text-[#111827]">
        <AppProviders>
          <Navbar />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
