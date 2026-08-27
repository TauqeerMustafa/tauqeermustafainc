import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, Briefcase, Lock } from "lucide-react";

const portals = [
  {
    name: "Client Portal",
    description: "Access your project deliverables, invoices, and secure communications.",
    href: "/client/login",
    icon: <Users className="h-6 w-6 text-brand-500" />,
    color: "bg-brand-50 border-brand-100",
  },
  {
    name: "Admin Portal",
    description: "System administration and global configurations.",
    href: "/admin/login",
    icon: <ShieldCheck className="h-6 w-6 text-red-500" />,
    color: "bg-red-50 border-red-100",
  },
  {
    name: "Employee Portal",
    description: "Internal tools, HR resources, and team collaboration.",
    href: "/employees/login",
    icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
    color: "bg-emerald-50 border-emerald-100",
  },
  {
    name: "Management Portal",
    description: "Executive dashboards and reporting tools.",
    href: "/management/login",
    icon: <Lock className="h-6 w-6 text-purple-500" />,
    color: "bg-purple-50 border-purple-100",
  },
];

export default function PortalsPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            TMI Portals
          </h1>
          <p className="mt-4 text-lg text-ink-lighter">
            Select your secure workspace to log in and access your personalized dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {portals.map((portal) => (
            <Link
              key={portal.name}
              href={portal.href}
              className={`relative rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${portal.color} flex flex-col group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-white p-3 shadow-sm border border-black/5">
                  {portal.icon}
                </div>
                <ArrowRight className="h-5 w-5 text-ink-light opacity-50 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-2">{portal.name}</h3>
              <p className="text-ink-lighter text-sm flex-grow">{portal.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
