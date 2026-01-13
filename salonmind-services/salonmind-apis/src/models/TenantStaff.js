const mongoose = require("mongoose");

const tenantStaffSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tenantStaffSchema.index({ tenant: 1, branch: 1, name: 1 });
tenantStaffSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });
tenantStaffSchema.index({ tenant: 1, branch: 1, isActive: 1 });

module.exports = mongoose.model("TenantStaff", tenantStaffSchema);
