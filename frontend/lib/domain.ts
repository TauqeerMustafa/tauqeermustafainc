"use client";

import { useState, useEffect } from "react";

export interface DomainConfig {
  isTmi: boolean;
  apex: string;
  brandName: string;
  shortName: string;
  email: string;
  portalsUrl: string;
  billingUrl: string;
  docsUrl: string;
  supportUrl: string;
  appUrl: string;
  mainUrl: string;
}

export type TenantKey = "tauqeermustafa" | "qorlune" | "other";

export function getTenantFromEmail(email: string): TenantKey {
  const lower = email.toLowerCase().trim();
  if (
    lower.endsWith("@tauqeermustafa.com") ||
    lower.endsWith("@tauqeermustafa.tech") ||
    lower.endsWith("@tauqeerm.com") ||
    lower.endsWith("@tm.com")
  ) {
    return "tauqeermustafa";
  }
  if (lower.endsWith("@qorlune.co.uk") || lower.endsWith("@qorlune.com")) {
    return "qorlune";
  }
  return "other";
}

export function getDomainConfig(hostname?: string): DomainConfig {
  let host = hostname || "";
  if (!host && typeof window !== "undefined") {
    host = window.location.hostname || window.location.host || "";
  }
  const lower = host.toLowerCase().trim();
  const isQorlune = lower.includes("qorlune") || lower.endsWith(".co.uk");
  const isTmi = !isQorlune;
  const apex = isTmi ? "tauqeermustafa.com" : "qorlune.co.uk";

  return {
    isTmi,
    apex,
    brandName: isTmi ? "Tauqeer Mustafa Inc." : "Qorlune LLC",
    shortName: isTmi ? "Tauqeer Mustafa" : "Qorlune",
    email: isTmi ? "info@tauqeermustafa.com" : "support@qorlune.co.uk",
    portalsUrl: `https://portals.${apex}`,
    billingUrl: `https://billing.${apex}`,
    docsUrl: `https://docs.${apex}`,
    supportUrl: `https://support.${apex}`,
    appUrl: `https://app.${apex}`,
    mainUrl: `https://${apex}`,
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
