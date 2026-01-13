const TenantAppointmentRecord = require("../../../models/TenantAppointmentRecord");
const { resolveBranchContext } = require("../utils/branchContext");

const RANGE_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

const toAmount = (appointment) =>
  Number(appointment.totalAmount || appointment.price || 0);

function resolveRange(range) {
  if (!range || !RANGE_DAYS[range]) {
    return RANGE_DAYS.monthly;
  }
  return RANGE_DAYS[range];
}

async function getTopServices({ tenantId, branchId, range }) {
  const branch = await resolveBranchContext({
    tenantId,
    branchId,
    fallbackToDefault: true,
  });
  const days = resolveRange(range);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const appointments = await TenantAppointmentRecord.find({
    tenant: tenantId,
    branch: branch._id,
    isDeleted: false,
    startAt: { $gte: start },
  }).select("services serviceNameSnapshot totalAmount price");

  const totals = new Map();
  let totalRevenue = 0;
  appointments.forEach((appointment) => {
    const amount = toAmount(appointment);
    totalRevenue += amount;
    if (Array.isArray(appointment.services) && appointment.services.length) {
      appointment.services.forEach((service) => {
        const name = service.name || appointment.serviceNameSnapshot || "Service";
        const existing = totals.get(name) || 0;
        totals.set(name, existing + (service.price || amount));
      });
      return;
    }
    const fallbackName = appointment.serviceNameSnapshot || "Service";
    const existing = totals.get(fallbackName) || 0;
    totals.set(fallbackName, existing + amount);
  });

  const services = Array.from(totals.entries())
    .map(([service, revenue]) => ({
      service,
      revenue: Math.round(revenue),
      percentage:
        totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return { services };
}

module.exports = {
  getTopServices,
};
