export { adminService } from "./admin.service";
export type {
  AdminUserListParams,
  CreateAdminUserPayload,
  CreateRolePayload,
  UpdateAdminUserPayload,
  UpdateRolePayload,
} from "./admin.service";
export { announcementService } from "./announcement.service";
export { authService } from "./auth.service";
export { blogService } from "./blog.service";
export { careerService } from "./career.service";
export { contactService } from "./contact.service";
export {
  attendanceService,
  dashboardService,
  documentService,
  employeeService,
  leaveService,
} from "./hr.service";
export { leadService } from "./lead.service";
export type {
  CreateLeadActivityPayload,
  CreateLeadPayload,
  LeadListParams,
  UpdateLeadPayload,
} from "./lead.service";
export { portfolioService } from "./portfolio.service";
export { serviceService } from "./service.service";

export { taskService } from "./task.service";
export type {
  CreateTaskPayload,
  ProjectTask,
  TaskListParams,
  UpdateTaskPayload,
} from "./task.service";
