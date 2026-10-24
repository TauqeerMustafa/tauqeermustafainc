import type { MetadataRoute } from "next";

import { appConfig } from "@/config/app";
import { jobs, posts, projects, services } from "@/lib/site-data";
import { ALL_DOCS } from "@/data/docs-registry";

/**
 * The main-site sitemap.
 *
 * A sitemap file may only advertise URLs on ONE host. This previously mixed
 * qorlune.co.uk, docs.qorlune.co.uk, billing.qorlune.co.uk,
 * support.qorlune.co.uk, portals.qorlune.co.uk and community.qorlune.co.uk
 * into a single file — cross-host entries are ignored by Google, so the
 * subdomains were never actually indexed through it.
 *
 * Subdomains are served from the same Next app (the proxy rewrites them), so
 * `sitemap.xml` must vary by host. `buildHostSitemap` below is the single
 * source of truth; each host gets only its own routes.
 */

const MAIN_ROUTES = [
  { url: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { url: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { url: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
  { url: "/portfolio", changeFrequency: "weekly" as const, priority: 0.8 },
  { url: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { url: "/careers", changeFrequency: "weekly" as const, priority: 0.7 },
  { url: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { url: "/success-story", changeFrequency: "monthly" as const, priority: 0.7 },
];

const DOCS_ROUTES = [
  { url: "", changeFrequency: "weekly" as const, priority: 0.8 },
  ...ALL_DOCS.map((doc) => ({
    url: `/${doc.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
];

const BILLING_ROUTES = [
  { url: "", changeFrequency: "monthly" as const, priority: 0.8 },
  { url: "/pay", changeFrequency: "monthly" as const, priority: 0.8 },
  { url: "/payouts", changeFrequency: "monthly" as const, priority: 0.7 },
  { url: "/policies", changeFrequency: "monthly" as const, priority: 0.6 },
];

const SUPPORT_ROUTES = [
  { url: "", changeFrequency: "daily" as const, priority: 0.8 },
  { url: "/ticket", changeFrequency: "monthly" as const, priority: 0.7 },
  { url: "/status", changeFrequency: "always" as const, priority: 0.8 },
  { url: "/faq", changeFrequency: "weekly" as const, priority: 0.7 },
  { url: "/contact", changeFrequency: "monthly" as const, priority: 0.7 },
];



export type SitemapHost = "main" | "docs" | "billing" | "support";

function entriesFor(
  origin: string,
  routes: ReadonlyArray<{ url: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }>,
  now: Date,
): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${origin}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

/** Build the sitemap for one host. Exported so a host-aware route can reuse it. */
export function buildHostSitemap(host: SitemapHost, now = new Date()): MetadataRoute.Sitemap {
  const apex = appConfig.siteUrl.replace(/\/$/, "");

  switch (host) {
    case "docs":
      return entriesFor("https://docs.qorlune.co.uk", DOCS_ROUTES, now);
    case "billing":
      return entriesFor("https://billing.qorlune.co.uk", BILLING_ROUTES, now);
    case "support":
      return entriesFor("https://support.qorlune.co.uk", SUPPORT_ROUTES, now);
    
    default: {
      const main = entriesFor(apex, MAIN_ROUTES, now);
      const serviceRoutes = services.map((service) => ({
        url: `${apex}/services/${service.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
      const projectRoutes = projects.map((project) => ({
        url: `${apex}/portfolio/${project.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
      const postRoutes = posts.map((post) => ({
        url: `${apex}/blog/${post.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
      const jobRoutes = jobs.map((job) => ({
        url: `${apex}/careers/${job.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
      return [...main, ...serviceRoutes, ...projectRoutes, ...postRoutes, ...jobRoutes];
    }
  }
}

/**
 * Next calls this without request context, so it always returns the apex
 * (main) host — the canonical sitemap at https://qorlune.co.uk/sitemap.xml.
 * The host-specific builders above are exported for a future per-host
 * sitemap route; until one exists, subdomains are intentionally omitted
 * rather than advertised from the wrong host.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildHostSitemap("main");
}
