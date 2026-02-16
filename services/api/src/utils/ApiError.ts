class ApiError extends Error {
  statusCode: number;
  details: unknown[];
  isOperational: boolean;
  code?: string;
  errorCode?: string;
  meta?: Record<string, unknown>;

  constructor(
    statusCode: number,
    message: string,
    details: unknown[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request", details: unknown[] = []): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict"): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = "Too many requests"): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = "Internal Server Error"): ApiError {
    return new ApiError(500, message, [], false);
  }

  static serviceUnavailable(message = "Service Unavailable"): ApiError {
    return new ApiError(503, message, [], false);
  }
}

export default ApiError;
