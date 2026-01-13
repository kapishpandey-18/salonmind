const ApiError = require("../../../utils/ApiError");
const TenantStaff = require("../../../models/TenantStaff");
const { resolveBranchContext } = require("../utils/branchContext");
const {
  parsePagination,
  buildSearchQuery,
} = require("../utils/pagination");

const ALLOWED_COMMISSIONS = [0, 5, 10, 15, 20];

function sanitizeStaffPayload(payload) {
  return {
    name: payload.name?.trim(),
    role: payload.role,
    email: payload.email,
    phone: payload.phone,
    avatarUrl: payload.avatarUrl,
    specialties: payload.specialties,
    rating: payload.rating,
    reviews: payload.reviews,
    appointmentsToday: payload.appointmentsToday,
    appointmentsWeek: payload.appointmentsWeek,
    revenue: payload.revenue,
    availability: payload.availability,
    status: payload.status,
    notes: payload.notes,
    joiningDate: payload.joiningDate,
  };
}

function normalizeCompensationPayload(payload) {
  if (typeof payload === "undefined" || payload === null) {
    return undefined;
  }
  if (typeof payload !== "object") {
    const error = ApiError.badRequest("Compensation must be an object");
    error.code = "INVALID_COMPENSATION";
    throw error;
  }
  const hasSalary = typeof payload.monthlySalary !== "undefined";
  const hasCommission = typeof payload.commissionPercent !== "undefined";
  if (!hasSalary && !hasCommission) {
    return undefined;
  }
  const normalized = {};
  if (hasSalary) {
    normalized.monthlySalary = Number(payload.monthlySalary);
  }
  if (hasCommission) {
    normalized.commissionPercent = Number(payload.commissionPercent);
  }
  return normalized;
}

function validateCompensation(compensation) {
  if (!compensation) {
    return;
  }
  if (
    typeof compensation.monthlySalary !== "undefined" &&
    (!Number.isFinite(compensation.monthlySalary) ||
      compensation.monthlySalary < 0)
  ) {
    const error = ApiError.badRequest(
      "Monthly salary must be a number greater than or equal to 0"
    );
    error.code = "INVALID_COMPENSATION";
    throw error;
  }

  if (
    typeof compensation.commissionPercent !== "undefined" &&
    !ALLOWED_COMMISSIONS.includes(compensation.commissionPercent)
  ) {
    const error = ApiError.badRequest(
      "Commission percent must be one of 0, 5, 10, 15, 20"
    );
    error.code = "INVALID_COMPENSATION";
    throw error;
  }
}

async function listStaff({ tenantId, branchId, search, pagination = {} }) {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });
  const baseQuery = {
    tenant: tenantId,
    branch: branch._id,
    isDeleted: false,
  };
  const searchQuery = buildSearchQuery(search, [
    "name",
    "role",
    "email",
    "phone",
    "notes",
  ]);
  const finalQuery = { ...baseQuery, ...searchQuery };
  const { page, limit, skip } = parsePagination(pagination);

  const [staff, total] = await Promise.all([
    TenantStaff.find(finalQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
    TenantStaff.countDocuments(finalQuery),
  ]);

  return {
    results: staff,
    pagination: { page, limit, total },
    branch,
  };
}

async function createStaff({ tenantId, userId, branchId, payload }) {
  if (!payload?.name) {
    throw ApiError.badRequest("Staff name is required");
  }
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: false,
  });

  const compensation = normalizeCompensationPayload(payload.compensation);
  validateCompensation(compensation);

  const data = sanitizeStaffPayload(payload);
  data.tenant = tenantId;
  data.branch = branch._id;
  data.createdBy = userId;
  if (compensation) {
    data.compensation = compensation;
  }

  return TenantStaff.create(data);
}

async function updateStaff({ tenantId, staffId, payload }) {
  const staff = await TenantStaff.findOne({ _id: staffId, tenant: tenantId });
  if (!staff) {
    throw ApiError.notFound("Staff member not found");
  }
  if (staff.isDeleted) {
    throw ApiError.notFound("Staff member not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: false,
    });
    staff.branch = branch._id;
  }

  const compensation = normalizeCompensationPayload(payload.compensation);
  validateCompensation(compensation);

  const data = sanitizeStaffPayload(payload);
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      staff[key] = value;
    }
  });
  if (compensation) {
    if (!staff.compensation) {
      staff.compensation = {};
    }
    if (typeof compensation.monthlySalary !== "undefined") {
      staff.compensation.monthlySalary = compensation.monthlySalary;
    }
    if (typeof compensation.commissionPercent !== "undefined") {
      staff.compensation.commissionPercent = compensation.commissionPercent;
    }
  }

  await staff.save();
  return staff;
}

async function deleteStaff({ tenantId, staffId }) {
  const staff = await TenantStaff.findOne({
    _id: staffId,
    tenant: tenantId,
  });
  if (!staff) {
    throw ApiError.notFound("Staff member not found");
  }
  if (staff.isDeleted) {
    return staff;
  }
  staff.isDeleted = true;
  staff.isActive = false;
  staff.deletedAt = new Date();
  await staff.save();
  return staff;
}

async function getStaff({ tenantId, staffId }) {
  const staff = await TenantStaff.findOne({
    _id: staffId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!staff) {
    throw ApiError.notFound("Staff member not found");
  }
  return staff;
}

async function updateStaffStatus({ tenantId, staffId, isActive }) {
  const staff = await getStaff({ tenantId, staffId });
  staff.isActive = Boolean(isActive);
  staff.status = isActive ? "active" : "off";
  await staff.save();
  return staff;
}

module.exports = {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  updateStaffStatus,
};
