"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  FileText,
  Users,
  Bell,
  Mail,
  Settings,
} from "lucide-react";

const links = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Services", href: "/admin/services", icon: Briefcase },
  { title: "Portfolio", href: "/admin/portfolio", icon: FolderOpen },
  { title: "Blog", href: "/admin/blog", icon: FileText },
  { title: "Careers", href: "/admin/careers", icon: Users },
  { title: "Announcements", href: "/admin/announcements", icon: Bell },
  { title: "Messages", href: "/admin/messages", icon: Mail },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-screen border-r border-white/10 bg-[#08101F]">

      <div className="border-b border-white/10 p-8">

        <h1 className="text-2xl font-bold text-yellow-400">
          Tauqeer Inc.
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Admin Dashboard
        </p>

      </div>

      <nav className="p-4">

        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-yellow-400 text-black"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}
