import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type {
  AdminDashboard,
  AttendanceRecord,
  CreateEmployeePayload,
  CreateLeaveRequestPayload,
  EmployeeDashboard,
  EmployeeRecord,
  HrDocument,
  LeaveRequest,
  ManagementDashboard,
  ManagementProjectRow,
  UpdateEmployeePayload,
  UpdateLeaveStatusPayload,
  UploadDocumentFilePayload,
  UploadDocumentPayload,
} from "@/types";

/**
 * People-operations API surface.
 *
 * Everything here goes through `apiClient`, so it inherits the bearer token and
 * the shared error normalizer. The portal pages previously called
 * `fetch("/api/attendance/me")` and friends — relative paths that resolved to
 * Next.js route handlers which do not exist, so every one of them 404'd and the
 * UI silently fell back to hard-coded mock arrays.
 *
 * Unlike the CMS services these endpoints return bare payloads, not
 * `ApiResponse<T>`.
 */
export const attendanceService = {
  mine: (limit = 30) =>
    apiRequest<AttendanceRecord[]>({
      url: API_ENDPOINTS.attendance.me,
      method: "GET",
      params: { limit },
    }),
  roster: (date?: string) =>
    apiRequest<AttendanceRecord[]>({
      url: API_ENDPOINTS.attendance.roster,
      method: "GET",
      params: date ? { date } : undefined,
    }),
  /** One person's history. `employeeId` overrides the roster's date filter. */
  forEmployee: (employeeId: string) =>
    apiRequest<AttendanceRecord[]>({
      url: API_ENDPOINTS.attendance.roster,
      method: "GET",
      params: { employeeId },
    }),
  checkIn: (notes?: string) =>
    apiRequest<AttendanceRecord>({
      url: API_ENDPOINTS.attendance.checkIn,
      method: "POST",
      data: { notes: notes ?? null },
    }),
  checkOut: (notes?: string) =>
    apiRequest<AttendanceRecord>({
      url: API_ENDPOINTS.attendance.checkOut,
      method: "POST",
      data: { notes: notes ?? null },
    }),
};

export const leaveService = {
  mine: () =>
    apiRequest<LeaveRequest[]>({ url: API_ENDPOINTS.leave.me, method: "GET" }),
  queue: (status = "pending") =>
    apiRequest<LeaveRequest[]>({
      url: API_ENDPOINTS.leave.queue,
      method: "GET",
      params: status ? { status } : undefined,
    }),
  /** Full history for one employee, regardless of status. */
  forEmployee: (employeeId: string) =>
    apiRequest<LeaveRequest[]>({
      url: API_ENDPOINTS.leave.queue,
      method: "GET",
      params: { employeeId },
    }),
  submit: (payload: CreateLeaveRequestPayload) =>
    apiRequest<LeaveRequest>({
      url: API_ENDPOINTS.leave.request,
      method: "POST",
      data: payload,
    }),
  decide: (id: string, payload: UpdateLeaveStatusPayload) =>
    apiRequest<LeaveRequest>({
      url: API_ENDPOINTS.leave.status(id),
      method: "PATCH",
      data: payload,
    }),
};

export const documentService = {
  mine: () =>
    apiRequest<HrDocument[]>({ url: API_ENDPOINTS.documents.me, method: "GET" }),
  all: () =>
    apiRequest<HrDocument[]>({ url: API_ENDPOINTS.documents.all, method: "GET" }),
  /** Register a document that already lives at a public URL. */
  upload: (payload: UploadDocumentPayload) =>
    apiRequest<HrDocument>({
      url: API_ENDPOINTS.documents.upload,
      method: "POST",
      data: payload,
    }),
  /**
   * Upload the actual file. The API stores the bytes and hands back a document
   * whose `fileUrl` points at its own download route.
   */
  uploadFile: ({ file, title, documentType, employeeId }: UploadDocumentFilePayload) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    if (documentType) form.append("documentType", documentType);
    // Left out entirely when unset — a blank string is not a UUID.
    if (employeeId) form.append("employeeId", employeeId);

    return apiRequest<HrDocument>({
      url: API_ENDPOINTS.documents.file,
      method: "POST",
      data: form,
    });
  },
  remove: (id: string) =>
    apiRequest<{ id: string }>({
      url: API_ENDPOINTS.documents.detail(id),
      method: "DELETE",
    }),
  /**
   * Fetch a stored file as a blob.
   *
   * The download route is authenticated, and an `<a href>` sends no headers — so
   * the bytes have to come through the API client (which attaches the bearer
   * token) and be handed to the browser as an object URL.
   */
  download: (id: string) =>
    apiRequest<Blob>({
      url: API_ENDPOINTS.documents.download(id),
      method: "GET",
      responseType: "blob",
    }),
};

export const employeeService = {
  list: () =>
    apiRequest<EmployeeRecord[]>({ url: API_ENDPOINTS.employees.list, method: "GET" }),
  detail: (id: string) =>
    apiRequest<EmployeeRecord>({
      url: API_ENDPOINTS.employees.detail(id),
      method: "GET",
    }),
  create: (payload: CreateEmployeePayload) =>
    apiRequest<EmployeeRecord>({
      url: API_ENDPOINTS.employees.list,
      method: "POST",
      data: payload,
    }),
  update: (id: string, payload: UpdateEmployeePayload) =>
    apiRequest<EmployeeRecord>({
      url: API_ENDPOINTS.employees.detail(id),
      method: "PATCH",
      data: payload,
    }),
  setStatus: (id: string, status: string) =>
    apiRequest<EmployeeRecord>({
      url: API_ENDPOINTS.employees.status(id),
      method: "PATCH",
      data: { status },
    }),
};

export const dashboardService = {
  employee: () =>
    apiRequest<EmployeeDashboard>({
      url: API_ENDPOINTS.dashboard.employee,
      method: "GET",
    }),
  admin: () =>
    apiRequest<AdminDashboard>({ url: API_ENDPOINTS.dashboard.admin, method: "GET" }),
  /** Manager-gated reporting read model — see ManagementDashboard. */
  management: () =>
    apiRequest<ManagementDashboard>({
      url: API_ENDPOINTS.dashboard.management,
      method: "GET",
    }),
  /** Full delivery table for the management portal — see ManagementProjectRow. */
  projects: () =>
    apiRequest<ManagementProjectRow[]>({
      url: API_ENDPOINTS.dashboard.projects,
      method: "GET",
    }),
  /** The caller's own projects. Same shape, no manager gate, task counts scoped
   *  to their assignments — what a staff member may see of the delivery book. */
  myProjects: () =>
    apiRequest<ManagementProjectRow[]>({
      url: API_ENDPOINTS.dashboard.myProjects,
      method: "GET",
    }),
};
