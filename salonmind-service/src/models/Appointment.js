const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Staff member is required"],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    startTime: {
      type: String, // Format: "HH:MM"
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String, // Format: "HH:MM"
      required: [true, "End time is required"],
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "wallet", "other"],
    },
    notes: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
appointmentSchema.index({ date: 1, salon: 1 });
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ staff: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound index for checking conflicts
appointmentSchema.index({ staff: 1, date: 1, startTime: 1, endTime: 1 });

// Method to check for conflicts
appointmentSchema.statics.checkConflict = async function (
  staffId,
  date,
  startTime,
  endTime,
  excludeId = null
) {
  const query = {
    staff: staffId,
    date: date,
    status: { $nin: ["cancelled", "no_show"] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

// Method to mark as completed
appointmentSchema.methods.markCompleted = function () {
  this.status = "completed";
  return this.save();
};

// Method to cancel
appointmentSchema.methods.cancel = function (userId, reason) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  return this.save();
};

module.exports = mongoose.model("Appointment", appointmentSchema);
