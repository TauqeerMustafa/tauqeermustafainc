import { API_ENDPOINTS } from "@/constants/api";
import type { Announcement } from "@/types";

import { createResourceService } from "./resource-service";

export type AnnouncementPayload = Pick<Announcement, "title" | "body" | "isPublished">;

export const announcementService = createResourceService<Announcement, AnnouncementPayload>(
  API_ENDPOINTS.announcements,
);
