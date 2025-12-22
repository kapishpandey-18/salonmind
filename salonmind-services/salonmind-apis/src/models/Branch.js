const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

branchSchema.index({ tenant: 1, isActive: 1 });
branchSchema.index({ tenant: 1, isDefault: 1 });

module.exports = mongoose.model("Branch", branchSchema);
