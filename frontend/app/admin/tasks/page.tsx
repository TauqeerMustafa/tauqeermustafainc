import DeliveryBanner from "@/components/portal/DeliveryBanner";
import TaskKanban from "@/components/admin/tasks/TaskKanban";
import B2bProgressTracker from "@/components/admin/tasks/B2bProgressTracker";

export default function AdminTasksPage() {
  return (
    <div className="flex flex-col gap-8">
      <DeliveryBanner active="tasks" />
      <B2bProgressTracker />
      <TaskKanban isAdmin={true} />
    </div>
  );
}
