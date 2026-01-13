const ApiError = require("../../../utils/ApiError");
const TenantClientProfile = require("../../../models/TenantClientProfile");
const TenantAppointmentRecord = require("../../../models/TenantAppointmentRecord");
const { resolveBranchContext } = require("../utils/branchContext");
const {
  parsePagination,
  buildSearchQuery,
} = require("../utils/pagination");

function sanitizeClientPayload(payload) {
  return {
    fullName: payload.fullName?.trim(),
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    gender: payload.gender,
    dob: payload.dob,
    status: payload.status,
    visitsCount: payload.visitsCount,
    totalSpent: payload.totalSpent,
    lastVisit: payload.lastVisit,
    lastVisitBranch: payload.lastVisitBranch,
    address: payload.address,
    notes: payload.notes,
    tags: payload.tags,
  };
}

async function listClients({ tenantId, branchId, search, pagination = {} }) {
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
    "fullName",
    "phoneNumber",
    "email",
    "tags",
    "notes",
  ]);
  const finalQuery = { ...baseQuery, ...searchQuery };
  const { page, limit, skip } = parsePagination(pagination);

  const [clients, total] = await Promise.all([
    TenantClientProfile.find(finalQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    TenantClientProfile.countDocuments(finalQuery),
  ]);

  return {
    results: clients,
    pagination: { page, limit, total },
    branch,
  };
}

async function createClient({ tenantId, userId, branchId, payload }) {
  if (!payload?.fullName || !payload?.phoneNumber) {
    throw ApiError.badRequest("Full name and phone number are required");
  }

  const data = sanitizeClientPayload(payload);
  data.tenant = tenantId;
  data.createdBy = userId;

  const branch = await resolveBranchContext({
    tenantId,
    branchId: payload.branchId || branchId,
    fallbackToDefault: true,
  });
  data.branch = branch._id;

  const existing = await TenantClientProfile.findOne({
    tenant: tenantId,
    phoneNumber: data.phoneNumber,
  });
  if (existing) {
    if (existing.isDeleted) {
      Object.assign(existing, data, {
        isDeleted: false,
        deletedAt: null,
        isActive: true,
      });
      await existing.save();
      return existing;
    }
    throw ApiError.badRequest("Client already exists with this phone number");
  }

  if (payload.lastVisitBranch) {
    const lastVisitBranch = await resolveBranchContext({
      tenantId,
      branchId: payload.lastVisitBranch,
      fallbackToDefault: true,
    });
    data.lastVisitBranch = lastVisitBranch._id;
  }

  return TenantClientProfile.create(data);
}

async function updateClient({ tenantId, clientId, payload }) {
  const client = await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!client) {
    throw ApiError.notFound("Client not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: true,
    });
    client.branch = branch._id;
  }

  const data = sanitizeClientPayload(payload);
  if (payload.lastVisitBranch) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.lastVisitBranch,
      fallbackToDefault: true,
    });
    data.lastVisitBranch = branch._id;
  }

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      client[key] = value;
    }
  });

  await client.save();
  return client;
}

async function getClientHistory({ tenantId, clientId }) {
  const client = await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!client) {
    throw ApiError.notFound("Client not found");
  }
  const appointments = await TenantAppointmentRecord.find({
    tenant: tenantId,
    client: clientId,
    isDeleted: false,
  })
    .sort({ startAt: -1 })
    .populate("staff")
    .populate("services.service");

  return appointments.map((appointment) => ({
    id: appointment._id.toString(),
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    status: appointment.status,
    totalAmount: Number(appointment.totalAmount || appointment.price || 0),
    staff: appointment.staff
      ? {
          id: appointment.staff._id?.toString?.() || appointment.staff.toString(),
          name:
            appointment.staff.name ||
            appointment.staffNameSnapshot ||
            "Staff",
        }
      : null,
    services: (appointment.services || []).map((serviceItem) => ({
      id:
        serviceItem.service?._id?.toString?.() ||
        serviceItem.service?.toString?.(),
      name:
        serviceItem.name ||
        serviceItem.service?.name ||
        appointment.serviceNameSnapshot ||
        "Service",
      price: typeof serviceItem.price === "number" ? serviceItem.price : 0,
      duration:
        typeof serviceItem.duration === "number" ? serviceItem.duration : undefined,
    })),
  }));
}

async function getClient({ tenantId, clientId }) {
  const client = await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!client) {
    throw ApiError.notFound("Client not found");
  }
  return client;
}

async function deleteClient({ tenantId, clientId }) {
  const client = await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!client) {
    throw ApiError.notFound("Client not found");
  }
  client.isDeleted = true;
  client.isActive = false;
  client.deletedAt = new Date();
  await client.save();
  return client;
}

module.exports = {
  listClients,
  createClient,
  updateClient,
  getClientHistory,
  getClient,
  deleteClient,
};
