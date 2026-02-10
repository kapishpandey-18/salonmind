import type { PaginationMeta } from "../types/index.js";

class ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
  metadata?: Record<string, unknown>;
  pagination?: PaginationMeta;

  constructor(
    statusCode: number,
    data: T,
    message = "Success",
    metadata: Record<string, unknown> | null = null
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;

    if (metadata) {
      this.metadata = metadata;
    }
  }

  static success<T>(
    data: T,
    message = "Operation successful",
    statusCode = 200
  ): ApiResponse<T> {
    return new ApiResponse(statusCode, data, message);
  }

  static created<T>(
    data: T,
    message = "Resource created successfully"
  ): ApiResponse<T> {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = "Operation successful"): ApiResponse<null> {
    return new ApiResponse(204, null, message);
  }

  static paginated<T>(
    data: T,
    pagination: { page: number; limit: number; total: number }
  ): ApiResponse<T> {
    const response = new ApiResponse(200, data, "Success");
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext:
        pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    };
    return response;
  }
}

export default ApiResponse;
