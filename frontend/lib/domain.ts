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

export function getDomainConfig(hostname?: string): DomainConfig {
  let host = hostname || "";
  if (!host && typeof window !== "undefined") {
    host = window.location.hostname;
  }
  const isTmi = host.includes("tauqeermustafa.com") || host.includes("tauqeermustafa.tech");
  const apex = isTmi ? "tauqeermustafa.com" : "qorlune.co.uk";

  return {
    isTmi,
    apex,
    brandName: isTmi ? "Tauqeer Mustafa Inc." : "Qorlune LLC",
    shortName: isTmi ? "TMI" : "Qorlune",
    email: isTmi ? "info@tauqeermustafa.com" : "support@qorlune.co.uk",
    portalsUrl: `https://portals.${apex}`,
    billingUrl: `https://billing.${apex}`,
    docsUrl: `https://docs.${apex}`,
    supportUrl: `https://support.${apex}`,
    appUrl: `https://app.${apex}`,
    mainUrl: `https://${apex}`,
  };
}
