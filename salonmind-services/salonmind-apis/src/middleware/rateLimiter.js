const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

/**
 * Rate limiting middleware for auth endpoints
 * Protects against brute force attacks and SMS flooding
 */

// Skip rate limiting in test environment
const isTestEnv = process.env.NODE_ENV === "test";
const skipInTest = () => isTestEnv;

// Key generator that uses phone number for OTP endpoints
const phoneKeyGenerator = (req) => {
  // Use phone number as key for OTP-related requests
  const phone = req.body?.phoneNumber || req.body?.phone;
  if (phone) {
    return `phone:${phone}`;
  }
  // Fallback to IP for requests without phone
  return req.ip;
};

// Key generator for token refresh (uses IP + any identifier)
const tokenKeyGenerator = (req) => {
  return req.ip;
};

// Standard error handler for rate limit exceeded
const rateLimitHandler = (req, res, next, options) => {
  throw ApiError.tooManyRequests(
    options.message || "Too many requests, please try again later"
  );
};

/**
 * OTP Send Rate Limiter
 * - 5 OTP requests per phone number per 15 minutes
 * - Prevents SMS flooding attacks
 */
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  keyGenerator: phoneKeyGenerator,
  handler: rateLimitHandler,
  message: "Too many OTP requests. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  skip: skipInTest,
});

/**
 * OTP Verify Rate Limiter
 * - 10 verification attempts per IP per 15 minutes
 * - Prevents brute force OTP guessing
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  message: "Too many verification attempts. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: skipInTest,
});

/**
 * Token Refresh Rate Limiter
 * - 30 refresh requests per IP per 15 minutes
 * - Prevents token refresh abuse
 */
const tokenRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 refreshes per window
  keyGenerator: tokenKeyGenerator,
  handler: rateLimitHandler,
  message: "Too many token refresh requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

/**
 * General Auth Rate Limiter
 * - 100 requests per IP per 15 minutes for general auth endpoints
 */
const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

/**
 * Strict Rate Limiter for sensitive operations
 * - 3 requests per IP per hour
 * - For password reset, account deletion, etc.
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per window
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
  message: "Too many attempts for this sensitive operation. Please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

module.exports = {
  otpSendLimiter,
  otpVerifyLimiter,
  tokenRefreshLimiter,
  generalAuthLimiter,
  strictLimiter,
};
