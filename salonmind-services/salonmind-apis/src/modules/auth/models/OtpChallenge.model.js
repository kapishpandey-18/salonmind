const mongoose = require("mongoose");

const SURFACES = ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"];
const STATUSES = ["ACTIVE", "USED", "LOCKED"];

const otpChallengeSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    surface: {
      type: String,
      enum: SURFACES,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "ACTIVE",
      index: true,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    lockReason: {
      type: String,
    },
    meta: {
      ip: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OtpChallenge", otpChallengeSchema);
