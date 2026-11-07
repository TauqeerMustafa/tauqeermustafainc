"use client";

import { useState, useEffect } from "react";

export type TenantKey = "qorlune" | "tech" | "com";

export interface DomainConfig {
  tenant: TenantKey;
  isTech: boolean;
  isCom: boolean;
  isQorlune: boolean;
  isTmi: boolean;
  apex: string;
  brandName: string;
  shortName: string;
  portalLabel: string;
  email: string;
  portalsUrl: string;
  billingUrl: string;
  docsUrl: string;
  supportUrl: string;
  appUrl: string;
  mainUrl: string;
  logoSrc: string;
}

export function getTenantFromEmail(email: string): TenantKey {
  const lower = email.toLowerCase().trim();
  if (lower.endsWith("@tauqeermustafa.tech")) {
    return "tech";
  }
  if (
    lower.endsWith("@tauqeermustafa.com") ||
    lower.endsWith("@tauqeerm.com") ||
    lower.endsWith("@tm.com")
  ) {
    return "com";
  }
  return "qorlune";
}

export function getDomainConfig(hostname?: string): DomainConfig {
  let host = hostname || "";
  let queryTenant = "";
  if (typeof window !== "undefined") {
    if (!host) {
      host = window.location.hostname || window.location.host || "";
    }
    try {
      const sp = new URLSearchParams(window.location.search);
      queryTenant = (sp.get("domain") || sp.get("portal_domain") || sp.get("tenant") || "").toLowerCase().trim();
    } catch {}
  }
  const lower = host.toLowerCase().trim();

  // 1. .tech Portal (tauqeermustafa.tech) - only if explicitly requested
  if (
    queryTenant === "tech" ||
    lower.includes("tauqeermustafa.tech") ||
    lower.endsWith(".tech")
  ) {
    return {
      tenant: "tech",
      isTech: true,
      isCom: false,
      isQorlune: false,
      isTmi: true,
      apex: "tauqeermustafa.tech",
      brandName: "Qorlune Tech",
      shortName: "Qorlune Tech",
      portalLabel: "Tech Portal",
      email: "support@qorlune.co.uk",
      portalsUrl: "https://portals.qorlune.co.uk",
      billingUrl: "https://billing.qorlune.co.uk",
      docsUrl: "https://docs.qorlune.co.uk",
      supportUrl: "https://support.qorlune.co.uk",
      appUrl: "https://app.qorlune.co.uk",
      mainUrl: "https://qorlune.co.uk",
      logoSrc: "/logo.png",
    };
  }

  // 2. .com Portal - only if explicitly requested
  if (
    queryTenant === "com" ||
    lower.includes("tauqeermustafa.com") ||
    lower.includes("tauqeerm.com")
  ) {
    return {
      tenant: "com",
      isTech: false,
      isCom: true,
      isQorlune: true,
      isTmi: false,
      apex: "qorlune.co.uk",
      brandName: "Qorlune",
      shortName: "Qorlune",
      portalLabel: "Executive Portal",
      email: "contact@qorlune.co.uk",
      portalsUrl: "https://portals.qorlune.co.uk",
      billingUrl: "https://billing.qorlune.co.uk",
      docsUrl: "https://docs.qorlune.co.uk",
      supportUrl: "https://support.qorlune.co.uk",
      appUrl: "https://app.qorlune.co.uk",
      mainUrl: "https://qorlune.co.uk",
      logoSrc: "/logo.png",
    };
  }

  // DEFAULT: Primary Qorlune Portal (qorlune.co.uk)
  return {
    tenant: "qorlune",
    isTech: false,
    isCom: false,
    isQorlune: true,
    isTmi: false,
    apex: "qorlune.co.uk",
    brandName: "Qorlune",
    shortName: "Qorlune",
    portalLabel: "Client Portal",
    email: "contact@qorlune.co.uk",
    portalsUrl: "https://portals.qorlune.co.uk",
    billingUrl: "https://billing.qorlune.co.uk",
    docsUrl: "https://docs.qorlune.co.uk",
    supportUrl: "https://support.qorlune.co.uk",
    appUrl: "https://app.qorlune.co.uk",
    mainUrl: "https://qorlune.co.uk",
    logoSrc: "/logo.png",
  };
}

export function useDomainConfig(): DomainConfig {
  const [config, setConfig] = useState<DomainConfig>(() => {
    if (typeof window !== "undefined") {
      return getDomainConfig(window.location.hostname);
    }
    return getDomainConfig();
  });

  useEffect(() => {
    function update() {
      setConfig(getDomainConfig(window.location.hostname));
    }
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  return config;
}
