const ApiError = require("../../../utils/ApiError");
const TenantServiceItem = require("../../../models/TenantServiceItem");
const { resolveBranchContext } = require("../utils/branchContext");
const {
  parsePagination,
  buildSearchQuery,
} = require("../utils/pagination");

function sanitizeServicePayload(payload) {
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

async function listServices({ tenantId, branchId, search, pagination = {} }) {
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
    TenantServiceItem.find(finalQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
    TenantServiceItem.countDocuments(finalQuery),
  ]);

  return {
    results: services,
    pagination: { page, limit, total },
    branch,
  };
}

async function createService({ tenantId, branchId, userId, payload }) {
  if (!payload?.name) {
    throw ApiError.badRequest("Service name is required");
  }
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: false,
  });
  const data = sanitizeServicePayload(payload);
  data.tenant = tenantId;
  data.branch = branch._id;
  data.createdBy = userId;
  return TenantServiceItem.create(data);
}

async function updateService({ tenantId, serviceId, payload }) {
  const service = await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!service) {
    throw ApiError.notFound("Service not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: false,
    });
    service.branch = branch._id;
  }

  const data = sanitizeServicePayload(payload);
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      service[key] = value;
    }
  });

  await service.save();
  return service;
}

async function deleteService({ tenantId, serviceId }) {
  const service = await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
  });
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

async function getService({ tenantId, serviceId }) {
  const service = await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!service) {
    throw ApiError.notFound("Service not found");
  }
  return service;
}

async function updateServiceStatus({ tenantId, serviceId, isActive }) {
  const service = await getService({ tenantId, serviceId });
  service.isActive = Boolean(isActive);
  await service.save();
  return service;
}

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService,
  getService,
  updateServiceStatus,
};
