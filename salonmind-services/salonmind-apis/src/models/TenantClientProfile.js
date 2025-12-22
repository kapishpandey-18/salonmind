const mongoose = require("mongoose");

const tenantClientSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tenantClientSchema.index({ tenant: 1, phoneNumber: 1 }, { unique: true });
tenantClientSchema.index({ tenant: 1, fullName: 1 });
tenantClientSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });

module.exports = mongoose.model("TenantClientProfile", tenantClientSchema);
