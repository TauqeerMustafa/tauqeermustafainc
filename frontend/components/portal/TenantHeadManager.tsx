"use client";

import { useEffect } from "react";

export default function TenantHeadManager() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Enforce Target Title
    document.title = "Qorlune Admin Portal";

    // Enforce Favicon & Apple Touch Icon
    const targetIcon = "/logo.png";
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
  }, []);

  return null;
}
