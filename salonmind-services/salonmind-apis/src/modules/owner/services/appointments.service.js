const ApiError = require("../../../utils/ApiError");
const TenantAppointmentRecord = require("../../../models/TenantAppointmentRecord");
const TenantStaff = require("../../../models/TenantStaff");
const TenantServiceItem = require("../../../models/TenantServiceItem");
const TenantClientProfile = require("../../../models/TenantClientProfile");
const { resolveBranchContext } = require("../utils/branchContext");
const {
  parsePagination,
  buildSearchQuery,
} = require("../utils/pagination");

const normalizeTime = (value) => value?.trim() || "09:00";

const formatTimeFromDate = (date) => {
  if (!(date instanceof Date)) {
    return normalizeTime(date);
  }
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

const calculateEndAt = (startAt, duration) => {
  const safeStart = startAt instanceof Date ? startAt : new Date(startAt);
  return new Date(safeStart.getTime() + duration * 60000);
};

const APPOINTMENT_POPULATE_PATHS = [
  { path: "client" },
  { path: "staff" },
  { path: "services.service" },
];

async function populateAppointmentDoc(appointment) {
  if (!appointment) {
    return appointment;
  }
  await appointment.populate(APPOINTMENT_POPULATE_PATHS);
  return appointment;
}

async function listAppointments({
  tenantId,
  branchId,
  search,
  status,
  from,
  to,
  pagination = {},
}) {
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

  if (status) {
    baseQuery.status = status;
  }

  if (from || to) {
    baseQuery.startAt = {};
    if (from) {
      baseQuery.startAt.$gte = new Date(from);
    }
    if (to) {
      baseQuery.startAt.$lte = new Date(to);
    }
  }

  const searchQuery = buildSearchQuery(search, [
    "clientNameSnapshot",
    "serviceNameSnapshot",
    "notes",
  ]);
  const finalQuery = { ...baseQuery, ...searchQuery };
  const { page, limit, skip } = parsePagination(pagination);

  const [appointments, total] = await Promise.all([
    TenantAppointmentRecord.find(finalQuery)
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("client")
      .populate("staff")
      .populate("services.service"),
    TenantAppointmentRecord.countDocuments(finalQuery),
  ]);

  return {
    results: appointments,
    pagination: { page, limit, total },
    branch,
  };
}

async function assertStaff({ tenantId, staffId, branchId }) {
  const staff = await TenantStaff.findOne({
    _id: staffId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!staff) {
    throw ApiError.badRequest("Staff member not found");
  }
  if (branchId && staff.branch.toString() !== branchId.toString()) {
    throw ApiError.badRequest("Staff member not associated with branch");
  }
  return staff;
}

async function assertService({ tenantId, serviceId, branchId }) {
  const service = await TenantServiceItem.findOne({
    _id: serviceId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!service) {
    throw ApiError.badRequest("Service not found");
  }
  if (branchId && service.branch.toString() !== branchId.toString()) {
    throw ApiError.badRequest("Service not associated with branch");
  }
  return service;
}

async function assertClient({ tenantId, clientId }) {
  const client = await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!client) {
    throw ApiError.badRequest("Client not found");
  }
  return client;
}

function resolveServiceIds(payload) {
  if (Array.isArray(payload.serviceIds) && payload.serviceIds.length) {
    return payload.serviceIds.filter(Boolean);
  }
  if (payload.serviceId) {
    return [payload.serviceId];
  }
  return [];
}

function resolveStartAt(payload) {
  if (payload.startAt) {
    return new Date(payload.startAt);
  }
  if (payload.date || payload.startTime) {
    const date = payload.date ? new Date(payload.date) : new Date();
    const [hours, minutes] = normalizeTime(payload.startTime).split(":");
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date;
  }
  return new Date();
}

async function createAppointment({
  tenantId,
  branchId,
  userId,
  payload,
}) {
  if (!payload?.clientId || !payload?.staffId) {
    throw ApiError.badRequest("clientId and staffId are required");
  }
  const serviceIds = resolveServiceIds(payload);
  if (!serviceIds.length) {
    throw ApiError.badRequest("At least one serviceId is required");
  }

  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: false,
  });

  const [client, staff, services] = await Promise.all([
    assertClient({ tenantId, clientId: payload.clientId }),
    assertStaff({ tenantId, staffId: payload.staffId, branchId: branch._id }),
    TenantServiceItem.find({
      _id: { $in: serviceIds },
      tenant: tenantId,
      branch: branch._id,
      isDeleted: false,
    }),
  ]);

  if (services.length !== serviceIds.length) {
    throw ApiError.badRequest("One or more services not found for branch");
  }

  const startAt = resolveStartAt(payload);
  const defaultDuration = services.reduce(
    (sum, service) => sum + (service.duration || 60),
    0
  );
  const duration =
    typeof payload.duration === "number" ? payload.duration : defaultDuration;
  const endAt = payload.endAt
    ? new Date(payload.endAt)
    : calculateEndAt(startAt, duration);
  const totalAmount =
    typeof payload.totalAmount === "number"
      ? payload.totalAmount
      : services.reduce((sum, service) => sum + (service.price || 0), 0);

  const appointment = await TenantAppointmentRecord.create({
    tenant: tenantId,
    branch: branch._id,
    client: client._id,
    clientNameSnapshot: client.fullName,
    staff: staff._id,
    staffNameSnapshot: staff.name,
    service: services[0]._id,
    serviceNameSnapshot: services[0].name,
    services: services.map((service) => ({
      service: service._id,
      name: service.name,
      duration: service.duration,
      price: service.price,
    })),
    startAt,
    endAt,
    date: startAt,
    startTime: formatTimeFromDate(startAt),
    endTime: formatTimeFromDate(endAt),
    duration,
    price: totalAmount,
    totalAmount,
    status: payload.status || "confirmed",
    notes: payload.notes,
    createdBy: userId,
  });

  await populateAppointmentDoc(appointment);
  return appointment;
}

