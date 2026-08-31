export const queryKeys = {
  admin: {
    users: ["admin", "users"] as const,
    roles: ["admin", "roles"] as const,
    permissions: ["admin", "permissions"] as const,
    teams: ["admin", "teams"] as const,
    metrics: ["admin", "metrics"] as const,
  },
  services: {
    all: ["services"] as const,
    detail: (slug: string) => ["services", slug] as const,
  },
  blogs: {
    all: ["blogs"] as const,
    detail: (slug: string) => ["blogs", slug] as const,
  },
  portfolio: {
    all: ["portfolio"] as const,
    detail: (slug: string) => ["portfolio", slug] as const,
  },
  careers: {
    all: ["careers"] as const,
    detail: (slug: string) => ["careers", slug] as const,
  },
  announcements: {
    all: ["announcements"] as const,
  },
  messages: {
    all: ["messages"] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
  employees: {
    all: ["employees"] as const,
    detail: (id: string) => ["employees", id] as const,
  },
  attendance: {
    me: ["attendance", "me"] as const,
    roster: (date: string) => ["attendance", "roster", date] as const,
    forEmployee: (employeeId: string) => ["attendance", "employee", employeeId] as const,
  },
  leave: {
    me: ["leave", "me"] as const,
    queue: (status: string) => ["leave", "queue", status] as const,
    forEmployee: (employeeId: string) => ["leave", "employee", employeeId] as const,
  },
  documents: {
    me: ["documents", "me"] as const,
    all: ["documents", "all"] as const,
  },
  leads: {
    list: (params: string) => ["leads", "list", params] as const,
    pipeline: ["leads", "pipeline"] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
  dashboard: {
    employee: ["dashboard", "employee"] as const,
    admin: ["dashboard", "admin"] as const,
    management: ["dashboard", "management"] as const,
    projects: ["dashboard", "projects"] as const,
  },
  tasks: {
    list: (params: string) => ["tasks", "list", params] as const,
    mine: ["tasks", "mine"] as const,
  },
} as const;
