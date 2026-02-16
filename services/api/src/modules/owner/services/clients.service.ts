import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import TenantClientProfile from "../../../models/TenantClientProfile.js";
import type {
  ITenantClientProfile,
  ITenantClientProfileDocument,
} from "../../../models/TenantClientProfile.js";
import TenantAppointmentRecord from "../../../models/TenantAppointmentRecord.js";
import type { ITenantAppointmentRecordDocument } from "../../../models/TenantAppointmentRecord.js";
import type { IBranchDocument } from "../../../models/Branch.js";
import { resolveBranchContext } from "../utils/branchContext.js";
import { parsePagination, buildSearchQuery } from "../utils/pagination.js";
import type { TenantClientStatus } from "../../../types/index.js";

interface ClientPayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "other";
  dob?: Date;
  status?: TenantClientStatus;
  visitsCount?: number;
  totalSpent?: number;
  lastVisit?: Date;
  lastVisitBranch?: string | Types.ObjectId;
  address?: { city?: string; state?: string };
  notes?: string;
  tags?: string[];
  branchId?: string | Types.ObjectId;
}

interface SanitizedClientData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "other";
  dob?: Date;
  status?: TenantClientStatus;
  visitsCount?: number;
  totalSpent?: number;
  lastVisit?: Date;
  lastVisitBranch?: string | Types.ObjectId;
  address?: { city?: string; state?: string };
  notes?: string;
  tags?: string[];
  tenant?: Types.ObjectId | string;
  branch?: Types.ObjectId;
  createdBy?: Types.ObjectId | string;
}

interface ListClientsResult {
  results: ITenantClientProfileDocument[];
  pagination: { page: number; limit: number; total: number };
  branch: IBranchDocument;
}

interface AppointmentHistoryItem {
  id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  totalAmount: number;
  staff: {
    id: string;
    name: string;
  } | null;
  services: Array<{
    id: string | undefined;
    name: string;
    price: number;
    duration: number | undefined;
  }>;
}

function sanitizeClientPayload(payload: ClientPayload): SanitizedClientData {
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

export async function listClients({
  tenantId,
  branchId,
  search,
  pagination = {},
}: {
  tenantId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  search?: string;
  pagination?: Record<string, unknown>;
}): Promise<ListClientsResult> {
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
      .limit(limit) as Promise<ITenantClientProfileDocument[]>,
    TenantClientProfile.countDocuments(finalQuery),
  ]);

  return {
    results: clients,
    pagination: { page, limit, total },
    branch,
  };
}

export async function createClient({
  tenantId,
  userId,
  branchId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  branchId?: string | Types.ObjectId | null;
  payload: ClientPayload;
}): Promise<ITenantClientProfileDocument> {
  if (!payload?.fullName || !payload?.phoneNumber) {
    throw ApiError.badRequest("Full name and phone number are required");
  }

  const data: SanitizedClientData = sanitizeClientPayload(payload);
  data.tenant = tenantId;
  data.createdBy = userId;

  const branch = await resolveBranchContext({
    tenantId,
    branchId: payload.branchId || branchId,
    fallbackToDefault: true,
  });
  data.branch = branch._id as Types.ObjectId;

  const existing = (await TenantClientProfile.findOne({
    tenant: tenantId,
    phoneNumber: data.phoneNumber,
  })) as ITenantClientProfileDocument | null;
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
    data.lastVisitBranch = lastVisitBranch._id as Types.ObjectId;
  }

  return TenantClientProfile.create(
    data
  ) as Promise<ITenantClientProfileDocument>;
}

export async function updateClient({
  tenantId,
  clientId,
  payload,
}: {
  tenantId: Types.ObjectId | string;
  clientId: Types.ObjectId | string;
  payload: ClientPayload;
}): Promise<ITenantClientProfileDocument> {
  const client = (await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantClientProfileDocument | null;
  if (!client) {
    throw ApiError.notFound("Client not found");
  }

  if (payload.branchId) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.branchId,
      fallbackToDefault: true,
    });
    client.branch = branch._id as Types.ObjectId;
  }

  const data: SanitizedClientData = sanitizeClientPayload(payload);
  if (payload.lastVisitBranch) {
    const branch = await resolveBranchContext({
      tenantId,
      branchId: payload.lastVisitBranch,
      fallbackToDefault: true,
    });
    data.lastVisitBranch = branch._id as Types.ObjectId;
  }

  (
    Object.entries(data) as Array<[keyof SanitizedClientData, unknown]>
  ).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any)[key] = value;
    }
  });

  await client.save();
  return client;
}

export async function getClientHistory({
  tenantId,
  clientId,
}: {
  tenantId: Types.ObjectId | string;
  clientId: Types.ObjectId | string;
}): Promise<AppointmentHistoryItem[]> {
  const client = (await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantClientProfileDocument | null;
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

  return appointments.map((appointment) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appt = appointment as any;

    return {
      id: appt._id.toString(),
      startAt: appt.startAt,
      endAt: appt.endAt,
      status: appt.status,
      totalAmount: Number(appt.totalAmount || appt.price || 0),
      staff: appt.staff
        ? {
            id:
              appt.staff._id?.toString?.() || appt.staff.toString(),
            name:
              appt.staff.name ||
              appt.staffNameSnapshot ||
              "Staff",
          }
        : null,
      services: (appt.services || []).map(
        (serviceItem: {
          service?: { _id?: Types.ObjectId; name?: string } | Types.ObjectId;
          name?: string;
          price?: number;
          duration?: number;
        }) => ({
          id:
            (serviceItem.service as { _id?: Types.ObjectId })?._id?.toString?.() ||
            serviceItem.service?.toString?.(),
          name:
            serviceItem.name ||
            (serviceItem.service as { name?: string })?.name ||
            appt.serviceNameSnapshot ||
            "Service",
          price:
            typeof serviceItem.price === "number" ? serviceItem.price : 0,
          duration:
            typeof serviceItem.duration === "number"
              ? serviceItem.duration
              : undefined,
        })
      ),
    };
  });
}

export async function getClient({
  tenantId,
  clientId,
}: {
  tenantId: Types.ObjectId | string;
  clientId: Types.ObjectId | string;
}): Promise<ITenantClientProfileDocument> {
  const client = (await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantClientProfileDocument | null;
  if (!client) {
    throw ApiError.notFound("Client not found");
  }
  return client;
}

export async function deleteClient({
  tenantId,
  clientId,
}: {
  tenantId: Types.ObjectId | string;
  clientId: Types.ObjectId | string;
}): Promise<ITenantClientProfileDocument> {
  const client = (await TenantClientProfile.findOne({
    _id: clientId,
    tenant: tenantId,
    isDeleted: false,
  })) as ITenantClientProfileDocument | null;
  if (!client) {
    throw ApiError.notFound("Client not found");
  }
  client.isDeleted = true;
  client.isActive = false;
  client.deletedAt = new Date();
  await client.save();
  return client;
}
