const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    surface: {
      type: String,
      enum: ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"],
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdByIp: String,
    userAgent: String,
    revokedAt: Date,
    revokedReason: String,
    lastUsedAt: Date,
  },
  {
    timestamps: true,
  }
);

sessionSchema.methods.revoke = function (reason) {
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
};

module.exports = mongoose.model("Session", sessionSchema);
