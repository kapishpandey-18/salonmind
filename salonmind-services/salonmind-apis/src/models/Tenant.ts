import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { TenantStatus, DayOfWeek } from "../types/index.js";

export interface ITenant {
  owner: Types.ObjectId;
  name: string;
  logoUrl: string;
  contact: {
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessHours: Array<{
    day: DayOfWeek;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  services: Array<{
    name: string;
    duration: string;
    price: number;
    category: string;
  }>;
  staff: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  settings: {
    currency: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    dailyReports: boolean;
    lowStockAlerts: boolean;
  };
  status: TenantStatus;
  defaultBranch?: Types.ObjectId;
  pendingPlanCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ITenantDocument = Document<Types.ObjectId, object, ITenant> &
  ITenant;

const addressSchema = new Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const businessHourSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      lowercase: true,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "18:00" },
  },
  { _id: false }
);

const onboardingServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    duration: { type: String, default: "60" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "general" },
  },
  { _id: false }
);

const onboardingStaffSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "stylist" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const tenantSchema = new Schema<ITenant>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "Pending Salon Setup",
      trim: true,
    },
    logoUrl: { type: String, default: "" },
    contact: { type: contactSchema, default: () => ({}) },
    address: { type: addressSchema, default: () => ({}) },
    businessHours: {
      type: [businessHourSchema],
      default: () => [],
    },
    services: {
      type: [onboardingServiceSchema],
      default: () => [],
    },
    staff: {
      type: [onboardingStaffSchema],
      default: () => [],
    },
    settings: {
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
      dailyReports: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE"],
      default: "PENDING",
    },
    defaultBranch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
    pendingPlanCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITenant>("Tenant", tenantSchema);
