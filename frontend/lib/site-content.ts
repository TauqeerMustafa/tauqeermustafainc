/**
 * Server-side content helpers for public pages.
 *
 * These fetch the LIVE data an admin edits in the dashboard (services, jobs)
 * from the backend at request time, so changes made in /admin appear on the
 * public site immediately. If the backend is unreachable or returns nothing,
 * we fall back to the static content in `@/lib/site-data` so the site never
 * renders empty.
 *
 * Used by server components only. Do not import into client components.
 */
import { appConfig } from "@/config/app";
import { services as staticServices, jobs as staticJobs } from "@/lib/site-data";
import type { Career, Service } from "@/types/domain";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export type SiteJob = {
  slug: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
};

export type ServiceProcessStep = { title: string; detail: string };
export type ServiceFaq = { question: string; answer: string };

export type SiteService = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  outcomes: string[];
  // Not editable in admin — kept from static content, matched by slug.
  process?: ServiceProcessStep[];
  faqs?: ServiceFaq[];
};

const BASE = appConfig.apiBaseUrl;

/** GET helper that never throws — returns null on any failure. */
async function safeGet<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Jobs / careers ───────────────────────────────────────────────────────────

function toSiteJob(c: Career): SiteJob {
  return {
    slug: c.slug,
    title: c.title,
    location: c.location,
    type: c.type,
    summary: c.summary,
    responsibilities: c.responsibilities ?? [],
  };
}

/** Open roles — live from backend, falling back to static content. */
export async function getJobs(): Promise<SiteJob[]> {
  const json = await safeGet<ApiResponse<PaginatedResponse<Career>>>(
    "/careers?open_only=true&page_size=100"
  );
  const items = json?.data?.items;
  if (items && items.length > 0) return items.map(toSiteJob);
  return staticJobs as SiteJob[];
}

/** A single role by slug — live, falling back to static. */
export async function getJob(slug: string): Promise<SiteJob | null> {
  const json = await safeGet<ApiResponse<Career>>(`/careers/${encodeURIComponent(slug)}`);
  if (json?.data) return toSiteJob(json.data);
  return (staticJobs as SiteJob[]).find((j) => j.slug === slug) ?? null;
}

// ── Services ───────────────────────────────────────────────────────────────

/** Merge live service fields with static process/faqs (admin can't edit those). */
function toSiteService(s: Service): SiteService {
  const stat = staticServices.find((x) => x.slug === s.slug);
  return {
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    description: s.description,
    outcomes: s.outcomes ?? stat?.outcomes ?? [],
    process: stat?.process,
    faqs: stat?.faqs,
  };
}

/** All services — live from backend, falling back to static content. */
export async function getServices(): Promise<SiteService[]> {
  const json = await safeGet<ApiResponse<PaginatedResponse<Service>>>("/services?page_size=100");
  const items = json?.data?.items;
  if (items && items.length > 0) return items.map(toSiteService);
  return staticServices as SiteService[];
}

/** A single service by slug — live, falling back to static. */
export async function getService(slug: string): Promise<SiteService | null> {
  const json = await safeGet<ApiResponse<Service>>(`/services/${encodeURIComponent(slug)}`);
  if (json?.data) return toSiteService(json.data);
  return (staticServices as SiteService[]).find((s) => s.slug === slug) ?? null;
}
