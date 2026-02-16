import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { TenantClientStatus } from "../types/index.js";

export interface ITenantClientProfile {
  tenant: Types.ObjectId;
  branch: Types.ObjectId;
  fullName: string;
  email?: string;
  phoneNumber: string;
  gender?: "male" | "female" | "other";
  dob?: Date;
  status: TenantClientStatus;
  visitsCount: number;
  totalSpent: number;
  lastVisit?: Date;
  lastVisitBranch?: Types.ObjectId;
  address?: {
    city?: string;
    state?: string;
  };
  notes?: string;
  tags: string[];
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITenantClientProfileDocument = Document<
  Types.ObjectId,
  object,
  ITenantClientProfile
> &
  ITenantClientProfile;

const tenantClientSchema = new Schema<ITenantClientProfile>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["vip", "active", "new"],
      default: "active",
    },
    visitsCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
    },
    lastVisitBranch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
    address: {
      city: String,
      state: String,
    },
    notes: String,
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tenantClientSchema.index({ tenant: 1, phoneNumber: 1 }, { unique: true });
tenantClientSchema.index({ tenant: 1, fullName: 1 });
tenantClientSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });

export default mongoose.model<ITenantClientProfile>(
  "TenantClientProfile",
  tenantClientSchema
);
