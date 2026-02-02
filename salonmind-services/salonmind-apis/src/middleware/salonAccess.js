const ApiError = require("../utils/ApiError");
const Salon = require("../models/Salon");

/**
 * Multi-tenant middleware - ensures data isolation by salon
 * Automatically adds salonId to request for all queries
 *
 * This middleware must be used after authenticate middleware
 */
const ensureSalonAccess = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw ApiError.unauthorized("Authentication required");
    }

    // Get salon ID from trusted sources only
    // SECURITY: Never trust client-provided salon ID in request body
    // to prevent unauthorized cross-tenant data access
    let salonId = null;

    // 1. From URL params (e.g., /salons/:salonId/appointments)
    if (req.params.salonId) {
      salonId = req.params.salonId;
    }
    // 2. From user's assigned salon (trusted source)
    else if (user.salon) {
      salonId = user.salon._id || user.salon;
    }

    // Check if salonId exists
    if (!salonId) {
      throw ApiError.badRequest("Salon ID is required");
    }

    // Verify salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      throw ApiError.notFound("Salon not found");
    }

    // Check user access based on role
    switch (user.role) {
      case "owner":
        // Owner can only access their own salon
        if (salon.owner.toString() !== user._id.toString()) {
          throw ApiError.forbidden("Access denied to this salon");
        }
        break;

      case "manager":
      case "staff":
        // Manager and staff can only access their assigned salon
        if (!user.salon || user.salon.toString() !== salonId.toString()) {
          throw ApiError.forbidden("Access denied to this salon");
        }
        break;

      case "client":
        // Clients have limited access (handled in specific routes)
        break;

      default:
        throw ApiError.forbidden("Invalid user role");
    }

    // Attach salonId to request for use in controllers
    req.salonId = salonId;
    req.salon = salon;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional salon access check
 * Doesn't throw error if no salon, just attaches if available
 */
const optionalSalonAccess = async (req, res, next) => {
  try {
    const user = req.user;

    if (user && user.salon) {
      req.salonId = user.salon._id || user.salon;
      req.salon = await Salon.findById(req.salonId);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ensureSalonAccess,
  optionalSalonAccess,
};
