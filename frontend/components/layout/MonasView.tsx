"use client";

import React, { useEffect } from "react";

interface MonasViewProps {
  html: string;
}

export default function MonasView({ html }: MonasViewProps) {
  useEffect(() => {
    // Safety fallback: ensure preloader fades out after mounting
    const timer = setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader && preloader.style.display !== "none") {
        preloader.style.transition = "opacity 0.4s ease";
        preloader.style.opacity = "0";
        setTimeout(() => {
          preloader.style.display = "none";
        }, 400);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="monas-template-container"
      style={{ minHeight: "100vh", width: "100%" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
