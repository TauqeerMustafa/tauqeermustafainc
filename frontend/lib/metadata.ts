import type { Metadata } from "next";

import { appConfig } from "@/config/app";

export function buildMetadata({
  title,
  description,
  path = "/",
  image = "/og-qorlune.png",
  noIndex = false,
}: {
  title: string | { absolute: string };
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = new URL(path, appConfig.siteUrl).toString();
  const titleText = typeof title === "string" ? title : title.absolute;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: titleText,
      description,
      url,
      siteName: appConfig.name,
      type: "website",
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: titleText }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description,
      images: [image],
    },
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
  };
}
