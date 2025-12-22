const ApiError = require("../../../utils/ApiError");
const SubscriptionPlan = require("../../../models/SubscriptionPlan");
const Tenant = require("../../../models/Tenant");
const TenantSubscription = require("../../../models/TenantSubscription");

const DEFAULT_PLANS = [
  {
    planCode: "BASIC",
    planName: "Basic",
    description: "Single-branch starter pack",
    price: 4999,
    currency: "INR",
    maxBranches: 1,
    maxEmployees: 10,
  },
  {
    planCode: "PRO",
    planName: "Pro",
    description: "Multi-branch growth plan",
    price: 9999,
    currency: "INR",
    maxBranches: 3,
    maxEmployees: 25,
  },
  {
    planCode: "ADVANCED",
    planName: "Advanced",
    description: "Unlimited branches and staff",
    price: 14999,
    currency: "INR",
    maxBranches: null,
    maxEmployees: null,
  },
];

async function ensureDefaultPlansSeeded() {
  for (const plan of DEFAULT_PLANS) {
    await SubscriptionPlan.updateOne(
      { planCode: plan.planCode },
      { $set: plan },
      { upsert: true }
    );
  }
}

async function getPlanByCode(planCode) {
  if (!planCode) {
    throw ApiError.badRequest("planCode is required");
  }
  let plan = await SubscriptionPlan.findOne({
    planCode: planCode.toUpperCase(),
  });
  if (!plan) {
    await ensureDefaultPlansSeeded();
    plan = await SubscriptionPlan.findOne({
      planCode: planCode.toUpperCase(),
    });
  }
  if (!plan) {
    throw ApiError.badRequest("Subscription plan not found");
  }
  return plan;
}

async function createPendingSubscription({
  tenantId,
  planId,
  provider,
  orderId,
  amount,
  currency,
}) {
  const existingActive = await TenantSubscription.findOne({
    tenant: tenantId,
    status: "ACTIVE",
  });

  if (existingActive) {
    throw ApiError.badRequest("Tenant already has an active subscription");
  }

  return TenantSubscription.create({
    tenant: tenantId,
    plan: planId,
    provider,
    orderId,
    amount,
    currency,
    status: "PENDING",
  });
}

async function getPendingSubscriptionByOrder(orderId) {
  const subscription = await TenantSubscription.findOne({
    orderId,
    status: "PENDING",
  }).populate("plan");
  if (!subscription) {
    throw ApiError.badRequest("Pending subscription not found for this order");
  }
  return subscription;
}

async function getActiveSubscriptionForTenant(tenantId) {
  if (!tenantId) {
    return null;
  }
  return TenantSubscription.findOne({
    tenant: tenantId,
    status: "ACTIVE",
  })
    .sort({ startDate: -1 })
    .populate("plan");
}

function calculateEndDate(billingCycle = "monthly") {
  const start = new Date();
  if (billingCycle === "yearly") {
    start.setFullYear(start.getFullYear() + 1);
  } else {
    start.setMonth(start.getMonth() + 1);
  }
  return start;
}

async function activateSubscription({ subscription, paymentId }) {
  subscription.status = "ACTIVE";
  subscription.paymentId = paymentId;
  subscription.startDate = new Date();
  subscription.endDate = calculateEndDate(subscription.plan?.billingCycle);
  await subscription.save();
  return subscription;
}

async function resolvePlanForTenant(tenantId) {
  const subscription = await getActiveSubscriptionForTenant(tenantId);
  if (subscription) {
    return { plan: subscription.plan, source: "ACTIVE_SUBSCRIPTION" };
  }

  const tenant = await Tenant.findById(tenantId);
  if (tenant?.pendingPlanCode) {
    const plan = await SubscriptionPlan.findOne({
      planCode: tenant.pendingPlanCode,
    });
    if (plan) {
      return { plan, source: "PENDING_PLAN" };
    }
  }

  return { plan: null, source: null };
}

module.exports = {
  ensureDefaultPlansSeeded,
  getPlanByCode,
  createPendingSubscription,
  getPendingSubscriptionByOrder,
  getActiveSubscriptionForTenant,
  activateSubscription,
  resolvePlanForTenant,
};
