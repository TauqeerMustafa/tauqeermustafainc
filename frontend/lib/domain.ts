"use client";

import { useState, useEffect } from "react";

export type TenantKey = "tech" | "com" | "qorlune";

export interface DomainConfig {
  tenant: TenantKey;
  isTech: boolean;
  isCom: boolean;
  isQorlune: boolean;
  isTmi: boolean; // true for tech and com
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
  if (lower.endsWith("@qorlune.co.uk") || lower.endsWith("@qorlune.com")) {
    return "qorlune";
  }
  return "com";
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

  // 1. .tech Portal (tauqeermustafa.tech)
  if (
    queryTenant === "tech" ||
    lower.includes("tauqeermustafa.tech") ||
    lower === "tech" ||
    lower.endsWith(".tech") ||
    lower.startsWith("tech.") ||
    lower.includes("-tech")
  ) {
    return {
      tenant: "tech",
      isTech: true,
      isCom: false,
      isQorlune: false,
      isTmi: true,
      apex: "tauqeermustafa.tech",
      brandName: "Tauqeer Mustafa Tech",
      shortName: "TM Tech",
      portalLabel: "Tech Portal",
      email: "info@tauqeermustafa.tech",
      portalsUrl: "https://portals.tauqeermustafa.tech",
      billingUrl: "https://billing.tauqeermustafa.tech",
      docsUrl: "https://docs.tauqeermustafa.tech",
      supportUrl: "https://support.tauqeermustafa.tech",
      appUrl: "https://app.tauqeermustafa.tech",
      mainUrl: "https://tauqeermustafa.tech",
      logoSrc: "/tm-logo.svg",
    };
  }

  // 2. Qorlune Portal (qorlune.co.uk)
  if (
    queryTenant === "qorlune" ||
    lower.includes("qorlune") ||
    lower.endsWith(".co.uk") ||
    lower === "co.uk" ||
    lower === "qor"
  ) {
    return {
      tenant: "qorlune",
      isTech: false,
      isCom: false,
      isQorlune: true,
      isTmi: false,
      apex: "qorlune.co.uk",
      brandName: "Qorlune LLC",
      shortName: "Qorlune",
      portalLabel: "Admin Portal",
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

  // 3. .com Portal (tauqeermustafa.com)
  return {
    tenant: "com",
    isTech: false,
    isCom: true,
    isQorlune: false,
    isTmi: true,
    apex: "tauqeermustafa.com",
    brandName: "Tauqeer Mustafa Inc.",
    shortName: "Tauqeer Mustafa",
    portalLabel: "Executive Portal",
    email: "contact@tauqeermustafa.com",
    portalsUrl: "https://portals.tauqeermustafa.com",
    billingUrl: "https://billing.tauqeermustafa.com",
    docsUrl: "https://docs.tauqeermustafa.com",
    supportUrl: "https://support.tauqeermustafa.com",
    appUrl: "https://app.tauqeermustafa.com",
    mainUrl: "https://tauqeermustafa.com",
    logoSrc: "/tm-logo.svg",
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
    if (typeof window !== "undefined") {
      setConfig(getDomainConfig(window.location.hostname));
    }
  }, []);

  return config;
}
