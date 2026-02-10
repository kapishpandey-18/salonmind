import type { Request } from "express";
import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import Branch from "../../../models/Branch.js";
import type { IBranchDocument } from "../../../models/Branch.js";

const normalizeId = (value: unknown): string | null => {
  if (!value) {
    return null;
  }
  return value.toString();
};

async function findDefaultBranch(
  tenantId: Types.ObjectId | string
): Promise<IBranchDocument | null> {
  let branch = await Branch.findOne({
    tenant: tenantId,
    isDefault: true,
    isActive: true,
  });
  if (!branch) {
    branch = await Branch.findOne({
      tenant: tenantId,
      isActive: true,
    }).sort({ createdAt: 1 });
  }
  return branch as IBranchDocument | null;
}

export async function resolveBranchContext({
  tenantId,
  branchId,
  fallbackToDefault = false,
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  fallbackToDefault?: boolean;
}): Promise<IBranchDocument> {
  if (!tenantId) {
    throw ApiError.badRequest("Tenant context missing");
  }

  const normalizedId = normalizeId(branchId);
  if (normalizedId) {
    const branch = await Branch.findOne({
      _id: normalizedId,
      tenant: tenantId,
      isActive: true,
    });
    if (branch) {
      return branch as IBranchDocument;
    }
    if (!fallbackToDefault) {
      throw ApiError.badRequest("Branch not found");
    }
  }

  if (!fallbackToDefault) {
    throw ApiError.badRequest("branchId is required");
  }

  const fallbackBranch = await findDefaultBranch(tenantId);
  if (!fallbackBranch) {
    throw ApiError.badRequest("No branches configured for tenant");
  }
  return fallbackBranch;
}

export function extractBranchIdFromRequest(req: Request): string | null {
  return (
    (req.query?.branchId as string) ||
    (req.body as Record<string, unknown>)?.branchId as string ||
    (req.headers?.["x-branch-id"] as string) ||
    normalizeId(req.user?.activeBranch)
  );
}
