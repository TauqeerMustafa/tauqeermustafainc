import { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="group rounded-none border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-sm uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-4xl font-bold text-white">
            {value}
          </h3>
        </div>

        <div className="rounded-none bg-yellow-400/10 p-4 text-yellow-400 transition group-hover:scale-110">
          <Icon size={34} />
        </div>

      </div>

      <div className="border-t border-white/10 pt-4">

        <p className="text-sm text-slate-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
}
