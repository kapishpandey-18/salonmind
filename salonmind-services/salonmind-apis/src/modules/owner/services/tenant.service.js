const ApiError = require("../../../utils/ApiError");
const Tenant = require("../../../models/Tenant");
const Branch = require("../../../models/Branch");
const User = require("../../../models/User");
const {
  getActiveSubscriptionForTenant,
} = require("./subscription.service");

const DEFAULT_HOURS = [
  { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
];

async function ensureTenantForOwner(user) {
  if (!user) {
    throw ApiError.internal("User reference missing while ensuring tenant");
  }

  let tenant = await Tenant.findOne({ owner: user._id });
  if (!tenant) {
    tenant = await Tenant.create({
      owner: user._id,
      name: "Pending Salon Setup",
      contact: {
        phone: user.phoneNumber,
        email: user.email || `owner_${user._id}@salonmind.app`,
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      },
      businessHours: DEFAULT_HOURS,
      settings: {
        currency: "INR",
        timezone: "Asia/Kolkata",
      },
    });
  }

  if (!user.tenant || user.tenant.toString() !== tenant._id.toString()) {
    user.tenant = tenant._id;
    await user.save();
  }

  return tenant;
}

function sanitizeProfilePayload(payload) {
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

async function updateTenantProfile({ userId, payload }) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const tenant = await ensureTenantForOwner(user);
  const { name, contact, address, settings } = sanitizeProfilePayload(payload);

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

async function updateBusinessHours({ userId, businessHours }) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);

  if (!Array.isArray(businessHours) || businessHours.length === 0) {
    throw ApiError.badRequest("Business hours are required");
  }

  tenant.businessHours = businessHours;
  await tenant.save();
  return tenant;
}

async function updateServices({ userId, services }) {
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

async function updateStaff({ userId, staff }) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  const tenant = await ensureTenantForOwner(user);

  if (!Array.isArray(staff) || staff.length < 1) {
    throw ApiError.badRequest("Please provide at least 1 staff member");
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

function formatTenantContext({ tenant, subscription, branches, activeBranchId }) {
  return {
    tenant: {
      id: tenant._id,
      name: tenant.name,
      logoUrl: tenant.logoUrl,
    },
    subscription: subscription
      ? {
          status: subscription.status,
          planCode: subscription.plan?.planCode,
          planName: subscription.plan?.planName,
          endDate: subscription.endDate,
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

async function getTenantContext({ user, requestedBranchId }) {
  if (!user) {
    throw ApiError.badRequest("Tenant context not available");
  }

  let owner = await User.findById(user._id || user.id);
  if (!owner) {
    throw ApiError.notFound("User not found");
  }

  let tenant = owner.tenant ? await Tenant.findById(owner.tenant) : null;
  if (!tenant) {
    tenant = await ensureTenantForOwner(owner);
    owner = await User.findById(owner._id);
  }

  const subscription = await getActiveSubscriptionForTenant(tenant._id);
  const branches = await Branch.find({
    tenant: tenant._id,
    isActive: true,
  }).sort({ createdAt: 1 });

  const findValidBranchId = (candidateId) => {
    if (!candidateId) {
      return null;
    }
    const match = branches.find(
      (branch) => branch._id.toString() === candidateId.toString()
    );
    return match ? match._id : null;
  };

  let resolvedBranchId =
    findValidBranchId(requestedBranchId) ||
    findValidBranchId(owner.activeBranch) ||
    tenant.defaultBranch ||
    (branches.length ? branches[0]._id : null);

  let activeBranchId = resolvedBranchId;

  if (
    activeBranchId &&
    (!owner.activeBranch ||
      owner.activeBranch.toString() !== activeBranchId.toString())
  ) {
    owner.activeBranch = activeBranchId;
    await owner.save();
  }

  return formatTenantContext({
    tenant,
    subscription,
    branches,
    activeBranchId,
  });
}

module.exports = {
  ensureTenantForOwner,
  updateTenantProfile,
  updateBusinessHours,
  updateServices,
  updateStaff,
  getTenantContext,
};
