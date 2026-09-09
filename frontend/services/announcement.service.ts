import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { Announcement } from "@/types";
import type { ApiResponse } from "@/types/api";

import { createResourceService } from "./resource-service";

export type AnnouncementPayload = Pick<Announcement, "title" | "body" | "isPublished"> & {
  imageUrl?: string | null;
};

const baseResource = createResourceService<Announcement, AnnouncementPayload>(
  API_ENDPOINTS.announcements,
);

export const announcementService = {
  ...baseResource,
  bulkDelete: (ids: string[]) =>
    apiRequest<ApiResponse<{ deletedCount: number }>>({
      url: API_ENDPOINTS.announcementsBulkDelete,
      method: "POST",
      data: { ids },
    }),
};
