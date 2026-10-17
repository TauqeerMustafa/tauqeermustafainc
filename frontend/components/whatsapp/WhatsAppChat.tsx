"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { company } from "@/data/company";

const WA_GREEN = "#25D366";

/**
 * Floating WhatsApp direct button — only the icon, no text bubble/tooltips, no link preview on hover.
 */
export default function WhatsAppChat() {
  const whatsappUrl = company.whatsapp || "https://wa.me/17112494712";

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <aside
      aria-label="Direct WhatsApp contact"
      className="fixed bottom-5 right-5 z-[90] sm:bottom-6 sm:right-6"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        style={{ backgroundColor: WA_GREEN }}
      >
        <FaWhatsapp className="h-7 w-7 transition-transform hover:scale-105" aria-hidden="true" />
      </button>
    </aside>
  );
}
