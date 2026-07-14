import StatGrid from "@/components/admin/StatGrid";
import QuickActions from "@/components/admin/QuickActions";
import RecentActivity from "@/components/admin/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      <StatGrid />

      <QuickActions />

      <RecentActivity />

    </div>
  );
}
