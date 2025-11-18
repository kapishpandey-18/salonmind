const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "hair",
        "nails",
        "facial",
        "massage",
        "makeup",
        "waxing",
        "spa",
        "other",
      ],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Duration is required"],
      min: 15,
    },
    image: {
      type: String,
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPackage: {
      type: Boolean,
      default: false,
    },
    packageServices: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    supplies: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    bookingCount: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
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
serviceSchema.index({ category: 1, salon: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ name: "text", description: "text" });
serviceSchema.index({ bookingCount: -1 });
serviceSchema.index({ revenue: -1 });

// Method to increment booking count
serviceSchema.methods.incrementBooking = function (amount) {
  this.bookingCount += 1;
  this.revenue += amount;
  return this.save();
};

module.exports = mongoose.model("Service", serviceSchema);
