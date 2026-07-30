import Link from "next/link";
import {
  Plus,
  FileText,
  Briefcase,
  FolderOpen,
  Bell,
  Users,
} from "lucide-react";

const actions = [
  {
    title: "New Blog",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Add Service",
    href: "/admin/services",
    icon: Briefcase,
  },
  {
    title: "New Portfolio",
    href: "/admin/portfolio",
    icon: FolderOpen,
  },
  {
    title: "Announcement",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    title: "View Messages",
    href: "/admin/messages",
    icon: Users,
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-none border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="mb-6 flex items-center gap-3">

        <Plus className="text-yellow-400" size={26} />

        <h2 className="text-2xl font-bold text-white">
          Quick Actions
        </h2>

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center gap-4 rounded-none border border-white/10 bg-[#08101F] p-5 transition hover:border-yellow-400 hover:bg-white/5"
            >

              <div className="rounded-none bg-yellow-400/10 p-3 text-yellow-400">
                <Icon size={22} />
              </div>

              <span className="font-medium text-white">
                {action.title}
              </span>

            </Link>
          );
        })}

      </div>

    </section>
  );
}
