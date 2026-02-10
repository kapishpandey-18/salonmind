import type { Request, Response, NextFunction, RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Branch from "../models/Branch.js";
import Tenant from "../models/Tenant.js";
import TenantStaff from "../models/TenantStaff.js";
import {
  getActiveSubscriptionForTenant,
  resolvePlanForTenant,
} from "../modules/owner/services/subscription.service.js";

export const requireActiveSubscription = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.tenant) {
      throw ApiError.forbidden("Tenant not found for user");
    }

    const subscription = await getActiveSubscriptionForTenant(req.user.tenant);
    if (!subscription) {
      throw ApiError.forbidden("Active subscription required");
    }

    req.activeSubscription = subscription;
    next();
  }
);

export const requireBranchAccess = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const headerBranchId =
      req.headers["x-branch-id"] || req.headers["X-Branch-Id"];
    const branchId =
      (headerBranchId as string) || req.user?.activeBranch?.toString();
    if (!branchId) {
      throw ApiError.badRequest("X-Branch-Id header required");
    }

    const branch = await Branch.findOne({
      _id: branchId,
      tenant: req.user!.tenant,
      isActive: true,
    });
    if (!branch) {
      throw ApiError.forbidden("Branch not accessible");
    }

    req.branch = branch;
    req.branchId = branch._id;
    next();
  }
);

export const enforcePlanLimits = (resource: string): RequestHandler =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.tenant) {
      throw ApiError.forbidden("Tenant not found for user");
    }

    const { plan } = await resolvePlanForTenant(req.user.tenant);
    if (!plan) {
      return next();
    }

    const buildLimitError = (
      message: string,
      meta: Record<string, unknown> = {}
    ): ApiError => {
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
      const body = req.body as Record<string, unknown>;
      const incomingCount = Array.isArray(body.staff) ? body.staff.length : 1;
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
      if (Array.isArray(body.staff)) {
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
