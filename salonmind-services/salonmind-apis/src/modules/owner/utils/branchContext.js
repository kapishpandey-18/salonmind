const ApiError = require("../../../utils/ApiError");
const Branch = require("../../../models/Branch");

const normalizeId = (value) => {
  if (!value) {
    return null;
  }
  return value.toString();
};

async function findDefaultBranch(tenantId) {
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
  return branch;
}

async function resolveBranchContext({
  tenantId,
  branchId,
  fallbackToDefault = false,
}) {
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
      return branch;
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

function extractBranchIdFromRequest(req) {
  return (
    req.query?.branchId ||
    req.body?.branchId ||
    req.headers?.["x-branch-id"] ||
    normalizeId(req.user?.activeBranch)
  );
}

module.exports = {
  resolveBranchContext,
  extractBranchIdFromRequest,
};
