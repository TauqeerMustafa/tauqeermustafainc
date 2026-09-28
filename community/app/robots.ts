import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://community.tauqeermustafa.com/sitemap.xml",
    host: "https://community.tauqeermustafa.com",
  };
}
