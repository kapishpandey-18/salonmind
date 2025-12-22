const mongoose = require("mongoose");

const tenantServiceSchema = new mongoose.Schema(
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
    category: {
      type: String,
      trim: true,
      default: "general",
    },
    duration: {
      type: Number,
      default: 60,
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
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
    bookings: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tenantServiceSchema.index({ tenant: 1, branch: 1, name: 1 });
tenantServiceSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });
tenantServiceSchema.index({ tenant: 1, branch: 1, isActive: 1 });

module.exports = mongoose.model("TenantServiceItem", tenantServiceSchema);
