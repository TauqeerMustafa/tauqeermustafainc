export const queryKeys = {
  admin: {
    users: ["admin", "users"] as const,
    roles: ["admin", "roles"] as const,
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
} as const;
