import type { Types } from "mongoose";
import TenantAppointmentRecord from "../../../models/TenantAppointmentRecord.js";
import type { ITenantAppointmentRecordDocument } from "../../../models/TenantAppointmentRecord.js";
import { resolveBranchContext } from "../utils/branchContext.js";

type RangeKey = "daily" | "weekly" | "monthly";

const RANGE_DAYS: Record<RangeKey, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

const toAmount = (appointment: ITenantAppointmentRecordDocument): number =>
  Number(appointment.totalAmount || appointment.price || 0);

function resolveRange(range?: string): number {
  if (!range || !(range in RANGE_DAYS)) {
    return RANGE_DAYS.monthly;
  }
  return RANGE_DAYS[range as RangeKey];
}

interface ServiceRevenueEntry {
  service: string;
  revenue: number;
  percentage: number;
}

interface TopServicesResult {
  services: ServiceRevenueEntry[];
}

export async function getTopServices({
  tenantId,
  branchId,
  range,
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  range?: string;
}): Promise<TopServicesResult> {
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

  const totals = new Map<string, number>();
  let totalRevenue = 0;
  appointments.forEach((appointment) => {
    const amount = toAmount(
      appointment as ITenantAppointmentRecordDocument
    );
    totalRevenue += amount;
    if (Array.isArray(appointment.services) && appointment.services.length) {
      appointment.services.forEach((service) => {
        const name =
          service.name || appointment.serviceNameSnapshot || "Service";
        const existing = totals.get(name) || 0;
        totals.set(name, existing + (service.price || amount));
      });
      return;
    }
    const fallbackName = appointment.serviceNameSnapshot || "Service";
    const existing = totals.get(fallbackName) || 0;
    totals.set(fallbackName, existing + amount);
  });

  const services: ServiceRevenueEntry[] = Array.from(totals.entries())
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
