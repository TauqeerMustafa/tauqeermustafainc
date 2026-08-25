import { API_ENDPOINTS } from "@/constants/api";
import type { Service } from "@/types";

import { createResourceService } from "./resource-service";

export type ServicePayload = Pick<Service, "slug" | "title" | "shortDescription" | "description" | "outcomes"> & {
  icon?: string;
};

export const serviceService = createResourceService<Service, ServicePayload>(API_ENDPOINTS.services);
