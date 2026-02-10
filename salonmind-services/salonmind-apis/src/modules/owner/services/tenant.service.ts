import type { Types, Document } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import Tenant from "../../../models/Tenant.js";
import type { ITenant } from "../../../models/Tenant.js";
import Branch from "../../../models/Branch.js";
import User from "../../../models/User.js";
import type { IUser } from "../../../models/User.js";
import { getActiveSubscriptionForTenant } from "./subscription.service.js";

const DEFAULT_HOURS = [
  { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
] as const;

export async function ensureTenantForOwner(
  user: Document<Types.ObjectId, object, IUser> & IUser
): Promise<Document<Types.ObjectId, object, ITenant> & ITenant> {
  if (!user) {
    throw ApiError.internal(
      "User reference missing while ensuring tenant"
    );
  }

  let tenant = await Tenant.findOne({ owner: user._id });
  if (!tenant) {
    tenant = await Tenant.create({
      owner: user._id,
      name: "Pending Salon Setup",
      contact: {
        phone: user.phoneNumber || "",
        email: user.email || `owner_${user._id}@salonmind.app`,
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
      businessHours: [...DEFAULT_HOURS],
      settings: {
        currency: "INR",
        timezone: "Asia/Kolkata",
      },
    });
  }

  if (
    !user.tenant ||
    user.tenant.toString() !== tenant._id.toString()
  ) {
    user.tenant = tenant._id as Types.ObjectId;
    await user.save();
  }

  return tenant;
}

interface ProfilePayload {
  salonName?: string;
  salonPhoneNumber?: string;
  phone?: string;
  salonEmail?: string;
  email?: string;
  salonAddress?: string;
  address?: string;
  salonCity?: string;
  city?: string;
  salonState?: string;
  state?: string;
  salonZipCode?: string;
  pincode?: string;
  salonCountry?: string;
  currency?: string;
  timezone?: string;
  ownerName?: string;
}

function sanitizeProfilePayload(payload: ProfilePayload) {
  return {
    name: payload.salonName?.trim() || "SalonMind Tenant",
    contact: {
      phone: payload.salonPhoneNumber || payload.phone || "",
      email: payload.salonEmail || payload.email || "",
    },
    address: {
      street: payload.salonAddress || payload.address || "",
      city: payload.salonCity || payload.city || "",
      state: payload.salonState || payload.state || "",
      zipCode: payload.salonZipCode || payload.pincode || "",
      country: payload.salonCountry || "India",
    },
    settings: {
      currency: payload.currency || "INR",
      timezone: payload.timezone || "Asia/Kolkata",
    },
  };
}

export async function updateTenantProfile({
  userId,
  payload,
}: {
  userId: Types.ObjectId | string;
  payload: ProfilePayload;
}) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const tenant = await ensureTenantForOwner(user);
  const { name, contact, address, settings } =
    sanitizeProfilePayload(payload);

  tenant.name = name;
  tenant.contact = contact;
  tenant.address = address;
  tenant.settings = settings;
  await tenant.save();

  if (payload.ownerName) {
    const [firstName, ...rest] = payload.ownerName.trim().split(" ");
    user.firstName = firstName;
    user.lastName = rest.join(" ");
  }
  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({
      email: payload.email,
      _id: { $ne: userId },
    });
    if (existing) {
      throw ApiError.badRequest("Email already in use");
    }
    user.email = payload.email;
  }
  await user.save();

  return tenant;
}

export async function updateBusinessHours({
  userId,
  businessHours,
}: {
  userId: Types.ObjectId | string;
  businessHours: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
}) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);

  if (!Array.isArray(businessHours) || businessHours.length === 0) {
    throw ApiError.badRequest("Business hours are required");
  }

  tenant.businessHours = businessHours as typeof tenant.businessHours;
  await tenant.save();
  return tenant;
}

export async function updateServices({
  userId,
  services,
}: {
  userId: Types.ObjectId | string;
  services: Array<{
    name: string;
    duration?: string;
    price?: number;
    category?: string;
  }>;
}) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);

  if (!Array.isArray(services) || services.length < 3) {
    throw ApiError.badRequest("Please provide at least 3 services");
  }

  tenant.services = services.map((service) => ({
    name: service.name,
    duration: service.duration || "60",
    price: Number(service.price) || 0,
    category: service.category || "general",
  }));
  await tenant.save();
  return tenant;
}

