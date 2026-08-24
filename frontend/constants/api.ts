export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  admin: {
    users: "/admin/users",
    roles: "/admin/roles",
    teams: "/admin/teams",
    metrics: "/admin/metrics",
  },
  services: "/services",
  blogs: "/blog",
  portfolio: "/portfolio",
  careers: "/careers",
  contact: "/contact",
  announcements: "/announcements",
} as const;