async function getAppointment({ tenantId, appointmentId }) {
  const appointment = await TenantAppointmentRecord.findOne({
    _id: appointmentId,
    tenant: tenantId,
    isDeleted: false,
  })
    .populate("client")
    .populate("staff")
    .populate("services.service");
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }
  return appointment;
}

async function updateAppointment({ tenantId, appointmentId, payload }) {
  const appointment = await TenantAppointmentRecord.findOne({
    _id: appointmentId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: false,
    });
    appointment.branch = branch._id;
  }

  if (payload.clientId) {
    const client = await assertClient({ tenantId, clientId: payload.clientId });
    appointment.client = client._id;
    appointment.clientNameSnapshot = client.fullName;
  }

  if (payload.staffId) {
    const staff = await assertStaff({
      tenantId,
      staffId: payload.staffId,
      branchId: appointment.branch,
    });
    appointment.staff = staff._id;
    appointment.staffNameSnapshot = staff.name;
  }

  if (payload.serviceIds || payload.serviceId) {
    const serviceIds = resolveServiceIds(payload);
    const services = await TenantServiceItem.find({
      _id: { $in: serviceIds },
      tenant: tenantId,
      branch: appointment.branch,
      isDeleted: false,
    });
    if (!services.length) {
      throw ApiError.badRequest("No valid services provided");
    }
    appointment.services = services.map((service) => ({
      service: service._id,
      name: service.name,
      duration: service.duration,
      price: service.price,
    }));
    appointment.service = services[0]._id;
    appointment.serviceNameSnapshot = services[0].name;
  }

  if (payload.startAt || payload.date || payload.startTime) {
    appointment.startAt = resolveStartAt(payload);
    appointment.startTime = formatTimeFromDate(appointment.startAt);
    appointment.date = appointment.startAt;
  }

  if (payload.duration) {
    appointment.duration = payload.duration;
  }

  if (payload.endAt) {
    appointment.endAt = new Date(payload.endAt);
  } else if (payload.startAt || payload.duration) {
    appointment.endAt = calculateEndAt(appointment.startAt, appointment.duration);
  }
  appointment.endTime = formatTimeFromDate(appointment.endAt);

  if (typeof payload.totalAmount === "number") {
    appointment.totalAmount = payload.totalAmount;
    appointment.price = payload.totalAmount;
  }

  if (typeof payload.price === "number") {
    appointment.totalAmount = payload.price;
    appointment.price = payload.price;
  }

  if (payload.status) {
    appointment.status = payload.status;
  }

  if (typeof payload.notes !== "undefined") {
    appointment.notes = payload.notes;
  }

  await appointment.save();
  await populateAppointmentDoc(appointment);
  return appointment;
}

async function cancelAppointment({ tenantId, appointmentId, reason }) {
  const appointment = await TenantAppointmentRecord.findOne({
    _id: appointmentId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }

  appointment.status = "cancelled";
  appointment.cancellationReason = reason;
  await appointment.save();
  await populateAppointmentDoc(appointment);
  return appointment;
}

async function deleteAppointment({ tenantId, appointmentId }) {
  const appointment = await TenantAppointmentRecord.findOne({
    _id: appointmentId,
    tenant: tenantId,
    isDeleted: false,
  });
  if (!appointment) {
    throw ApiError.notFound("Appointment not found");
  }
  appointment.isDeleted = true;
  appointment.deletedAt = new Date();
  await appointment.save();
  return appointment;
}

module.exports = {
  listAppointments,
  createAppointment,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
};
