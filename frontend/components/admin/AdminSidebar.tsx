"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  FileText,
  Users,
  Bell,
  Mail,
  MessageSquare,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";

const links = [
  { title: "Dashboard",     href: "/admin/dashboard",     icon: LayoutDashboard },
  { title: "Services",      href: "/admin/services",      icon: Briefcase },
  { title: "Portfolio",     href: "/admin/portfolio",     icon: FolderOpen },
  { title: "Blog",          href: "/admin/blog",          icon: FileText },
  { title: "Careers",       href: "/admin/careers",       icon: Users },
  { title: "Announcements", href: "/admin/announcements", icon: Bell },
  { title: "Messages",      href: "/admin/messages",      icon: Mail },
  { title: "WhatsApp",      href: "/admin/whatsapp",      icon: MessageSquare },
  { title: "Settings",      href: "/admin/settings",      icon: Settings },
];

type Props = { isOpen: boolean; onClose: () => void };

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{ borderColor: "var(--adm-border)" }}
      >
        {/* Brand */}
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: "var(--adm-border)" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            onClick={onClose}
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[#e2ded9] transition group-hover:border-[#141413]">
              <Image
                src="/logo-mark.svg"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--adm-text)" }}>
                Tauqeer Inc.
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--adm-blue)" }}>
                Admin
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center border transition hover:bg-gray-50 lg:hidden"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-2)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p
            className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--adm-text-3)" }}
          >
            Navigation
          </p>

          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`adm-nav-link mb-0.5 flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? "active" : ""
                }`}
                style={
                  active
                    ? {
                        background: "var(--adm-blue-light)",
                        color: "var(--adm-blue)",
                        paddingLeft: "calc(0.75rem + 3px)",
                      }
                    : { color: "var(--adm-text-2)" }
                }
              >
                <Icon
                  size={17}
                  className="shrink-0 transition-transform duration-200"
                  style={{ color: active ? "var(--adm-blue)" : "var(--adm-text-3)" }}
                />
                <span className="flex-1">{item.title}</span>
                {active && (
                  <ChevronRight size={14} style={{ color: "var(--adm-blue)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="border-t px-5 py-4"
          style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface-2)" }}
        >
          <p className="text-[11px]" style={{ color: "var(--adm-text-3)" }}>
            Tauqeer Mustafa Inc. &copy; {new Date().getFullYear()}
          </p>
          <Link
            href="/"
            className="mt-1 text-[11px] font-medium transition hover:underline"
            style={{ color: "var(--adm-blue)" }}
          >
            View public site →
          </Link>
        </div>
      </aside>
    </>
  );
}
