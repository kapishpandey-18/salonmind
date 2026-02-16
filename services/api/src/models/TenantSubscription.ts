import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { SubscriptionStatus } from "../types/index.js";

export interface ITenantSubscription {
  tenant: Types.ObjectId;
  plan: Types.ObjectId;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  provider: string;
  orderId: string;
  paymentId?: string;
  currency: string;
  amount: number;
  metadata: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export type ITenantSubscriptionDocument = Document<
  Types.ObjectId,
  object,
  ITenantSubscription
> &
  ITenantSubscription;

const tenantSubscriptionSchema = new Schema<ITenantSubscription>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    provider: {
      type: String,
      default: "RAZORPAY",
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
    },
    currency: {
      type: String,
      default: "INR",
    },
    amount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

tenantSubscriptionSchema.index({ tenant: 1, status: 1 });

export default mongoose.model<ITenantSubscription>(
  "TenantSubscription",
  tenantSubscriptionSchema
);
