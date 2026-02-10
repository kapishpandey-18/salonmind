import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { TenantAppointmentStatus, PaymentMethod } from "../types/index.js";

export interface ITenantAppointmentRecord {
  tenant: Types.ObjectId;
  branch: Types.ObjectId;
  client: Types.ObjectId;
  clientNameSnapshot: string;
  service: Types.ObjectId;
  serviceNameSnapshot: string;
  staff: Types.ObjectId;
  staffNameSnapshot: string;
  services: Array<{
    service: Types.ObjectId;
    name: string;
    duration?: number;
    price?: number;
  }>;
  startAt: Date;
  endAt: Date;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  totalAmount: number;
  status: TenantAppointmentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  cancellationReason?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITenantAppointmentRecordDocument = Document<
  Types.ObjectId,
  object,
  ITenantAppointmentRecord
> &
  ITenantAppointmentRecord;

const tenantAppointmentSchema = new Schema<ITenantAppointmentRecord>(
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
    client: {
      type: Schema.Types.ObjectId,
      ref: "TenantClientProfile",
      required: true,
    },
    clientNameSnapshot: {
      type: String,
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "TenantServiceItem",
      required: true,
    },
    serviceNameSnapshot: {
      type: String,
      required: true,
    },
    staff: {
      type: Schema.Types.ObjectId,
      ref: "TenantStaff",
      required: true,
    },
    staffNameSnapshot: {
      type: String,
      required: true,
    },
    services: [
      {
        service: {
          type: Schema.Types.ObjectId,
          ref: "TenantServiceItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        duration: Number,
        price: Number,
      },
    ],
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "wallet", "other"],
    },
    notes: String,
    cancellationReason: String,
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

tenantAppointmentSchema.index({ tenant: 1, branch: 1, date: 1 });
tenantAppointmentSchema.index({ tenant: 1, branch: 1, startAt: 1 });
tenantAppointmentSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });

export default mongoose.model<ITenantAppointmentRecord>(
  "TenantAppointmentRecord",
  tenantAppointmentSchema
);
