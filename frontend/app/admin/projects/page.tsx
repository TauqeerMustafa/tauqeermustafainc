import DeliveryBanner from "@/components/portal/DeliveryBanner";
import ProjectsGrid from "@/components/portal/ProjectsGrid";

export default function AdminProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <DeliveryBanner active="projects" />
      <ProjectsGrid isAdmin={true} />
    </div>
  );
}
