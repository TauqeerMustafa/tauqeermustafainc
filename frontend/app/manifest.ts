import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tauqeer Mustafa Inc Portals",
    short_name: "TMI Portals",
    description: "Enterprise Operations & Staff Management Portal for Employees, Admin, and Management.",
    start_url: "/portals",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0c",
    theme_color: "#1a56db",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Employee Desk",
        short_name: "Employees",
        description: "Staff check-in, attendance, tasks, and direct chat",
        url: "/employees/dashboard",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
      {
        name: "Admin Desk",
        short_name: "Admin",
        description: "Company management, revenue, people, and WhatsApp desk",
        url: "/admin/dashboard",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
      {
        name: "Management Desk",
        short_name: "Management",
        description: "Delivery health, headcount, and growth reporting",
        url: "/management/dashboard",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
      {
        name: "Staff Direct Chat",
        short_name: "Staff Chat",
        description: "Internal staff communications & desk messaging",
        url: "/employees/chat",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
    ],
  };
}
