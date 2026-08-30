export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  admin: {
    tasks: "/tasks",
    client: "/client",
    users: "/admin/users",
    roles: "/admin/roles",
    permissions: "/admin/permissions",
    teams: "/admin/teams",
    metrics: "/admin/metrics",
  },
  // HR routers return bare arrays/objects, not the ApiResponse envelope.
  employees: {
    list: "/employees/",
    detail: (id: string) => `/employees/${id}`,
    status: (id: string) => `/employees/${id}/status`,
  },
  attendance: {
    checkIn: "/attendance/check-in",
    checkOut: "/attendance/check-out",
    me: "/attendance/me",
    roster: "/attendance/admin",
  },
  leave: {
    request: "/leave/request",
    me: "/leave/me",
    queue: "/leave/admin",
    status: (id: string) => `/leave/admin/${id}/status`,
  },
  documents: {
    upload: "/documents/upload",
    me: "/documents/me",
    all: "/documents/admin",
  },
  dashboard: {
    employee: "/dashboard/employee",
    admin: "/dashboard/admin",
    management: "/dashboard/management",
    projects: "/dashboard/projects",
  },
  leads: {
    root: "/leads",
    pipeline: "/leads/pipeline",
    byId: (id: string) => `/leads/${id}`,
    activities: (id: string) => `/leads/${id}/activities`,
  },
  services: "/services",
  blogs: "/blog",
  portfolio: "/portfolio",
  careers: "/careers",
  contact: "/contact",
  announcements: "/announcements",
} as const;

