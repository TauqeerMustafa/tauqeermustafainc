import {
  Briefcase,
  FolderOpen,
  FileText,
  Users,
} from "lucide-react";

import DashboardCard from "./DashboardCard";

export default function StatGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <DashboardCard
        title="Services"
        value={12}
        subtitle="Published services"
        icon={Briefcase}
      />

      <DashboardCard
        title="Portfolio"
        value={38}
        subtitle="Completed projects"
        icon={FolderOpen}
      />

      <DashboardCard
        title="Blog Posts"
        value={27}
        subtitle="Articles published"
        icon={FileText}
      />

      <DashboardCard
        title="Applications"
        value={143}
        subtitle="Career applications"
        icon={Users}
      />

    </section>
  );
}
