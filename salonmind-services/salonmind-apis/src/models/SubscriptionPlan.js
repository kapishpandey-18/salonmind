const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planCode: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    planName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    price: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    maxBranches: {
      type: Number,
      default: 1,
    },
    maxEmployees: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
