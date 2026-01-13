const mongoose = require("mongoose");

const tenantAppointmentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantClientProfile",
      required: true,
    },
    clientNameSnapshot: {
      type: String,
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TenantServiceItem",
      required: true,
    },
    serviceNameSnapshot: {
      type: String,
      required: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
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
          type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tenantAppointmentSchema.index({ tenant: 1, branch: 1, date: 1 });
tenantAppointmentSchema.index({ tenant: 1, branch: 1, startAt: 1 });
tenantAppointmentSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });

module.exports = mongoose.model(
  "TenantAppointmentRecord",
  tenantAppointmentSchema
);
