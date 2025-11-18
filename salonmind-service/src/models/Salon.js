const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Salon name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contact: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      website: String,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },
    businessHours: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        isOpen: {
          type: Boolean,
          default: true,
        },
        openTime: String, // "09:00"
        closeTime: String, // "20:00"
      },
    ],
    services: {
      type: [String],
      enum: ["hair", "nails", "facial", "massage", "makeup", "waxing", "spa"],
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended", "trial"],
        default: "trial",
      },
      startDate: Date,
      endDate: Date,
    },
    settings: {
      currency: {
        type: String,
        default: "INR",
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },
      bookingSlotDuration: {
        type: Number,
        default: 30, // minutes
      },
      advanceBookingDays: {
        type: Number,
        default: 30,
      },
      cancellationPolicy: String,
      reminderTime: {
        type: Number,
        default: 24, // hours before appointment
      },
    },
    stats: {
      totalClients: {
        type: Number,
        default: 0,
      },
      totalAppointments: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
salonSchema.index({ owner: 1 });
salonSchema.index({ "contact.email": 1 });
salonSchema.index({ isActive: 1 });

module.exports = mongoose.model("Salon", salonSchema);
