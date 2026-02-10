import type { Types } from "mongoose";
import ApiError from "../../../utils/ApiError.js";
import SubscriptionPlan from "../../../models/SubscriptionPlan.js";
import type { ISubscriptionPlanDocument } from "../../../models/SubscriptionPlan.js";
import Tenant from "../../../models/Tenant.js";
import TenantSubscription from "../../../models/TenantSubscription.js";
import type { ITenantSubscriptionDocument } from "../../../models/TenantSubscription.js";

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
    maxBranches: null as number | null,
    maxEmployees: null as number | null,
  },
];

const PLAN_FEATURES: Record<string, string[]> = {
  BASIC: ["1 branch included", "Up to 10 staff", "Essential analytics"],
  PRO: [
    "Up to 3 branches",
    "Up to 25 staff",
    "Advanced analytics & SMS",
  ],
  ADVANCED: [
    "Unlimited branches",
    "Unlimited staff",
    "Priority support",
  ],
};

const formatPlanPrice = (plan: ISubscriptionPlanDocument): string => {
  const amount = Number(plan.price || 0);
  const symbol = plan.currency === "INR" ? "\u20B9" : `${plan.currency} `;
  const suffix = plan.billingCycle === "yearly" ? "/yr" : "/mo";
  return `${symbol}${amount.toLocaleString("en-IN")}${suffix}`;
};

export async function ensureDefaultPlansSeeded(): Promise<void> {
  for (const plan of DEFAULT_PLANS) {
    await SubscriptionPlan.updateOne(
      { planCode: plan.planCode },
      { $set: plan },
      { upsert: true }
    );
  }
}

export async function getPlanByCode(
  planCode: string
): Promise<ISubscriptionPlanDocument> {
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
  return plan as ISubscriptionPlanDocument;
}

export async function createPendingSubscription({
  tenantId,
  planId,
  provider,
  orderId,
  amount,
  currency,
}: {
  tenantId: Types.ObjectId;
  planId: Types.ObjectId;
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
}): Promise<ITenantSubscriptionDocument> {
  const existingActive = await TenantSubscription.findOne({
    tenant: tenantId,
    status: "ACTIVE",
  });

  if (existingActive) {
    throw ApiError.badRequest(
      "Tenant already has an active subscription"
    );
  }

  return TenantSubscription.create({
    tenant: tenantId,
    plan: planId,
    provider,
    orderId,
    amount,
    currency,
    status: "PENDING",
  }) as Promise<ITenantSubscriptionDocument>;
}

export async function getPendingSubscriptionByOrder(
  orderId: string
): Promise<ITenantSubscriptionDocument> {
  const subscription = await TenantSubscription.findOne({
    orderId,
    status: "PENDING",
  }).populate("plan");
  if (!subscription) {
    throw ApiError.badRequest(
      "Pending subscription not found for this order"
    );
  }
  return subscription as ITenantSubscriptionDocument;
}

export async function getActiveSubscriptionForTenant(
  tenantId: Types.ObjectId | string | undefined
): Promise<ITenantSubscriptionDocument | null> {
  if (!tenantId) {
    return null;
  }
  return TenantSubscription.findOne({
    tenant: tenantId,
    status: "ACTIVE",
  })
    .sort({ startDate: -1 })
    .populate("plan") as Promise<ITenantSubscriptionDocument | null>;
}

function calculateEndDate(billingCycle = "monthly"): Date {
  const start = new Date();
  if (billingCycle === "yearly") {
    start.setFullYear(start.getFullYear() + 1);
  } else {
    start.setMonth(start.getMonth() + 1);
  }
  return start;
}

export async function activateSubscription({
  subscription,
  paymentId,
}: {
  subscription: ITenantSubscriptionDocument;
  paymentId: string;
}): Promise<ITenantSubscriptionDocument> {
  subscription.status = "ACTIVE";
  subscription.paymentId = paymentId;
  subscription.startDate = new Date();
  subscription.endDate = calculateEndDate(
    (subscription.plan as unknown as { billingCycle?: string })?.billingCycle
  );
  await subscription.save();
  return subscription;
}

export async function resolvePlanForTenant(
  tenantId: Types.ObjectId | string
): Promise<{
  plan: ISubscriptionPlanDocument | null;
  source: string | null;
}> {
  const subscription = await getActiveSubscriptionForTenant(tenantId);
  if (subscription) {
    return {
      plan: subscription.plan as unknown as ISubscriptionPlanDocument,
      source: "ACTIVE_SUBSCRIPTION",
    };
  }

  const tenant = await Tenant.findById(tenantId);
  if (tenant?.pendingPlanCode) {
    const plan = await SubscriptionPlan.findOne({
      planCode: tenant.pendingPlanCode,
    });
    if (plan) {
      return {
        plan: plan as ISubscriptionPlanDocument,
        source: "PENDING_PLAN",
      };
    }
  }

  return { plan: null, source: null };
}

export async function listPlans(): Promise<
  Array<{
    code: string;
    name: string;
    description: string;
    price: string;
    validity: string;
    billingCycle: string;
    currency: string;
    amount: number;
    maxBranches: number | null;
    maxEmployees: number | null;
    features: string[];
  }>
> {
  await ensureDefaultPlansSeeded();
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({
    price: 1,
  });
  return plans.map((plan) => ({
    code: plan.planCode,
    name: plan.planName,
    description: plan.description,
    price: formatPlanPrice(plan as ISubscriptionPlanDocument),
    validity: plan.billingCycle === "yearly" ? "Yearly" : "Monthly",
    billingCycle: plan.billingCycle,
    currency: plan.currency,
    amount: plan.price,
    maxBranches: plan.maxBranches,
    maxEmployees: plan.maxEmployees,
    features: PLAN_FEATURES[plan.planCode] || [],
  }));
}
