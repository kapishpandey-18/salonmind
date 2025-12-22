const ApiError = require("../../../utils/ApiError");
const Branch = require("../../../models/Branch");
const User = require("../../../models/User");
const TenantStaff = require("../../../models/TenantStaff");
const TenantServiceItem = require("../../../models/TenantServiceItem");
const {
  ensureTenantForOwner,
  updateTenantProfile,
  updateBusinessHours,
  updateServices,
  updateStaff,
  getTenantContext,
} = require("./tenant.service");
const {
  getPlanByCode,
  createPendingSubscription,
  getPendingSubscriptionByOrder,
  activateSubscription,
} = require("./subscription.service");
const { createPaymentOrder, verifyPaymentSignature } = require("./payment.service");

const STAFF_PROFILE_PRESETS = [
  {
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    specialties: ["Haircutting", "Color artistry"],
    rating: 4.9,
    reviews: 168,
    appointmentsToday: 5,
    appointmentsWeek: 34,
    revenue: 78000,
    availability: 35,
    notes: "Known for transformational cuts and vivid colors.",
  },
  {
    avatarUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
    specialties: ["Styling", "Events"],
    rating: 4.8,
    reviews: 142,
    appointmentsToday: 4,
    appointmentsWeek: 28,
    revenue: 64000,
    availability: 48,
    notes: "Loves bridal styling sessions on weekends.",
  },
  {
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80",
    specialties: ["Spa therapies", "Scalp care"],
    rating: 4.95,
    reviews: 201,
    appointmentsToday: 6,
    appointmentsWeek: 40,
    revenue: 91000,
    availability: 27,
    notes: "Specializes in premium spa rituals and scalp treatments.",
  },
  {
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    specialties: ["Grooming", "Beard design"],
    rating: 4.7,
    reviews: 119,
    appointmentsToday: 3,
    appointmentsWeek: 24,
    revenue: 52000,
    availability: 60,
    notes: "Customer favorite for precision beard work.",
  },
  {
    avatarUrl:
      "https://images.unsplash.com/photo-1545996124-0501ebae84d0?auto=format&fit=crop&w=400&q=80",
    specialties: ["Makeup", "Events"],
    rating: 4.85,
    reviews: 134,
    appointmentsToday: 4,
    appointmentsWeek: 31,
    revenue: 67000,
    availability: 42,
    notes: "Specializes in flawless bridal looks and HD makeup.",
  },
  {
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80&sat=-30",
    specialties: ["Nail art", "Spa"],
    rating: 4.92,
    reviews: 188,
    appointmentsToday: 5,
    appointmentsWeek: 33,
    revenue: 73000,
    availability: 33,
    notes: "Perfects intricate nail art and luxury manicure rituals.",
  },
];

const DEFAULT_STAFF_TEMPLATES = [
  {
    name: "Emma Wilson",
    role: "Creative Director",
    email: "emma.wilson@salonmind.com",
    phone: "+91 98765 43210",
  },
  {
    name: "Liam Carter",
    role: "Senior Stylist",
    email: "liam.carter@salonmind.com",
    phone: "+91 98650 12345",
  },
  {
    name: "Sofia Patel",
    role: "Color Specialist",
    email: "sofia.patel@salonmind.com",
    phone: "+91 98320 99887",
  },
  {
    name: "Noah Mehta",
    role: "Grooming Expert",
    email: "noah.mehta@salonmind.com",
    phone: "+91 98989 12121",
  },
  {
    name: "Ava Fernandes",
    role: "Spa Therapist",
    email: "ava.fernandes@salonmind.com",
    phone: "+91 98111 22233",
  },
  {
    name: "Ethan Kapoor",
    role: "Styling Lead",
    email: "ethan.kapoor@salonmind.com",
    phone: "+91 98222 33344",
  },
];

async function saveProfile({ userId, payload }) {
  const tenant = await updateTenantProfile({ userId, payload });
  return { tenant };
}

async function saveBusinessHoursStep({ userId, businessHours }) {
  const tenant = await updateBusinessHours({ userId, businessHours });
  return { tenant };
}

async function saveServicesStep({ userId, services }) {
  const tenant = await updateServices({ userId, services });
  return { tenant };
}

async function saveStaffStep({ userId, staff }) {
  const tenant = await updateStaff({ userId, staff });
  return { tenant };
}

