import TaskKanban from "@/components/admin/tasks/TaskKanban";

export default function AdminTasksPage() {
  return <TaskKanban isAdmin={true} />;
}
