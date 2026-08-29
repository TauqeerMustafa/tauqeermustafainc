"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Users, MessageSquare, LogOut, Briefcase } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

const EMPLOYEE_NAV = [
  { title: "Dashboard", href: "/employees/dashboard", icon: Briefcase },
  { title: "My Tasks", href: "/employees/tasks", icon: CheckSquare },
  { title: "My Leads", href: "/employees/leads", icon: Users },
  { title: "Messages", href: "/employees/messages", icon: MessageSquare },
];

export default function EmployeeSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-[#fcfbfa] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{ borderColor: "var(--adm-border)" }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: "var(--adm-border)" }}>
          <Link href="/employees/dashboard" onClick={onClose} className="inline-flex items-center gap-2.5 group">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-[#e2ded9] transition group-hover:border-[#141413]">
              <span className="font-bold text-[#141413] text-lg leading-none">T</span>
            </span>
            <div className="flex flex-col">
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--adm-text)" }}>Tauqeer Inc.</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#696969]">Employee</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#696969]">Workspace</p>
            <ul className="space-y-1">
              {EMPLOYEE_NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`adm-nav-link mb-0.5 flex items-center gap-3 rounded-[20px] px-4 py-2.5 text-[15px] font-medium transition-all ${
                        active ? "bg-[#e8e2da] text-[#141413]" : "text-[#696969] hover:bg-[#f3f0ee] hover:text-[#141413]"
                      }`}
                    >
                      <item.icon size={18} strokeWidth={active ? 2.5 : 2} className="shrink-0 transition-transform duration-200" />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        <div className="border-t px-5 py-4" style={{ borderColor: "var(--adm-border)" }}>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-3 rounded-[20px] px-4 py-2.5 text-[15px] font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

