import DeliveryBanner from "@/components/portal/DeliveryBanner";
import TaskKanban from "@/components/admin/tasks/TaskKanban";

export default function AdminTasksPage() {
  return (
    <div className="flex flex-col gap-8">
      <DeliveryBanner active="tasks" />
      <TaskKanban isAdmin={true} />
    </div>
  );
}
