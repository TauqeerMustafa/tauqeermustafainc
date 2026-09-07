import type { MetadataRoute } from "next";

const base = "https://community.tauqeermustafa.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`,             lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/capabilities`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/delivery`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sessions`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/join`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