async function initiateCheckout({ userId, planCode }) {
  if (!planCode) {
    throw ApiError.badRequest("planCode is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const tenant = await ensureTenantForOwner(user);
  const plan = await getPlanByCode(planCode);
  const order = createPaymentOrder({ plan });

  await createPendingSubscription({
    tenantId: tenant._id,
    planId: plan._id,
    provider: "RAZORPAY",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });

  tenant.pendingPlanCode = plan.planCode;
  await tenant.save();

  return {
    order,
    plan: {
      planCode: plan.planCode,
      planName: plan.planName,
      currency: plan.currency,
      price: plan.price,
    },
  };
}

async function autoCreateDefaultBranch({ tenant }) {
  const existing = await Branch.findOne({
    tenant: tenant._id,
    isDefault: true,
  });
  if (existing) {
    tenant.defaultBranch = existing._id;
    await tenant.save();
    return existing;
  }

  const branch = await Branch.create({
    tenant: tenant._id,
    name: "Main Branch",
    isDefault: true,
    isActive: true,
  });
  tenant.defaultBranch = branch._id;
  await tenant.save();
  return branch;
}

async function seedServicesForBranch({ tenant, branchId, userId }) {
  if (!branchId || !tenant?.services?.length) {
    return;
  }
  const existing = await TenantServiceItem.countDocuments({
    tenant: tenant._id,
    branch: branchId,
  });
  if (existing > 0) {
    return;
  }

  const toInsert = tenant.services
    .filter((service) => service?.name)
    .map((service) => ({
      tenant: tenant._id,
      branch: branchId,
      name: service.name.trim(),
      category: service.category || "general",
      duration: Number(service.duration) || 60,
      price: Number(service.price) || 0,
      description: service.description,
      createdBy: userId,
    }));

  if (toInsert.length) {
    await TenantServiceItem.insertMany(toInsert, { ordered: false });
  }
}

const MIN_SEEDED_STAFF = 6;

async function seedStaffForBranch({ tenant, branchId, userId }) {
  if (!branchId) {
    return;
  }
  const existing = await TenantStaff.countDocuments({
    tenant: tenant._id,
    branch: branchId,
  });
  if (existing > 0) {
    return;
  }

  const filledStaff = Array.isArray(tenant?.staff) ? [...tenant.staff] : [];
  DEFAULT_STAFF_TEMPLATES.forEach((template) => {
    if (filledStaff.length >= MIN_SEEDED_STAFF) {
      return;
    }
    const alreadyPresent = filledStaff.some(
      (member) =>
        member?.name &&
        member.name.trim().toLowerCase() === template.name.toLowerCase()
    );
    if (!alreadyPresent) {
      filledStaff.push(template);
    }
  });

  const toInsert = filledStaff
    .filter((member) => member?.name)
    .map((member, index) => {
      const preset = STAFF_PROFILE_PRESETS[index % STAFF_PROFILE_PRESETS.length];
      return {
        tenant: tenant._id,
        branch: branchId,
        name: member.name.trim(),
        role: member.role || "Staff",
        email: member.email || "",
        phone: member.phone || "",
        avatarUrl: member.avatarUrl || preset.avatarUrl,
        specialties:
          Array.isArray(member.specialties) && member.specialties.length
            ? member.specialties
            : [...(preset.specialties || [])],
        rating:
          typeof member.rating === "number" ? member.rating : preset.rating,
        reviews: typeof member.reviews === "number" ? member.reviews : preset.reviews,
        appointmentsToday:
          typeof member.appointmentsToday === "number"
            ? member.appointmentsToday
            : preset.appointmentsToday,
        appointmentsWeek:
          typeof member.appointmentsWeek === "number"
            ? member.appointmentsWeek
            : preset.appointmentsWeek,
        revenue:
          typeof member.revenue === "number" ? member.revenue : preset.revenue,
        availability:
          typeof member.availability === "number"
            ? member.availability
            : preset.availability,
        status: member.status || "active",
        notes: member.notes || preset.notes,
        createdBy: userId,
      };
    });

  if (toInsert.length) {
    await TenantStaff.insertMany(toInsert, { ordered: false });
  }
}

async function seedInitialBranchData({ tenant, branchId, userId }) {
  await Promise.all([
    seedServicesForBranch({ tenant, branchId, userId }),
    seedStaffForBranch({ tenant, branchId, userId }),
  ]);
}

function assertPlanStaffLimit(plan, tenant) {
  if (plan?.maxEmployees && tenant.staff.length > plan.maxEmployees) {
    throw ApiError.badRequest(
      `Selected plan allows up to ${plan.maxEmployees} staff members. Remove some staff or upgrade the plan.`
    );
  }
}

async function confirmPayment({
  userId,
  orderId,
  paymentId,
  signature,
}) {
  if (!orderId || !paymentId) {
    throw ApiError.badRequest("orderId and paymentId are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const tenant = await ensureTenantForOwner(user);
  const subscription = await getPendingSubscriptionByOrder(orderId);

  assertPlanStaffLimit(subscription.plan, tenant);
  verifyPaymentSignature({ orderId, paymentId, signature });
  await activateSubscription({ subscription, paymentId });

  tenant.status = "ACTIVE";
  tenant.pendingPlanCode = null;
  await tenant.save();

  const defaultBranch = await autoCreateDefaultBranch({ tenant });

  await seedInitialBranchData({
    tenant,
    branchId: defaultBranch?._id,
    userId: user._id,
  });

  user.isOnboarded = true;
  user.isProfileComplete = true;
  user.tenant = tenant._id;
  user.activeBranch = defaultBranch?._id || user.activeBranch;
  await user.save();

  const context = await getTenantContext({
    user: await User.findById(user._id),
  });

  return {
    tenant: context.tenant,
    subscription: context.subscription,
    branches: context.branches,
    defaultBranchId: defaultBranch?._id || tenant.defaultBranch,
  };
}

module.exports = {
  saveProfile,
  saveBusinessHoursStep,
  saveServicesStep,
  saveStaffStep,
  initiateCheckout,
  confirmPayment,
};
