const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Middleware to authenticate JWT token
 * Verifies token and attaches user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    throw ApiError.unauthorized("Not authorized, no token provided");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("salon", "name");

    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw ApiError.unauthorized("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token expired");
    }
    throw error;
  }
});

/**
 * Optional authentication - doesn't throw error if no token
 * Used for endpoints that work for both authenticated and guest users
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      req.user = user;
    } catch (error) {
      // Silently fail for optional auth
      req.user = null;
    }
  }

  next();
});

/**
 * Authorization middleware (for backward compatibility)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `User role '${req.user.role}' is not authorized`
      );
    }
    next();
  };
};

// Export all methods
module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  // Backward compatibility aliases
  protect: authenticate,
};
