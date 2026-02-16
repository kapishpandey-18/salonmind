import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import TenantStaff from "../../../models/TenantStaff.js";
import type {
  ITenantStaff,
  ITenantStaffDocument,
} from "../../../models/TenantStaff.js";
import type { IBranchDocument } from "../../../models/Branch.js";
import { resolveBranchContext } from "../utils/branchContext.js";
import { parsePagination, buildSearchQuery } from "../utils/pagination.js";
import type { StaffStatus } from "../../../types/index.js";

const ALLOWED_COMMISSIONS = [0, 5, 10, 15, 20] as const;

interface StaffPayload {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties?: string[];
  rating?: number;
  reviews?: number;
  appointmentsToday?: number;
  appointmentsWeek?: number;
  revenue?: number;
  availability?: number;
  status?: StaffStatus;
  notes?: string;
  joiningDate?: Date;
  branchId?: string | Types.ObjectId;
  compensation?: CompensationPayload | null;
}

interface CompensationPayload {
  monthlySalary?: number;
  commissionPercent?: number;
}

interface NormalizedCompensation {
  monthlySalary?: number;
  commissionPercent?: number;
}

interface SanitizedStaffData {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties?: string[];
  rating?: number;
  reviews?: number;
  appointmentsToday?: number;
  appointmentsWeek?: number;
  revenue?: number;
  availability?: number;
  status?: StaffStatus;
  notes?: string;
  joiningDate?: Date;
  tenant?: Types.ObjectId | string;
  branch?: Types.ObjectId;
  createdBy?: Types.ObjectId | string;
  compensation?: NormalizedCompensation;
}

interface ListStaffResult {
  results: ITenantStaffDocument[];
  pagination: { page: number; limit: number; total: number };
  branch: IBranchDocument;
}

function sanitizeStaffPayload(payload: StaffPayload): SanitizedStaffData {
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

function normalizeCompensationPayload(
  payload: CompensationPayload | null | undefined
): NormalizedCompensation | undefined {
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
  const normalized: NormalizedCompensation = {};
  if (hasSalary) {
    normalized.monthlySalary = Number(payload.monthlySalary);
  }
  if (hasCommission) {
    normalized.commissionPercent = Number(payload.commissionPercent);
  }
  return normalized;
}

function validateCompensation(
  compensation: NormalizedCompensation | undefined
): void {
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
    !(ALLOWED_COMMISSIONS as readonly number[]).includes(
      compensation.commissionPercent
    )
  ) {
    const error = ApiError.badRequest(
      "Commission percent must be one of 0, 5, 10, 15, 20"
    );
    error.code = "INVALID_COMPENSATION";
    throw error;
  }
}

export async function listStaff({
  tenantId,
  branchId,
  search,
  pagination = {},
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  search?: string;
  pagination?: Record<string, unknown>;
}): Promise<ListStaffResult> {
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
    TenantStaff.find(finalQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) as Promise<ITenantStaffDocument[]>,
    TenantStaff.countDocuments(finalQuery),
  ]);

  return {
    results: staff,
    pagination: { page, limit, total },
    branch,
  };
}

export async function createStaff({
  tenantId,
  userId,
  branchId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  payload: StaffPayload;
}): Promise<ITenantStaffDocument> {
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

  const data: SanitizedStaffData = sanitizeStaffPayload(payload);
  data.tenant = tenantId;
  data.branch = branch._id as Types.ObjectId;
  data.createdBy = userId;
  if (compensation) {
    data.compensation = compensation;
  }

  return TenantStaff.create(data) as Promise<ITenantStaffDocument>;
}

export async function updateStaff({
  tenantId,
  staffId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  staffId: Types.ObjectId | string;
  payload: StaffPayload;
}): Promise<ITenantStaffDocument> {
  const staff = (await TenantStaff.findOne({
    _id: staffId,
    tenant: tenantId,
  })) as ITenantStaffDocument | null;
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
    staff.branch = branch._id as Types.ObjectId;
  }

  const compensation = normalizeCompensationPayload(payload.compensation);
  validateCompensation(compensation);

  const data = sanitizeStaffPayload(payload);
  (
    Object.entries(data) as Array<[keyof SanitizedStaffData, unknown]>
  ).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (staff as any)[key] = value;
    }
  });
  if (compensation) {
    if (!staff.compensation) {
      staff.compensation = { monthlySalary: 0, commissionPercent: 0 };
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

export async function deleteStaff({
  tenantId,
  staffId,
}: {
  tenantId: Types.ObjectId | string;
  staffId: Types.ObjectId | string;
}): Promise<ITenantStaffDocument> {
  const staff = (await TenantStaff.findOne({
    _id: staffId,
    tenant: tenantId,
  })) as ITenantStaffDocument | null;
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

export async function getStaff({
  tenantId,
  staffId,
}: {
  tenantId: Types.ObjectId | string;
  staffId: Types.ObjectId | string;
}): Promise<ITenantStaffDocument> {
  const staff = (await TenantStaff.findOne({
    _id: staffId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantStaffDocument | null;
  if (!staff) {
    throw ApiError.notFound("Staff member not found");
  }
  return staff;
}

export async function updateStaffStatus({
  tenantId,
  staffId,
  isActive,
}: {
  tenantId: Types.ObjectId | string;
  staffId: Types.ObjectId | string;
  isActive: boolean;
}): Promise<ITenantStaffDocument> {
  const staff = await getStaff({ tenantId, staffId });
  staff.isActive = Boolean(isActive);
  staff.status = isActive ? "active" : "off";
  await staff.save();
  return staff;
}
