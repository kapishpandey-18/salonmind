import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

interface MongooseError extends Error {
  path?: string;
  value?: unknown;
  code?: number;
  keyPattern?: Record<string, number>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: MongooseError & ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
  });

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message) as typeof error;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message = `${field} already exists`;
    error = ApiError.conflict(message) as typeof error;
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    error = ApiError.badRequest("Validation failed", errors) as typeof error;
  }

  if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Invalid token") as typeof error;
  }

  if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token expired") as typeof error;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  const errorObj: Record<string, unknown> = {
    message,
    details: error.details || [],
  };
  if (error.code) errorObj.code = error.code;
  if (error.errorCode) errorObj.errorCode = error.errorCode;
  if (error.meta) errorObj.meta = error.meta;
  if (process.env.NODE_ENV === "development") errorObj.stack = error.stack;

  res.status(statusCode).json({
    success: false,
    error: errorObj,
  });
};

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};
