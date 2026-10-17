"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { company } from "@/data/company";

const WA_GREEN = "#25D366";

/**
 * Floating WhatsApp direct button — opens WhatsApp chat directly without any menus or modals.
 */
export default function WhatsAppChat() {
  const whatsappUrl = company.whatsapp || "https://wa.me/17112494712";

  return (
    <aside
      aria-label="Direct WhatsApp contact"
      className="fixed bottom-5 right-5 z-[90] sm:bottom-6 sm:right-6"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat directly with Qorlune on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition duration-200 hover:scale-110 active:scale-95"
        style={{ backgroundColor: WA_GREEN }}
      >
        <FaWhatsapp className="h-7 w-7 transition-transform group-hover:scale-105" aria-hidden="true" />
        
        {/* Subtle desktop tooltip on hover */}
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-surface/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-lg ring-1 ring-line backdrop-blur sm:group-hover:inline-block">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
