import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import ApiError from "../utils/ApiError.js";

const isTestEnv = process.env.NODE_ENV === "test";
const skipInTest = (): boolean => isTestEnv;

const phoneKeyGenerator = (req: Request): string => {
  const phone =
    (req.body as Record<string, unknown>)?.phoneNumber ||
    (req.body as Record<string, unknown>)?.phone;
  if (phone) {
    return `phone:${phone}`;
  }
  return req.ip || "unknown";
};

const tokenKeyGenerator = (req: Request): string => {
  return req.ip || "unknown";
};

const rateLimitHandler = (
  _req: Request,
  _res: Response,
  _next: NextFunction,
  options: { message?: string }
): void => {
  throw ApiError.tooManyRequests(
    (options.message as string) || "Too many requests, please try again later"
  );
};

export const otpSendLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: phoneKeyGenerator,
  handler: rateLimitHandler,
  message: "Too many OTP requests. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skip: skipInTest,
});

export const otpVerifyLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => req.ip || "unknown",
  handler: rateLimitHandler,
  message:
    "Too many verification attempts. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: skipInTest,
});

export const tokenRefreshLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: tokenKeyGenerator,
  handler: rateLimitHandler,
  message: "Too many token refresh requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

export const generalAuthLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req: Request) => req.ip || "unknown",
  handler: rateLimitHandler,
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

export const strictLimiter: RequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req: Request) => req.ip || "unknown",
  handler: rateLimitHandler,
  message:
    "Too many attempts for this sensitive operation. Please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});
