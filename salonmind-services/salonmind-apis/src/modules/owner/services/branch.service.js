const ApiError = require("../../../utils/ApiError");
const Branch = require("../../../models/Branch");
const Tenant = require("../../../models/Tenant");
const User = require("../../../models/User");

async function listBranches({ tenantId }) {
  return Branch.find({ tenant: tenantId }).sort({ createdAt: 1 });
}

async function createBranch({ tenantId, payload }) {
  const branchCount = await Branch.countDocuments({ tenant: tenantId });
  const branch = await Branch.create({
    tenant: tenantId,
    name: payload.name,
    code: payload.code,
    address: payload.address || {},
    phone: payload.phone || "",
    email: payload.email || "",
    isDefault: branchCount === 0,
    isActive: payload.isActive ?? true,
  });

  if (branch.isDefault) {
    await Tenant.findByIdAndUpdate(tenantId, {
      defaultBranch: branch._id,
    });
  }

  return branch;
}

async function updateBranch({ tenantId, branchId, payload }) {
  const branch = await Branch.findOne({ _id: branchId, tenant: tenantId });
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }

  if (payload.name) branch.name = payload.name;
  if (payload.address) branch.address = payload.address;
  if (payload.phone !== undefined) branch.phone = payload.phone;
  if (payload.email !== undefined) branch.email = payload.email;
  if (payload.hasOwnProperty("isActive")) {
    branch.isActive = payload.isActive;
  }
  await branch.save();
  return branch;
}

async function setDefaultBranch({ tenantId, branchId }) {
  const branch = await Branch.findOne({ _id: branchId, tenant: tenantId });
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }

  await Branch.updateMany(
    { tenant: tenantId, _id: { $ne: branchId } },
    { $set: { isDefault: false } }
  );
  branch.isDefault = true;
  await branch.save();
  await Tenant.findByIdAndUpdate(tenantId, { defaultBranch: branch._id });

  return branch;
}

async function setActiveBranchForUser({ tenantId, userId, branchId }) {
  if (!branchId) {
    throw ApiError.badRequest("branchId is required");
  }

  const branch = await Branch.findOne({
    _id: branchId,
    tenant: tenantId,
    isActive: true,
  });
  if (!branch) {
    throw ApiError.badRequest("Branch not found");
  }

  await User.findByIdAndUpdate(userId, { activeBranch: branch._id });
  return branch;
}

module.exports = {
  listBranches,
  createBranch,
  updateBranch,
  setDefaultBranch,
  setActiveBranchForUser,
};
