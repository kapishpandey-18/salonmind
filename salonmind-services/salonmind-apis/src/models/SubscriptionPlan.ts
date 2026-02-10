import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ISubscriptionPlan {
  planCode: string;
  planName: string;
  description: string;
  currency: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  maxBranches: number;
  maxEmployees: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ISubscriptionPlanDocument = Document<
  Types.ObjectId,
  object,
  ISubscriptionPlan
> &
  ISubscriptionPlan;

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    planCode: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    planName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    price: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    maxBranches: {
      type: Number,
      default: 1,
    },
    maxEmployees: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
