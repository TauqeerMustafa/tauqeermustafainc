import { API_ENDPOINTS } from "@/constants/api";
import type { Blog } from "@/types";

import { createResourceService } from "./resource-service";

export type BlogPayload = Pick<Blog, "slug" | "title" | "excerpt" | "category" | "isPublished"> & {
  content?: string;
};

export const blogService = createResourceService<Blog, BlogPayload>(API_ENDPOINTS.blogs);
