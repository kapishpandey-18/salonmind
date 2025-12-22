const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    avatar: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    notes: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    preferences: {
      preferredStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      preferredServices: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
      ],
      allergies: [String],
      skinType: String,
      hairType: String,
    },
    visitHistory: [
      {
        appointment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Appointment",
        },
        visitDate: Date,
        servicesReceived: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
          },
        ],
        amountSpent: Number,
        notes: String,
      },
    ],
    totalVisits: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
clientSchema.index({ phoneNumber: 1, salon: 1 });
clientSchema.index({ email: 1, salon: 1 });
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

// Virtual for full name
clientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName || ""}`.trim();
});

// Method to add visit
clientSchema.methods.addVisit = function (appointmentId, services, amount) {
  this.visitHistory.push({
    appointment: appointmentId,
    visitDate: new Date(),
    servicesReceived: services,
    amountSpent: amount,
  });
  this.totalVisits += 1;
  this.totalSpent += amount;
  this.lastVisit = new Date();
  return this.save();
};

// Method to calculate loyalty points
clientSchema.methods.addLoyaltyPoints = function (amount) {
  // 1 point for every $10 spent
  const points = Math.floor(amount / 10);
  this.loyaltyPoints += points;
  return this.save();
};

// Ensure virtual fields are serialized
clientSchema.set("toJSON", { virtuals: true });
clientSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Client", clientSchema);
