"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SCRIPTS = [
  "/assets/js/vendor/jquery-3.7.1.min.js",
  "/assets/js/vendor/chroma.min.js",
  "/assets/js/plugins/waypoints.min.js",
  "/assets/js/vendor/bootstrap.bundle.min.js",
  "/assets/js/plugins/meanmenu.min.js",
  "/assets/js/plugins/swiper.min.js",
  "/assets/js/plugins/gsap.js",
  "/assets/js/plugins/ScrollSmoother.js",
  "/assets/js/plugins/ScrollToPlugin.js",
  "/assets/js/plugins/ScrollTrigger.js",
  "/assets/js/plugins/SplitText.js",
  "/assets/js/plugins/wow.js",
  "/assets/js/vendor/magnific-popup.min.js",
  "/assets/js/vendor/type.js",
  "/assets/js/vendor/vanilla-tilt.js",
  "/assets/js/plugins/nice-select.min.js",
  "/assets/js/vendor/odometer.min.js",
  "/assets/js/vendor/jarallax.min.js",
  "/assets/js/vendor/jquery-ui.min.js",
  "/assets/js/vendor/jquery.counterup.min.js",
  "/assets/js/plugins/parallax-scroll.js",
  "/assets/js/plugins/jquery.countdown.min.js",
  "/assets/js/plugins/isotope-docs.min.js",
  "/assets/js/vendor/ajax-form.js",
  "/assets/js/plugins/throwable.js",
  "/assets/js/plugins/matter.js",
  "/assets/js/plugins/magiccursor.js",
  "/assets/js/main.js",
];

function loadScriptsInSequence(scripts: string[], index = 0, onComplete?: () => void) {
  if (index >= scripts.length) {
    if (onComplete) onComplete();
    return;
  }

  const src = scripts[index];
  // If already loaded and executed, move to next
  const existing = document.querySelector(`script[data-monas-script="${src}"]`);
  if (existing) {
    loadScriptsInSequence(scripts, index + 1, onComplete);
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = false;
  script.setAttribute("data-monas-script", src);
  script.onload = () => {
    loadScriptsInSequence(scripts, index + 1, onComplete);
  };
  script.onerror = () => {
    console.warn("Monas script failed to load:", src);
    loadScriptsInSequence(scripts, index + 1, onComplete);
  };
  document.body.appendChild(script);
}

export default function MonasScripts() {
  const pathname = usePathname();

  useEffect(() => {
    loadScriptsInSequence(SCRIPTS, 0, () => {
      // Once all scripts are loaded, safely trigger load event and fade preloader
      if (typeof window !== "undefined") {
        const $ = (window as unknown as { jQuery?: any; $?: any }).jQuery || (window as unknown as { $?: any }).$;
        if ($) {
          try {
            $(window).trigger("load");
            $("#preloader").fadeOut(400);
          } catch (e) {
            console.warn("Error firing load event:", e);
          }
        }
      }
    });

    // Handle close button click on preloader directly
    const handleCloseClick = () => {
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.style.display = "none";
      }
    };

    const closeBtn = document.querySelector(".preloader-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", handleCloseClick);
    }

    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener("click", handleCloseClick);
      }
    };
  }, [pathname]);

  return null;
}
