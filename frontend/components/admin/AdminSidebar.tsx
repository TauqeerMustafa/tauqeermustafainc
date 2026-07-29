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
  X,
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 min-h-screen border-r border-white/10 bg-[#08101F] transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="flex items-center justify-between border-b border-white/10 p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              Tauqeer Inc.
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Admin Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center border border-white/10 text-slate-300 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-4">

          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`mb-2 flex items-center gap-3 rounded-none px-4 py-3 transition ${
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
    </>
  );
}
