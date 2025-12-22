const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    surface: {
      type: String,
      enum: ["ADMIN", "SALON_OWNER", "SALON_EMPLOYEE"],
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },
    replacedByTokenHash: {
      type: String,
    },
    createdByIp: String,
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.methods.isActive = function () {
  return !this.revokedAt && new Date() < this.expiresAt;
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
