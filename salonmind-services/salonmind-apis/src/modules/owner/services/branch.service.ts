import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import Branch from "../../../models/Branch.js";
import type { IBranch, IBranchDocument } from "../../../models/Branch.js";
import Tenant from "../../../models/Tenant.js";
import User from "../../../models/User.js";

interface CreateBranchPayload {
  name: string;
  code?: string;
  address?: IBranch["address"];
  phone?: string;
  email?: string;
  isActive?: boolean;
}

interface UpdateBranchPayload {
  name?: string;
  address?: IBranch["address"];
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export async function listBranches({
  tenantId,
}: {
  tenantId: Types.ObjectId | string;
}): Promise<IBranchDocument[]> {
  return Branch.find({ tenant: tenantId }).sort({
    createdAt: 1,
  }) as Promise<IBranchDocument[]>;
}

export async function createBranch({
  tenantId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  payload: CreateBranchPayload;
}): Promise<IBranchDocument> {
  const branchCount = await Branch.countDocuments({ tenant: tenantId });
  const branch = (await Branch.create({
    tenant: tenantId,
    name: payload.name,
    code: payload.code,
    address: payload.address || {},
    phone: payload.phone || "",
    email: payload.email || "",
    isDefault: branchCount === 0,
    isActive: payload.isActive ?? true,
  })) as IBranchDocument;

  if (branch.isDefault) {
    await Tenant.findByIdAndUpdate(tenantId, {
      defaultBranch: branch._id,
    });
  }

  return branch;
}

export async function updateBranch({
  tenantId,
  branchId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  branchId: Types.ObjectId | string;
  payload: UpdateBranchPayload;
}): Promise<IBranchDocument> {
  const branch = (await Branch.findOne({
    _id: branchId,
    tenant: tenantId,
  })) as IBranchDocument | null;
  if (!branch) {
    throw ApiError.notFound("Branch not found");
  }

  if (payload.name) branch.name = payload.name;
  if (payload.address) branch.address = payload.address;
  if (payload.phone !== undefined) branch.phone = payload.phone;
  if (payload.email !== undefined) branch.email = payload.email;
  if (Object.prototype.hasOwnProperty.call(payload, "isActive")) {
    branch.isActive = payload.isActive!;
  }
  await branch.save();
  return branch;
}

export async function setDefaultBranch({
  tenantId,
  branchId,
}: {
  tenantId: Types.ObjectId | string;
  branchId: Types.ObjectId | string;
}): Promise<IBranchDocument> {
  const branch = (await Branch.findOne({
    _id: branchId,
    tenant: tenantId,
  })) as IBranchDocument | null;
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

export async function setActiveBranchForUser({
  tenantId,
  userId,
  branchId,
}: {
  tenantId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  branchId: Types.ObjectId | string | undefined;
}): Promise<IBranchDocument> {
  if (!branchId) {
    throw ApiError.badRequest("branchId is required");
  }

  const branch = (await Branch.findOne({
    _id: branchId,
    tenant: tenantId,
    isActive: true,
  })) as IBranchDocument | null;
  if (!branch) {
    throw ApiError.badRequest("Branch not found");
  }

  await User.findByIdAndUpdate(userId, { activeBranch: branch._id });
  return branch;
}
