const mongoose = require("mongoose");

const tenantProductSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    usage: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "",
      trim: true,
    },
    supplier: {
      type: String,
      default: "",
      trim: true,
    },
    lastRestocked: {
      type: Date,
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

tenantProductSchema.index({ tenant: 1, branch: 1, isDeleted: 1 });

module.exports = mongoose.model("TenantProductItem", tenantProductSchema);
