export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  services: "/services",
  blogs: "/blog",
  portfolio: "/portfolio",
  careers: "/careers",
  contact: "/contact",
  announcements: "/announcements",
} as const;
