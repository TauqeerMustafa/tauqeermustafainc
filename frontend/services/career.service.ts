import { API_ENDPOINTS } from "@/constants/api";
import type { Career } from "@/types";

import { createResourceService } from "./resource-service";

export type CareerPayload = Pick<Career, "slug" | "title" | "location" | "type" | "summary" | "isOpen"> & {
  responsibilities?: string[];
};

export const careerService = createResourceService<Career, CareerPayload>(API_ENDPOINTS.careers);
