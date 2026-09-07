import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app";
import { jobs, posts, projects, services } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { url: "", changeFrequency: "weekly", priority: 1 },
    { url: "/about", changeFrequency: "monthly", priority: 0.8 },
    { url: "/services", changeFrequency: "monthly", priority: 0.9 },
    { url: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
    { url: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { url: "/careers", changeFrequency: "weekly", priority: 0.6 },
    { url: "/contact", changeFrequency: "yearly", priority: 0.7 },
    { url: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { url: "/cookies", changeFrequency: "yearly", priority: 0.3 },
    { url: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
    { url: "/legal/payment-policy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/legal/refund-policy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/legal/return-policy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/legal/product-policy", changeFrequency: "yearly", priority: 0.3 },
  ] as const;

  const staticSitemapRoutes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${appConfig.siteUrl}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${appConfig.siteUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${appConfig.siteUrl}/portfolio/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${appConfig.siteUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${appConfig.siteUrl}/careers/${job.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticSitemapRoutes, ...serviceRoutes, ...projectRoutes, ...postRoutes, ...jobRoutes];
}
