const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Branch = require("../models/Branch");
const Tenant = require("../models/Tenant");
const TenantStaff = require("../models/TenantStaff");
const {
  getActiveSubscriptionForTenant,
  resolvePlanForTenant,
} = require("../modules/owner/services/subscription.service");

const requireActiveSubscription = asyncHandler(async (req, _res, next) => {
  if (!req.user?.tenant) {
    throw ApiError.forbidden("Tenant not found for user");
  }

  const subscription = await getActiveSubscriptionForTenant(req.user.tenant);
  if (!subscription) {
    throw ApiError.forbidden("Active subscription required");
  }

  req.activeSubscription = subscription;
  next();
});

const requireBranchAccess = asyncHandler(async (req, _res, next) => {
  const headerBranchId = req.headers["x-branch-id"] || req.headers["X-Branch-Id"];
  const branchId = headerBranchId || req.user?.activeBranch;
  if (!branchId) {
    throw ApiError.badRequest("X-Branch-Id header required");
  }

  const branch = await Branch.findOne({
    _id: branchId,
    tenant: req.user.tenant,
    isActive: true,
  });
  if (!branch) {
    throw ApiError.forbidden("Branch not accessible");
  }

  req.branch = branch;
  req.branchId = branch._id;
  next();
});

const enforcePlanLimits = (resource) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user?.tenant) {
      throw ApiError.forbidden("Tenant not found for user");
    }

    const { plan } = await resolvePlanForTenant(req.user.tenant);
    if (!plan) {
      return next();
    }

    const buildLimitError = (message, meta = {}) => {
      const error = ApiError.forbidden(message);
      error.code = "PLAN_LIMIT_EXCEEDED";
      error.errorCode = "PLAN_LIMIT_EXCEEDED";
      error.meta = meta;
      return error;
    };

    if (resource === "branch") {
      if (!plan.maxBranches) {
        return next();
      }
      const activeCount = await Branch.countDocuments({
        tenant: req.user.tenant,
        isActive: true,
      });
      if (activeCount + 1 > plan.maxBranches) {
        throw buildLimitError(
          `Plan limit reached. ${plan.planName} supports up to ${plan.maxBranches} branches.`,
          {
            resource: "BRANCH",
            limit: plan.maxBranches,
            current: activeCount,
            plan: plan.planCode,
            upgradeHint: "UPGRADE_PLAN_OR_ADDON",
          }
        );
      }
    }

    if (resource === "staff") {
      if (!plan.maxEmployees) {
        return next();
      }
      const incomingCount = Array.isArray(req.body.staff)
        ? req.body.staff.length
        : 1;
      const currentCount = await TenantStaff.countDocuments({
        tenant: req.user.tenant,
        isDeleted: false,
      });
      if (currentCount + incomingCount > plan.maxEmployees) {
        throw buildLimitError(
          `Your current plan allows up to ${plan.maxEmployees} staff members.`,
          {
            resource: "STAFF",
            limit: plan.maxEmployees,
            current: currentCount,
            plan: plan.planCode,
            upgradeHint: "UPGRADE_PLAN_OR_ADDON",
          }
        );
      }
      if (Array.isArray(req.body.staff)) {
        const tenant = await Tenant.findById(req.user.tenant).select("staff");
        if (tenant && tenant.staff.length > plan.maxEmployees) {
          throw buildLimitError(
            `Your current plan allows up to ${plan.maxEmployees} staff members.`,
            {
              resource: "STAFF",
              limit: plan.maxEmployees,
              current: tenant.staff.length,
              plan: plan.planCode,
              upgradeHint: "UPGRADE_PLAN_OR_ADDON",
            }
          );
        }
      }
    }

    next();
  });

module.exports = {
  requireActiveSubscription,
  requireBranchAccess,
  enforcePlanLimits,
};