export async function updateStaff({
  userId,
  staff,
}: {
  userId: Types.ObjectId | string;
  staff: Array<{
    name: string;
    role?: string;
    email?: string;
    phone?: string;
  }>;
}) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);

  if (!Array.isArray(staff) || staff.length < 1) {
    throw ApiError.badRequest(
      "Please provide at least 1 staff member"
    );
  }

  tenant.staff = staff.map((member) => ({
    name: member.name,
    role: member.role || "staff",
    email: member.email || "",
    phone: member.phone || "",
  }));
  await tenant.save();
  return tenant;
}

function formatTenantContext({
  tenant,
  subscription,
  branches,
  activeBranchId,
}: {
  tenant: Document<Types.ObjectId, object, ITenant> & ITenant;
  subscription: unknown;
  branches: Array<
    Document<Types.ObjectId, object, { _id: Types.ObjectId; name: string; isDefault: boolean; isActive: boolean }> & {
      _id: Types.ObjectId;
      name: string;
      isDefault: boolean;
      isActive: boolean;
    }
  >;
  activeBranchId: Types.ObjectId | null;
}) {
  const sub = subscription as {
    status?: string;
    endDate?: Date;
    plan?: {
      planCode?: string;
      planName?: string;
      description?: string;
      price?: number;
      currency?: string;
      billingCycle?: string;
      maxBranches?: number | null;
      maxEmployees?: number | null;
    };
  } | null;

  const plan = sub?.plan || null;
  const planDetails = plan
    ? {
        planCode: plan.planCode,
        planName: plan.planName,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        maxBranches: plan.maxBranches,
        maxEmployees: plan.maxEmployees,
      }
    : null;

  return {
    tenant: {
      id: tenant._id,
      name: tenant.name,
      logoUrl: tenant.logoUrl,
    },
    subscription: sub
      ? {
          status: sub.status,
          planCode: sub.plan?.planCode,
          planName: sub.plan?.planName,
          endDate: sub.endDate,
          maxBranches: sub.plan?.maxBranches,
          maxEmployees: sub.plan?.maxEmployees,
        }
      : null,
    activePlan: planDetails,
    planLimits: planDetails
      ? {
          maxBranches: planDetails.maxBranches,
          maxEmployees: planDetails.maxEmployees,
        }
      : null,
    branches: branches.map((branch) => ({
      id: branch._id,
      name: branch.name,
      isDefault: branch.isDefault,
      isActive: branch.isActive,
    })),
    activeBranchId,
  };
}

export async function getTenantContext({
  user,
  requestedBranchId,
}: {
  user: Document<Types.ObjectId, object, IUser> & IUser;
  requestedBranchId?: string;
}) {
  if (!user) {
    throw ApiError.badRequest("Tenant context not available");
  }

  let owner = await User.findById(user._id || (user as unknown as { id: string }).id);
  if (!owner) {
    throw ApiError.notFound("User not found");
  }

  let tenant: Document<Types.ObjectId, object, ITenant> & ITenant;
  const existingTenant = owner.tenant
    ? await Tenant.findById(owner.tenant)
    : null;
  if (!existingTenant) {
    tenant = await ensureTenantForOwner(owner);
    owner = (await User.findById(owner._id))!;
  } else {
    tenant = existingTenant;
  }

  const subscription = await getActiveSubscriptionForTenant(
    tenant._id as Types.ObjectId
  );
  const branches = await Branch.find({
    tenant: tenant._id,
    isActive: true,
  }).sort({ createdAt: 1 });

  const findValidBranchId = (
    candidateId: Types.ObjectId | string | undefined
  ): Types.ObjectId | null => {
    if (!candidateId) {
      return null;
    }
    const match = branches.find(
      (branch) =>
        branch._id.toString() === candidateId.toString()
    );
    return match ? (match._id as Types.ObjectId) : null;
  };

  const resolvedBranchId =
    findValidBranchId(requestedBranchId) ||
    findValidBranchId(owner!.activeBranch?.toString()) ||
    (tenant.defaultBranch as Types.ObjectId | undefined) ||
    (branches.length ? (branches[0]._id as Types.ObjectId) : null);

  const activeBranchId = resolvedBranchId;

  if (
    activeBranchId &&
    (!owner!.activeBranch ||
      owner!.activeBranch.toString() !== activeBranchId.toString())
  ) {
    owner!.activeBranch = activeBranchId;
    await owner!.save();
  }

  return formatTenantContext({
    tenant,
    subscription,
    branches: branches as typeof branches,
    activeBranchId,
  });
}
