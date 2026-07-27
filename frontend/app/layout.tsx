import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AppProviders } from "@/providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tauqeer Mustafa Inc.",
  description: "Enterprise software, cybersecurity, cloud, and AI solutions.",
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
      <body className="min-h-screen flex flex-col overflow-x-hidden bg-white text-[#111827]">
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
