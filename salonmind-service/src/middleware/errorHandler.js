const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

/**
 * Global error handler middleware
 * Catches all errors and sends consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = ApiError.conflict(message);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest("Validation failed", errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token expired");
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details: error.details || [],
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
      }),
    },
  });
};

/**
 * Handle 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
