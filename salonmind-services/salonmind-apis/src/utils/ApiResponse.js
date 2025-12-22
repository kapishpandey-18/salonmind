/**
 * Standard API Response format
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success", metadata = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;

    if (metadata) {
      this.metadata = metadata;
    }
  }

  // Factory methods
  static success(data, message = "Operation successful", statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data, message = "Resource created successfully") {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = "Operation successful") {
    return new ApiResponse(204, null, message);
  }

  // Pagination helper
  static paginated(data, pagination) {
    const response = new ApiResponse(200, data, "Success");
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    };
    return response;
  }
}

module.exports = ApiResponse;
