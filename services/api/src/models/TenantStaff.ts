import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { StaffStatus } from "../types/index.js";

export interface ITenantStaff {
  tenant: Types.ObjectId;
  branch: Types.ObjectId;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialties: string[];
  rating: number;
  reviews: number;
  appointmentsToday: number;
  appointmentsWeek: number;
  revenue: number;
  availability: number;
  compensation: {
    monthlySalary: number;
    commissionPercent: number;
  };
  status: StaffStatus;
  notes?: string;
  joiningDate?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITenantStaffDocument = Document<
  Types.ObjectId,
  object,
  ITenantStaff
> &
  ITenantStaff;

const tenantStaffSchema = new Schema<ITenantStaff>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "Staff",
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: String,
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    appointmentsToday: {
      type: Number,
      default: 0,
    },
    appointmentsWeek: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    compensation: {
      monthlySalary: {
        type: Number,
        min: 0,
        default: 0,
      },
      commissionPercent: {
        type: Number,
        enum: [0, 5, 10, 15, 20],
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["active", "off"],
      default: "active",
    },
    notes: String,
    joiningDate: {
      type: Date,
    },
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

tenantStaffSchema.index({ tenant: 1, branch: 1, name: 1 });
tenantStaffSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });
tenantStaffSchema.index({ tenant: 1, branch: 1, isActive: 1 });

export default mongoose.model<ITenantStaff>("TenantStaff", tenantStaffSchema);
