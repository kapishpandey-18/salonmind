const ApiError = require("../utils/ApiError");

/**
 * Role-based access control middleware
 * Checks if user has one of the allowed roles
 *
 * @param {...string} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/staff', authenticate, requireRole('owner', 'manager'), createStaff);
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

/**
 * Check if user is owner
 */
const requireOwner = requireRole("owner");

/**
 * Check if user is owner or manager
 */
const requireOwnerOrManager = requireRole("owner", "manager");

/**
 * Check if user is staff (owner, manager, or staff)
 */
const requireStaff = requireRole("owner", "manager", "staff");

module.exports = {
  requireRole,
  requireOwner,
  requireOwnerOrManager,
  requireStaff,
};
