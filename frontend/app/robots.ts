import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/employees",
          "/employees/",
          "/management",
          "/management/",
          "/portals",
          "/portals/",
          "/client",
          "/client/",
          "/app",
          "/app/",
          "/login",
          "/dashboard",
          "/api/",
        ],
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
  };
}
