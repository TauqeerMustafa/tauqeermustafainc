/**
 * HR / people-operations payloads.
 *
 * These mirror the camelCase JSON emitted by the FastAPI HR routers
 * (backend/app/schemas/{attendance,leave,document,employee,dashboard}.py).
 * Those schemas used to be plain `BaseModel`, so the API served snake_case for
 * this one subsystem while everything else served camelCase — they now extend
 * `CamelModel` like the rest of the API, and these types are the contract.
 *
 * Note the HR endpoints return bare arrays/objects, NOT the `ApiResponse<T>`
 * envelope used by the CMS routers.
 */

export type AttendanceStatus = "present" | "late" | "absent" | "half_day" | "leave";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus | string;
  notes: string | null;
  employeeName?: string | null;
}

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: LeaveStatus | string;
  managerId?: string | null;
  managerNotes?: string | null;
  createdAt: string;
  employeeName?: string | null;
}

export interface CreateLeaveRequestPayload {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
}

export interface UpdateLeaveStatusPayload {
  status: Exclude<LeaveStatus, "pending" | "cancelled"> | string;
  managerNotes?: string;
}

export interface HrDocument {
  id: string;
  title: string;
  fileUrl: string;
  documentType: string;
  uploadedById?: string | null;
  employeeId?: string | null;
  createdAt: string;
  uploadedByName?: string | null;
  employeeName?: string | null;
}

export interface UploadDocumentPayload {
  title: string;
  fileUrl: string;
  documentType?: string;
  employeeId?: string | null;
}

export interface EmployeeRecord {
  id: string;
  userId: string;
  employeeIdString?: string | null;
  jobTitle?: string | null;
  departmentId?: string | null;
  managerId?: string | null;
  joiningDate?: string | null;
  status: string;
  address?: string | null;
  emergencyContact?: string | null;
  /** Flattened from the linked user row by the backend. */
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId?: string | null;
  employeeIdString?: string | null;
  jobTitle?: string | null;
  departmentId?: string | null;
  managerId?: string | null;
  joiningDate?: string | null;
  status?: string;
  address?: string | null;
  emergencyContact?: string | null;
}

/**
 * PATCH /employees/{id} maps onto `EmployeeUpdate`, which carries only the
 * employment fields. Name, email and role live on the linked user row and are
 * edited through /admin/users, so they are deliberately absent here.
 */
export interface UpdateEmployeePayload {
  jobTitle?: string | null;
  departmentId?: string | null;
  managerId?: string | null;
  joiningDate?: string | null;
  status?: string;
  address?: string | null;
  emergencyContact?: string | null;
}

// ── Dashboards ────────────────────────────────────────────────────────────────

export interface DashboardAttendance {
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface DashboardTask {
  id: string;
  title: string;
  status: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: string;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  publishedAt: string | null;
}

export interface DashboardDocument {
  id: string;
  title: string;
  type: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  body: string | null;
  createdAt: string | null;
}

export interface EmployeeDashboard {
  attendance: DashboardAttendance;
  tasks: DashboardTask[];
  leave: { pendingCount: number };
  projects: DashboardProject[];
  announcements: DashboardAnnouncement[];
  documents: DashboardDocument[];
  notifications: DashboardNotification[];
}

export interface PendingLeaveSummary {
  id: string;
  employee: string;
  leaveType: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface AdminDashboard {
  overview: {
    totalEmployees: number;
    present: number;
    onLeave: number;
    openTasks: number;
  };
  attendanceToday: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
  };
  pendingLeave: PendingLeaveSummary[];
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string | null;
    createdAt: string | null;
  }>;
  tasks: DashboardTask[];
  projects: DashboardProject[];
  announcements: DashboardAnnouncement[];
  documents: DashboardDocument[];
}

/** One bar of a breakdown chart on the management dashboard. */
export interface CountByKey {
  key: string;
  label: string;
  count: number;
}

export interface ManagementProject extends DashboardProject {
  progress: number;
  nextMilestone: string | null;
}

/**
 * GET /dashboard/projects — one row of the Delivery page's full project table.
 * Richer than `ManagementProject`: carries the client and live task counts so
 * the page can rank projects by load without a task fetch per row.
 */
export interface ManagementProjectRow extends ManagementProject {
  clientName: string | null;
  summary: string | null;
  openTasks: number;
  overdueTasks: number;
  updatedAt: string | null;
}

/**
 * GET /dashboard/management. Deliberately not `AdminDashboard`: the admin
 * dashboard carries the audit trail and stays admin-only, so the management
 * portal (admin + exec + team_lead) reads this manager-gated shape instead.
 */
export interface ManagementDashboard {
  overview: {
    headcount: number;
    presentToday: number;
    onLeaveToday: number;
    pendingApprovals: number;
    activeProjects: number;
    openTasks: number;
    overdueTasks: number;
  };
  attendanceToday: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
  };
  headcountByRole: CountByKey[];
  headcountByDepartment: CountByKey[];
  delivery: CountByKey[];
  pendingLeave: PendingLeaveSummary[];
  tasks: DashboardTask[];
  projects: ManagementProject[];
}
