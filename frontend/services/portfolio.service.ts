import { API_ENDPOINTS } from "@/constants/api";
import type { Portfolio } from "@/types";

import { createResourceService } from "./resource-service";

export type PortfolioPayload = Pick<
  Portfolio,
  "slug" | "title" | "summary" | "category" | "technologies"
> & {
  impact?: string;
  gallery?: string[];
};

export const portfolioService = createResourceService<Portfolio, PortfolioPayload>(API_ENDPOINTS.portfolio);
