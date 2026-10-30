"use client";

import { useEffect } from "react";
import { useDomainConfig } from "@/lib/domain";

export default function TenantHeadManager() {
  const domainConfig = useDomainConfig();

  useEffect(() => {
    if (typeof document === "undefined") return;

    // 1. Enforce Target Title
    let targetTitle = "";
    if (domainConfig.isTech) {
      targetTitle = "Tauqeer Mustafa Tech Portal";
    } else if (domainConfig.isCom) {
      targetTitle = "Tauqeer Mustafa Executive Portal";
    } else {
      targetTitle = "Qorlune Admin Portal";
    }

    document.title = targetTitle;

    // 2. Enforce Favicon & Apple Touch Icon
    const targetIcon = domainConfig.logoSrc; // /tm-logo.svg on .tech & .com, /logo.png on qorlune
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0]?.appendChild(link);
    }
    if (link) {
      link.href = targetIcon;
    }

    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.getElementsByTagName("head")[0]?.appendChild(appleLink);
    }
    if (appleLink) {
      appleLink.href = targetIcon;
    }

    // Observer to prevent Next.js layout metadata from reverting to "Qorlune LLC"
    const observer = new MutationObserver(() => {
      if (
        (domainConfig.isTech || domainConfig.isCom) &&
        (document.title.includes("Qorlune") || document.title === "Qorlune LLC")
      ) {
        document.title = targetTitle;
      }
    });

    const titleEl = document.querySelector("title");
    if (titleEl) {
      observer.observe(titleEl, { childList: true, subtree: true, characterData: true });
    }

    return () => observer.disconnect();
  }, [domainConfig]);

  return null;
}
