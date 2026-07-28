import {
  CheckCircle2,
  Briefcase,
  FileText,
  Users,
} from "lucide-react";

const activities = [
  {
    title: "New contact message received",
    time: "5 minutes ago",
    icon: CheckCircle2,
  },
  {
    title: "Portfolio updated",
    time: "25 minutes ago",
    icon: Briefcase,
  },
  {
    title: "New blog published",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    title: "Career application submitted",
    time: "Today",
    icon: Users,
  },
];

export default function RecentActivity() {
  return (
    <section className="rounded-none border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-4 rounded-none border border-white/10 bg-[#08101F] p-4"
            >
              <div className="rounded-none bg-yellow-400/10 p-3 text-yellow-400">
                <Icon size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {activity.title}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {activity.time}
                </p>
              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}
