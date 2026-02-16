import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import TenantServiceItem from "../../../models/TenantServiceItem.js";
import type {
  ITenantServiceItem,
  ITenantServiceItemDocument,
} from "../../../models/TenantServiceItem.js";
import type { IBranchDocument } from "../../../models/Branch.js";
import { resolveBranchContext } from "../utils/branchContext.js";
import { parsePagination, buildSearchQuery } from "../utils/pagination.js";

interface ServicePayload {
  name?: string;
  category?: string;
  duration?: number;
  price?: number;
  description?: string;
  isActive?: boolean;
  bookings?: number;
  revenue?: number;
  popularity?: number;
  branchId?: string | Types.ObjectId;
}

interface SanitizedServiceData {
  name?: string;
  category?: string;
  duration?: number;
  price?: number;
  description?: string;
  isActive?: boolean;
  bookings?: number;
  revenue?: number;
  popularity?: number;
  tenant?: Types.ObjectId | string;
  branch?: Types.ObjectId;
  createdBy?: Types.ObjectId | string;
}

interface ListServicesResult {
  results: ITenantServiceItemDocument[];
  pagination: { page: number; limit: number; total: number };
  branch: IBranchDocument;
}

function sanitizeServicePayload(
  payload: ServicePayload
): SanitizedServiceData {
  return {
    name: payload.name?.trim(),
    category: payload.category,
    duration: payload.duration,
    price: payload.price,
    description: payload.description,
    isActive: payload.isActive,
    bookings: payload.bookings,
    revenue: payload.revenue,
    popularity: payload.popularity,
  };
}

export async function listServices({
  tenantId,
  branchId,
  search,
  pagination = {},
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  search?: string;
  pagination?: Record<string, unknown>;
}): Promise<ListServicesResult> {
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
    "category",
    "description",
  ]);
  const finalQuery = { ...baseQuery, ...searchQuery };
  const { page, limit, skip } = parsePagination(pagination);

  const [services, total] = await Promise.all([
    TenantServiceItem.find(finalQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) as Promise<ITenantServiceItemDocument[]>,
    TenantServiceItem.countDocuments(finalQuery),
  ]);

  return {
    results: services,
    pagination: { page, limit, total },
    branch,
  };
}

export async function createService({
  tenantId,
  branchId,
  userId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  userId: Types.ObjectId | string;
  payload: ServicePayload;
}): Promise<ITenantServiceItemDocument> {
  if (!payload?.name) {
    throw ApiError.badRequest("Service name is required");
  }
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: false,
  });
  const data: SanitizedServiceData = sanitizeServicePayload(payload);
  data.tenant = tenantId;
  data.branch = branch._id as Types.ObjectId;
  data.createdBy = userId;
  return TenantServiceItem.create(data) as Promise<ITenantServiceItemDocument>;
}

export async function updateService({
  tenantId,
  serviceId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  serviceId: Types.ObjectId | string;
  payload: ServicePayload;
}): Promise<ITenantServiceItemDocument> {
  const service = (await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantServiceItemDocument | null;
  if (!service) {
    throw ApiError.notFound("Service not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: false,
    });
    service.branch = branch._id as Types.ObjectId;
  }

  const data = sanitizeServicePayload(payload);
  (
    Object.entries(data) as Array<[keyof SanitizedServiceData, unknown]>
  ).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (service as any)[key] = value;
    }
  });

  await service.save();
  return service;
}

export async function deleteService({
  tenantId,
  serviceId,
}: {
  tenantId: Types.ObjectId | string;
  serviceId: Types.ObjectId | string;
}): Promise<ITenantServiceItemDocument> {
  const service = (await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
  })) as ITenantServiceItemDocument | null;
  if (!service) {
    throw ApiError.notFound("Service not found");
  }
  if (service.isDeleted) {
    return service;
  }
  service.isDeleted = true;
  service.isActive = false;
  service.deletedAt = new Date();
  await service.save();
  return service;
}

export async function getService({
  tenantId,
  serviceId,
}: {
  tenantId: Types.ObjectId | string;
  serviceId: Types.ObjectId | string;
}): Promise<ITenantServiceItemDocument> {
  const service = (await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantServiceItemDocument | null;
  if (!service) {
    throw ApiError.notFound("Service not found");
  }
  return service;
}

export async function updateServiceStatus({
  tenantId,
  serviceId,
  isActive,
}: {
  tenantId: Types.ObjectId | string;
  serviceId: Types.ObjectId | string;
  isActive: boolean;
}): Promise<ITenantServiceItemDocument> {
  const service = await getService({ tenantId, serviceId });
  service.isActive = Boolean(isActive);
  await service.save();
  return service;
}
