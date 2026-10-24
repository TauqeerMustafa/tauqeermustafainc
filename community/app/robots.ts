import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://community.qorlune.co.uk/sitemap.xml",
    host: "https://community.qorlune.co.uk",
  };
}
