import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app";
import { jobs, posts, projects, services } from "@/lib/site-data";
import { ALL_DOCS } from "@/data/docs-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1. Primary Corporate Domain Routes (tauqeermustafa.com)
  const mainRoutes = [
    { url: "", changeFrequency: "weekly", priority: 1.0 },
    { url: "/about", changeFrequency: "monthly", priority: 0.8 },
    { url: "/services", changeFrequency: "monthly", priority: 0.9 },
    { url: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
    { url: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { url: "/careers", changeFrequency: "weekly", priority: 0.7 },
    { url: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { url: "/success-story", changeFrequency: "monthly", priority: 0.7 },
  ] as const;

  const staticMainSitemap: MetadataRoute.Sitemap = mainRoutes.map((route) => ({
    url: `${appConfig.siteUrl}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 2. Dynamic Content on Main Domain
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${appConfig.siteUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${appConfig.siteUrl}/portfolio/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${appConfig.siteUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${appConfig.siteUrl}/careers/${job.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 3. Documentation & Policy Portal (docs.tauqeermustafa.com)
  const docsHubRoute: MetadataRoute.Sitemap = [
    {
      url: "https://docs.tauqeermustafa.com",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const docDetailRoutes: MetadataRoute.Sitemap = ALL_DOCS.map((doc) => ({
    url: `https://docs.tauqeermustafa.com/${doc.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 4. Billing & Treasury Suite (billing.tauqeermustafa.com)
  const billingRoutes: MetadataRoute.Sitemap = [
    { url: "https://billing.tauqeermustafa.com", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://billing.tauqeermustafa.com/pay", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://billing.tauqeermustafa.com/payouts", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://billing.tauqeermustafa.com/policies", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // 5. Customer Support & Helpdesk Hub (support.tauqeermustafa.com)
  const supportRoutes: MetadataRoute.Sitemap = [
    { url: "https://support.tauqeermustafa.com", lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: "https://support.tauqeermustafa.com/ticket", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://support.tauqeermustafa.com/status", lastModified: now, changeFrequency: "always", priority: 0.8 },
    { url: "https://support.tauqeermustafa.com/faq", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://support.tauqeermustafa.com/contact", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // 6. Portals & Community
  const networkRoutes: MetadataRoute.Sitemap = [
    { url: "https://portals.tauqeermustafa.com", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://community.tauqeermustafa.com", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  return [
    ...staticMainSitemap,
    ...serviceRoutes,
    ...projectRoutes,
    ...postRoutes,
    ...jobRoutes,
    ...docsHubRoute,
    ...docDetailRoutes,
    ...billingRoutes,
    ...supportRoutes,
    ...networkRoutes,
  ];
}
