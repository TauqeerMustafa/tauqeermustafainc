export { useBlog, useBlogs } from "@/hooks/useBlogs";
export { useCareer, useCareers } from "@/hooks/useCareers";
export { useContact } from "@/hooks/useContact";
export { usePortfolio, usePortfolioProject } from "@/hooks/usePortfolio";
export { useService, useServices } from "@/hooks/useServices";
export { useCurrentUser, useLogin } from "@/hooks/useAuth";

// Administration (users, roles, permissions, teams).
export {
  useAdminMetrics,
  useAdminPermissions,
  useAdminRoles,
  useAdminTeams,
  useAdminUsers,
  useAssignRolePermissions,
  useCreateAdminUser,
  useCreateRole,
  useDeleteRole,
  useUpdateAdminUser,
  useUpdateRole,
} from "@/hooks/useAdmin";

// People operations (HR).
export {
  useAttendanceRoster,
  useCheckIn,
  useCheckOut,
  useEmployeeAttendance,
  useMyAttendance,
} from "@/hooks/useAttendance";
export {
  useAdminDashboard,
  useEmployeeDashboard,
  useManagementDashboard,
  useManagementProjects,
} from "@/hooks/useDashboard";
export {
  useAllDocuments,
  useDeleteDocument,
  useMyDocuments,
  useUploadDocument,
  useUploadDocumentFile,
} from "@/hooks/useDocuments";
export {
  useCreateEmployee,
  useEmployee,
  useEmployees,
  useSetEmployeeStatus,
  useUpdateEmployee,
} from "@/hooks/useEmployees";
export {
  useDecideLeave,
  useEmployeeLeave,
  useLeaveQueue,
  useMyLeave,
  useSubmitLeave,
} from "@/hooks/useLeave";

// Sales pipeline (CRM).
export {
  useCreateLead,
  useDeleteLead,
  useLead,
  useLeadPipeline,
  useLeads,
  useLogLeadActivity,
  useUpdateLead,
} from "@/hooks/useLeads";

// Delivery (project tasks).
export {
  useCreateTask,
  useDeleteTask,
  useMyTasks,
  useTasks,
  useUpdateTask,
} from "@/hooks/useTasks";
