export interface ApiResponse<TData> {
  data: TData;
  message?: string;
  success: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  pagination: Pagination;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export interface RequestMeta {
  requestId?: string;
  timestamp?: string;
}
