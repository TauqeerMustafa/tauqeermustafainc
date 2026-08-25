import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://community.tauqeermustafa.tech/sitemap.xml",
    host: "https://community.tauqeermustafa.tech",
  };
}
